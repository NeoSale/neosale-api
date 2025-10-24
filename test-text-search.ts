import { supabase } from './src/lib/supabase'

async function testTextSearch() {
  try {
    console.log('🔍 Testando busca por texto...\n')

    const clienteId = 'f029ad69-3465-454e-ba85-e0cdb75c445f'
    const chunk12Id = 'fa435ec8-4895-4097-8a50-9aa21f6784ce'

    if (!supabase) {
      throw new Error('Conexão com Supabase não estabelecida')
    }

    // Teste 1: Buscar diretamente no SQL
    console.log('═'.repeat(80))
    console.log('TESTE 1: Busca SQL Direta')
    console.log('═'.repeat(80))

    const searchTerms = ['Art. 77', 'Art.77', 'Art 77', 'art. 77', 'art 77']

    for (const term of searchTerms) {
      const { data, error } = await supabase
        .from('documentos')
        .select('id, nome, chunk_index')
        .eq('cliente_id', clienteId)
        .eq('deletado', false)
        .ilike('chunk_texto', `%${term}%`)

      if (error) {
        console.error(`\n❌ Erro ao buscar "${term}":`, error)
      } else {
        console.log(`\n"${term}": ${data.length} resultados`)
        const foundChunk12 = data.find(d => d.id === chunk12Id)
        if (foundChunk12) {
          console.log(`   ✅ Chunk 12 encontrado!`)
        } else {
          console.log(`   ❌ Chunk 12 NÃO encontrado`)
        }
      }
    }

    // Teste 2: Verificar o conteúdo exato do Chunk 12
    console.log('\n' + '═'.repeat(80))
    console.log('TESTE 2: Conteúdo do Chunk 12')
    console.log('═'.repeat(80))

    const { data: chunk12, error: chunk12Error } = await supabase
      .from('documentos')
      .select('chunk_texto')
      .eq('id', chunk12Id)
      .single()

    if (chunk12Error) {
      console.error('\n❌ Erro:', chunk12Error)
    } else if (chunk12?.chunk_texto) {
      const text = chunk12.chunk_texto
      console.log(`\nTamanho: ${text.length} caracteres`)
      
      // Procurar "Art. 77" no texto
      const index = text.indexOf('Art. 77')
      if (index >= 0) {
        console.log(`✅ "Art. 77" encontrado na posição ${index}`)
        const context = text.substring(Math.max(0, index - 50), Math.min(text.length, index + 100))
        console.log(`\nContexto:\n"${context}"`)
      } else {
        console.log(`❌ "Art. 77" NÃO encontrado no texto`)
        console.log(`\nPrimeiros 500 caracteres:`)
        console.log(`"${text.substring(0, 500)}"`)
      }
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message || error)
  }
}

testTextSearch()
  .then(() => {
    console.log('\n👋 Finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
