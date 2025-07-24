#!/usr/bin/env node

/**
 * Script simples para verificar se o Docker está disponível
 * Não tenta iniciar automaticamente, apenas verifica o status
 */

const { exec } = require('child_process');

function checkDocker() {
  return new Promise((resolve) => {
    console.log('🐳 Verificando se Docker está disponível...');
    
    exec('docker --version', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Docker não está instalado ou não está no PATH');
        console.log('📥 Instale o Docker Desktop: https://www.docker.com/products/docker-desktop');
        resolve(false);
        return;
      }
      
      console.log('✅ Docker está instalado:', stdout.trim());
      
      // Verifica se o daemon está rodando
      exec('docker info', (error2, stdout2, stderr2) => {
        if (error2) {
          console.log('❌ Docker daemon não está rodando');
          console.log('🚀 Para iniciar o Docker:');
          console.log('   • Windows: Execute "npm run docker:start"');
          console.log('   • Ou abra o Docker Desktop manualmente');
          resolve(false);
        } else {
          console.log('✅ Docker daemon está rodando');
          resolve(true);
        }
      });
    });
  });
}

// Executa se chamado diretamente
if (require.main === module) {
  checkDocker().then(isRunning => {
    process.exit(isRunning ? 0 : 1);
  });
}

module.exports = checkDocker;