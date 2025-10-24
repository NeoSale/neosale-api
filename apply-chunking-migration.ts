import { supabase } from './src/lib/supabase'
import * as fs from 'fs'
import * as path from 'path'

async function applyMigration() {
  try {
    console.log('📦 Aplicando migration de chunking...\n')

    // Ler o arquivo de migration
    const migrationPath = path.join(__dirname, 'migrations', '031_add_documento_chunks.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration carregada:')
    console.log('   Arquivo: 031_add_documento_chunks.sql')
    console.log(`   Tamanho: ${migrationSQL.length} caracteres\n`)

    if (!supabase) {
      throw new Error('Conexão com Supabase não estabelecida')
    }

    // Executar a migration
    console.log('⏳ Executando migration...')
    
    const { error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    })

    if (error) {
      console.error('❌ Erro ao executar migration:', error)
      console.log('\n💡 Dica: Execute a migration manualmente no Supabase SQL Editor:')
      console.log('   1. Acesse o Supabase Dashboard')
      console.log('   2. Vá em SQL Editor')
      console.log('   3. Cole o conteúdo de migrations/031_add_documento_chunks.sql')
      console.log('   4. Execute o SQL')
      return
    }

    console.log('✅ Migration aplicada com sucesso!\n')
    console.log('📊 Mudanças aplicadas:')
    console.log('   ✅ Adicionada coluna: documento_pai_id')
    console.log('   ✅ Adicionada coluna: chunk_index')
    console.log('   ✅ Adicionada coluna: total_chunks')
    console.log('   ✅ Adicionada coluna: chunk_texto')
    console.log('   ✅ Criados índices para performance')
    console.log('   ✅ Atualizada função: match_documentos_by_base_cliente')

  } catch (error: any) {
    console.error('❌ Erro:', error.message || error)
  }
}

applyMigration()
  .then(() => {
    console.log('\n👋 Finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
