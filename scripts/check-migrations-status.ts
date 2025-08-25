import { supabase } from '../src/lib/supabase';

async function checkMigrationsStatus() {
  console.log('🔍 Verificando status das migrações...');
  
  if (!supabase) {
    console.log('❌ Cliente Supabase não está configurado');
    return;
  }

  try {
    // Verificar migrações executadas
    console.log('\n📋 Migrações marcadas como executadas:');
    const { data: migrations, error: migrationsError } = await supabase.rpc('execute_sql_query', {
      sql_query: `
        SELECT filename, executed_at 
        FROM migrations 
        ORDER BY filename
      `
    });
    
    if (migrationsError) {
      console.error('❌ Erro ao buscar migrações:', migrationsError);
      return;
    }
    
    if (migrations && migrations.length > 0) {
      console.log(`\n📊 Total de migrações executadas: ${migrations.length}`);
      migrations.forEach((migration: any) => {
        console.log(`  ✅ ${migration.filename} - ${migration.executed_at}`);
      });
    } else {
      console.log('\n❌ Nenhuma migração encontrada na tabela migrations');
    }
    
    // Verificar tabelas existentes
    console.log('\n📋 Tabelas existentes no banco:');
    const { data: tables, error: tablesError } = await supabase.rpc('execute_sql_query', {
      sql_query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `
    });
    
    if (tablesError) {
      console.error('❌ Erro ao buscar tabelas:', tablesError);
      return;
    }
    
    if (tables && tables.length > 0) {
      console.log(`\n📊 Total de tabelas encontradas: ${tables.length}`);
      tables.forEach((table: any) => {
        console.log(`  📋 ${table.table_name}`);
      });
    } else {
      console.log('\n❌ Nenhuma tabela encontrada');
    }
    
    // Verificar se há discrepância
    const expectedTables = [
      'migrations', 'provedores', 'tipos_acesso', 'revendedores', 'clientes', 
      'usuarios', 'origens_leads', 'mensagens', 'etapas_funil', 'status_negociacao',
      'qualificacao', 'followup', 'leads', 'controle_envios_diarios', 'parametros',
      'configuracoes', 'evolution_api', 'n8n_chat_histories', 'configuracoes_followup'
    ];
    
    const existingTableNames = tables ? tables.map((t: any) => t.table_name) : [];
    const missingTables = expectedTables.filter(table => !existingTableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.log('\n❌ Tabelas esperadas mas não encontradas:');
      missingTables.forEach(table => {
        console.log(`  ❌ ${table}`);
      });
    } else {
      console.log('\n✅ Todas as tabelas esperadas foram encontradas!');
    }

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

checkMigrationsStatus().then(() => {
  console.log('\n✅ Verificação concluída');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});