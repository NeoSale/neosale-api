import { supabase } from './src/lib/supabase'

async function checkEmbedding() {
  try {
    console.log('🔍 Verificando formato do embedding...\n')

    const chunk6Id = '3e2d29b7-06ee-4612-87b5-500f41018ce9'

    if (!supabase) {
      throw new Error('Conexão com Supabase não estabelecida')
    }

    const { data, error } = await supabase
      .from('documentos')
      .select('id, nome, embedding')
      .eq('id', chunk6Id)
      .single()

    if (error || !data) {
      console.error('❌ Erro:', error)
      return
    }

    console.log('📄 Documento:')
    console.log(`   ID: ${data.id}`)
    console.log(`   Nome: ${data.nome}`)
    console.log()

    console.log('🔍 Embedding:')
    console.log(`   Tipo: ${typeof data.embedding}`)
    console.log(`   É array: ${Array.isArray(data.embedding)}`)
    console.log(`   É null: ${data.embedding === null}`)
    console.log(`   É undefined: ${data.embedding === undefined}`)
    
    if (data.embedding) {
      console.log(`   Valor: ${JSON.stringify(data.embedding).substring(0, 200)}...`)
      
      if (typeof data.embedding === 'string') {
        console.log('\n⚠️  Embedding está como STRING, precisa ser convertido')
        try {
          const parsed = JSON.parse(data.embedding)
          console.log(`   Após parse - É array: ${Array.isArray(parsed)}`)
          console.log(`   Após parse - Length: ${parsed.length}`)
        } catch (e) {
          console.log(`   ❌ Erro ao fazer parse: ${e}`)
        }
      } else if (Array.isArray(data.embedding)) {
        console.log(`   ✅ Embedding é array`)
        console.log(`   Length: ${data.embedding.length}`)
        console.log(`   Primeiros 5 valores: [${data.embedding.slice(0, 5).join(', ')}]`)
      } else {
        console.log(`   ⚠️  Formato desconhecido`)
      }
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message || error)
  }
}

checkEmbedding()
  .then(() => {
    console.log('\n👋 Finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
