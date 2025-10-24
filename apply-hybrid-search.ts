import * as fs from 'fs'
import * as path from 'path'

async function applyHybridSearchMigration() {
  try {
    console.log('📦 Migration de Busca Híbrida\n')

    // Ler o arquivo de migration
    const migrationPath = path.join(__dirname, 'migrations', '032_add_hybrid_search.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration carregada:')
    console.log('   Arquivo: 032_add_hybrid_search.sql')
    console.log(`   Tamanho: ${migrationSQL.length} caracteres\n`)

    console.log('═'.repeat(80))
    console.log('⚠️  ATENÇÃO: Aplicação Manual Necessária')
    console.log('═'.repeat(80))
    console.log('\nPara aplicar esta migration, siga os passos:\n')
    console.log('1. Acesse o Supabase Dashboard')
    console.log('2. Vá em SQL Editor')
    console.log('3. Copie o conteúdo abaixo:')
    console.log('─'.repeat(80))
    console.log(migrationSQL)
    console.log('─'.repeat(80))
    console.log('\n4. Cole no SQL Editor')
    console.log('5. Clique em "Run" ou pressione Ctrl+Enter')
    console.log('\n✅ Após aplicar, execute: npx ts-node test-hybrid-search.ts\n')

  } catch (error: any) {
    console.error('❌ Erro:', error.message || error)
  }
}

applyHybridSearchMigration()
  .then(() => {
    console.log('👋 Instruções exibidas')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
