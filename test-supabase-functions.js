#!/usr/bin/env node

// Script para testar as funções RPC do Supabase
// Execute com: node test-supabase-functions.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function testSupabaseFunctions() {
  console.log('🔍 Testando conectividade e funções do Supabase...');
  console.log('=' .repeat(60));
  
  try {
    // 1. Testar conectividade básica
    console.log('\n1. 🌐 Testando conectividade básica...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('migrations')
      .select('*')
      .limit(1);
    
    if (healthError) {
      if (healthError.message.includes('relation "migrations" does not exist')) {
        console.log('⚠️  Tabela migrations não existe - isso é esperado se ainda não foi criada');
      } else {
        console.log('❌ Erro de conectividade:', healthError.message);
        return;
      }
    } else {
      console.log('✅ Conectividade OK - tabela migrations existe');
      console.log(`   Migrações registradas: ${healthCheck?.length || 0}`);
    }
    
    // 2. Testar função execute_sql
    console.log('\n2. ⚙️  Testando função execute_sql...');
    const { data: executeTest, error: executeError } = await supabase
      .rpc('execute_sql', { sql_query: 'SELECT 1 as test' });
    
    if (executeError) {
      if (executeError.code === 'PGRST202') {
        console.log('❌ Função execute_sql não existe');
        console.log('   Execute o script setup_supabase_functions.sql primeiro');
      } else {
        console.log('❌ Erro ao executar função:', executeError.message);
      }
    } else {
      console.log('✅ Função execute_sql funcionando');
    }
    
    // 3. Testar função table_exists
    console.log('\n3. 📋 Testando função table_exists...');
    const { data: tableTest, error: tableError } = await supabase
      .rpc('table_exists', { table_name: 'migrations' });
    
    if (tableError) {
      if (tableError.code === 'PGRST202') {
        console.log('❌ Função table_exists não existe');
      } else {
        console.log('❌ Erro ao testar table_exists:', tableError.message);
      }
    } else {
      console.log(`✅ Função table_exists funcionando: ${tableTest}`);
    }
    
    // 4. Testar função column_exists
    console.log('\n4. 📝 Testando função column_exists...');
    const { data: columnTest, error: columnError } = await supabase
      .rpc('column_exists', { table_name: 'migrations', column_name: 'filename' });
    
    if (columnError) {
      if (columnError.code === 'PGRST202') {
        console.log('❌ Função column_exists não existe');
      } else {
        console.log('❌ Erro ao testar column_exists:', columnError.message);
      }
    } else {
      console.log(`✅ Função column_exists funcionando: ${columnTest}`);
    }
    
    // 5. Testar função index_exists
    console.log('\n5. 🔍 Testando função index_exists...');
    const { data: indexTest, error: indexError } = await supabase
      .rpc('index_exists', { index_name: 'idx_migrations_filename' });
    
    if (indexError) {
      if (indexError.code === 'PGRST202') {
        console.log('❌ Função index_exists não existe');
      } else {
        console.log('❌ Erro ao testar index_exists:', indexError.message);
      }
    } else {
      console.log(`✅ Função index_exists funcionando: ${indexTest}`);
    }
    
    // 6. Listar tabelas existentes
    console.log('\n6. 📊 Listando tabelas existentes...');
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('execute_sql', { 
        sql_query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name
        `
      });
    
    if (tablesError) {
      console.log('❌ Não foi possível listar tabelas');
    } else {
      console.log('✅ Tabelas encontradas no banco:');
      // Note: execute_sql não retorna dados, então vamos tentar uma abordagem diferente
      try {
        const { data: directTables } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
        
        if (directTables && directTables.length > 0) {
          directTables.forEach(table => {
            console.log(`   - ${table.table_name}`);
          });
        } else {
          console.log('   Nenhuma tabela encontrada ou acesso negado');
        }
      } catch (err) {
        console.log('   Não foi possível acessar information_schema diretamente');
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 RESUMO DO DIAGNÓSTICO:');
    console.log('=' .repeat(60));
    
    const functionsExist = !executeError && !tableError && !columnError && !indexError;
    
    if (functionsExist) {
      console.log('✅ Todas as funções RPC estão funcionando');
      console.log('✅ Sistema de migrações automáticas está pronto');
      console.log('\n🚀 Você pode executar: npm run migrate');
    } else {
      console.log('❌ Algumas funções RPC não estão disponíveis');
      console.log('\n🔧 AÇÕES NECESSÁRIAS:');
      console.log('1. Execute o script setup_supabase_functions.sql no Supabase SQL Editor');
      console.log('2. Execute o script manual_migrations.sql para criar a tabela migrations');
      console.log('3. Execute este teste novamente: node test-supabase-functions.js');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar o teste
testSupabaseFunctions().then(() => {
  console.log('\n✅ Teste concluído!');
}).catch(error => {
  console.error('❌ Erro durante o teste:', error);
  process.exit(1);
});