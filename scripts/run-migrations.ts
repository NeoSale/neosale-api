#!/usr/bin/env ts-node

// Carregar variáveis de ambiente
import dotenv from 'dotenv';
dotenv.config();

import { migrationRunner } from '../src/lib/migrations';

async function runMigrationsScript() {
  try {
    console.log('🔄 Executando migrations manualmente...');
    
    // Executar migrations
    await migrationRunner.runMigrations();
    
    // Tentar marcar migrations como executadas
    await migrationRunner.markMigrationsAsExecuted();
    
    console.log('✅ Script de migrations concluído!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error);
    process.exit(1);
  }
}

// Executar o script
runMigrationsScript();