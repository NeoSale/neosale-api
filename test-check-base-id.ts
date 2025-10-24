import { supabase } from './src/lib/supabase'

async function checkBaseId() {
  try {
    console.log('🔍 Verificando formato do base_id...\n')

    const chunk12Id = 'fa435ec8-4895-4097-8a50-9aa21f6784ce'

    if (!supabase) {
      throw new Error('Conexão com Supabase não estabelecida')
    }

    const { data, error } = await supabase
      .from('documentos')
      .select('id, nome, base_id, cliente_id')
      .eq('id', chunk12Id)
      .single()

    if (error) {
      console.error('❌ Erro:', error)
      return
    }

    console.log('📄 Chunk 12:')
    console.log(`   ID: ${data.id}`)
    console.log(`   Nome: ${data.nome}`)
    console.log(`   Cliente ID: ${data.cliente_id}`)
    console.log(`\n   base_id:`)
    console.log(`   Tipo: ${typeof data.base_id}`)
    console.log(`   É array: ${Array.isArray(data.base_id)}`)
    console.log(`   Valor: ${JSON.stringify(data.base_id)}`)

    if (Array.isArray(data.base_id)) {
      console.log(`   Length: ${data.base_id.length}`)
      console.log(`   Valores: ${data.base_id.join(', ')}`)
    }

    // Testar se o base_id esperado está no array
    const expectedBaseId = '1b87c1a9-ced5-4760-98ef-6a97e464cd24'
    if (Array.isArray(data.base_id)) {
      const found = data.base_id.includes(expectedBaseId)
      console.log(`\n   Contém "${expectedBaseId}": ${found ? '✅ Sim' : '❌ Não'}`)
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message || error)
  }
}

checkBaseId()
  .then(() => {
    console.log('\n👋 Finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
