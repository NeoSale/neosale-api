const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkColumns() {
  try {
    console.log('🔍 Verificando se as colunas foram criadas...');
    
    // Verificar se a tabela evolution_instances existe
    const { data: tableExists, error: tableError } = await supabase.rpc('table_exists', {
      target_table: 'evolution_instances'
    });
    
    if (tableError) {
      console.log('❌ Erro ao verificar tabela:', tableError.message);
      return;
    }
    
    console.log('📋 Tabela evolution_instances existe:', tableExists);
    
    if (!tableExists) {
      console.log('❌ Tabela evolution_instances não existe!');
      return;
    }
    
    // Verificar cada coluna individualmente
    const columns = [
      'always_online',
      'groups_ignore', 
      'msg_call',
      'read_messages',
      'read_status',
      'reject_call',
      'sync_full_history'
    ];
    
    console.log('\n🔍 Verificando colunas individuais:');
    
    for (const column of columns) {
      const { data: columnExists, error: columnError } = await supabase.rpc('column_exists', {
        target_table: 'evolution_instances',
        target_column: column
      });
      
      if (columnError) {
        console.log(`❌ Erro ao verificar coluna ${column}:`, columnError.message);
      } else {
        console.log(`${columnExists ? '✅' : '❌'} Coluna ${column}: ${columnExists ? 'existe' : 'não existe'}`);
      }
    }
    
    // Tentar listar todas as colunas da tabela
    console.log('\n📊 Tentando listar todas as colunas da tabela evolution_instances...');
    
    const { data: allColumns, error: allColumnsError } = await supabase
      .from('evolution_instances')
      .select('*')
      .limit(0);
    
    if (allColumnsError) {
      console.log('❌ Erro ao acessar tabela:', allColumnsError.message);
    } else {
      console.log('✅ Tabela acessível');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkColumns();