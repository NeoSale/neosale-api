#!/usr/bin/env node

/**
 * Script para verificar e iniciar o Docker automaticamente
 * Funciona em Windows, macOS e Linux
 */

const { exec, spawn } = require('child_process');
const os = require('os');

class DockerManager {
  constructor() {
    this.platform = os.platform();
    console.log(`🐳 Verificando Docker no ${this.platform}...`);
  }

  /**
   * Verifica se o Docker está rodando
   */
  async isDockerRunning() {
    return new Promise((resolve) => {
      exec('docker info', (error, stdout, stderr) => {
        if (error) {
          console.log('❌ Docker não está rodando ou não está instalado');
          resolve(false);
        } else {
          console.log('✅ Docker está rodando');
          resolve(true);
        }
      });
    });
  }

  /**
   * Inicia o Docker baseado no sistema operacional
   */
  async startDocker() {
    console.log('🚀 Tentando iniciar o Docker...');
    
    return new Promise((resolve, reject) => {
      let command;
      let args = [];
      
      switch (this.platform) {
        case 'win32':
          // Windows - usa o script PowerShell dedicado
          command = 'powershell';
          args = ['-ExecutionPolicy', 'Bypass', '-File', 'scripts/start-docker.ps1'];
          break;
          
        case 'darwin':
          // macOS - tenta iniciar Docker Desktop
          command = 'open';
          args = ['-a', 'Docker'];
          break;
          
        case 'linux':
          // Linux - tenta iniciar o serviço docker
          command = 'sudo';
          args = ['systemctl', 'start', 'docker'];
          break;
          
        default:
          reject(new Error(`Sistema operacional ${this.platform} não suportado`));
          return;
      }
      
      const process = spawn(command, args, { stdio: 'inherit' });
      
      process.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Comando de inicialização do Docker executado');
          resolve(true);
        } else {
          console.log(`❌ Falha ao executar comando (código: ${code})`);
          reject(new Error(`Falha ao iniciar Docker (código: ${code})`));
        }
      });
      
      process.on('error', (error) => {
        console.error('❌ Erro ao executar comando:', error.message);
        reject(error);
      });
    });
  }

  /**
   * Aguarda o Docker ficar disponível
   */
  async waitForDocker(maxAttempts = 30, interval = 2000) {
    console.log('⏳ Aguardando Docker ficar disponível...');
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 Tentativa ${attempt}/${maxAttempts}`);
      
      if (await this.isDockerRunning()) {
        console.log('🎉 Docker está pronto!');
        return true;
      }
      
      if (attempt < maxAttempts) {
        console.log(`⏱️  Aguardando ${interval/1000}s antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    throw new Error('Timeout: Docker não ficou disponível no tempo esperado');
  }

  /**
   * Processo principal
   */
  async run() {
    try {
      // Verifica se já está rodando
      if (await this.isDockerRunning()) {
        console.log('🎯 Docker já está rodando!');
        return true;
      }
      
      // Tenta iniciar
      await this.startDocker();
      
      // Aguarda ficar disponível
      await this.waitForDocker();
      
      return true;
      
    } catch (error) {
      console.error('💥 Erro:', error.message);
      console.log('\n📋 Instruções manuais:');
      
      switch (this.platform) {
        case 'win32':
          console.log('   • Abra o Docker Desktop manualmente');
          console.log('   • Ou execute: "Docker Desktop.exe"');
          break;
          
        case 'darwin':
          console.log('   • Abra o Docker Desktop do Launchpad');
          console.log('   • Ou execute: open -a Docker');
          break;
          
        case 'linux':
          console.log('   • Execute: sudo systemctl start docker');
          console.log('   • Ou: sudo service docker start');
          break;
      }
      
      console.log('   • Verifique se o Docker está instalado corretamente');
      
      process.exit(1);
    }
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  const dockerManager = new DockerManager();
  dockerManager.run();
}

module.exports = DockerManager;