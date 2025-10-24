import { supabase } from './src/lib/supabase'
import { generateOpenAIEmbedding } from './src/lib/openai'

async function testHybridSimple() {
  try {
    console.log('🔍 Teste simples de busca híbrida...\n')

    const clienteId = 'f029ad69-3465-454e-ba85-e0cdb75c445f'
    const queryText = 'o que diz o art. 77 da Lei Complementar 214/2025?'
    const searchText = 'Art. 77'

    if (!supabase) {
      throw new Error('Conexão com Supabase não estabelecida')
    }

    // Gerar embedding
    console.log('⏳ Gerando embedding...')
    const queryEmbedding = await generateOpenAIEmbedding(queryText)
    console.log('✅ Embedding gerado\n')

    // Buscar SEM filtro de base_id
    console.log('🔎 Buscando (sem filtro de base_id)...')
    const { data, error } = await supabase.rpc('hybrid_search_documentos', {
      filter: {
        cliente_id: clienteId,
        base_id: []  // Array vazio
      },
      match_count: 10,
      query_embedding: queryEmbedding,
      query_text: searchText
    })

    if (error) {
      console.error('❌ Erro:', error)
      return
    }

    console.log(`✅ ${data.length} resultados\n`)

    // Verificar se encontrou o Chunk 12
    const chunk12 = data.find((r: any) => r.metadata.id === 'fa435ec8-4895-4097-8a50-9aa21f6784ce')
    
    if (chunk12) {
      const pos = data.findIndex((r: any) => r.metadata.id === 'fa435ec8-4895-4097-8a50-9aa21f6784ce') + 1
      console.log(`✅ Chunk 12 encontrado na posição ${pos}!`)
      console.log(`   Similaridade: ${(chunk12.similarity * 100).toFixed(2)}%`)
      console.log(`   Score combinado: ${(chunk12.combined_score * 100).toFixed(2)}%`)
      console.log(`   Match de texto: ${chunk12.text_match ? 'Sim ✅' : 'Não ❌'}`)
    } else {
      console.log(`❌ Chunk 12 NÃO encontrado`)
    }

    // Mostrar top 3
    console.log('\nTop 3:')
    data.slice(0, 3).forEach((item: any, i: number) => {
      const textMatch = item.text_match ? '📝' : '  '
      console.log(`${textMatch} ${i + 1}. ${item.metadata.nome} - ${(item.combined_score * 100).toFixed(2)}%`)
    })

  } catch (error: any) {
    console.error('❌ Erro:', error.message || error)
  }
}

testHybridSimple()
  .then(() => {
    console.log('\n👋 Finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
