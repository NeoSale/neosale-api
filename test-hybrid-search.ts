import { supabase } from './src/lib/supabase'
import { generateOpenAIEmbedding } from './src/lib/openai'

async function testHybridSearch() {
  try {
    console.log('🔍 Testando busca híbrida (texto + semântica)...\n')

    const clienteId = 'f029ad69-3465-454e-ba85-e0cdb75c445f'
    const baseIds = ['1b87c1a9-ced5-4760-98ef-6a97e464cd24']
    const queryText = 'o que diz o art. 77 da Lei Complementar 214/2025?'
    const searchText = 'Art. 77'  // Texto para busca híbrida
    const matchCount = 10

    console.log('📋 Parâmetros da busca:')
    console.log(`   Cliente ID: ${clienteId}`)
    console.log(`   Base IDs: ${baseIds.join(', ')}`)
    console.log(`   Consulta: "${queryText}"`)
    console.log(`   Busca por texto: "${searchText}"`)
    console.log(`   Limite de resultados: ${matchCount}\n`)

    if (!supabase) {
      throw new Error('Conexão com Supabase não estabelecida')
    }

    // Gerar embedding da consulta
    console.log('⏳ Gerando embedding da consulta...')
    const startEmbedding = Date.now()
    const queryEmbedding = await generateOpenAIEmbedding(queryText)
    const endEmbedding = Date.now()
    console.log(`✅ Embedding gerado em ${endEmbedding - startEmbedding}ms\n`)

    // Teste 1: Busca semântica pura (sem texto)
    console.log('═'.repeat(80))
    console.log('🔍 TESTE 1: Busca Semântica Pura (sem filtro de texto)')
    console.log('═'.repeat(80))
    
    const startSemantic = Date.now()
    const { data: semanticResults, error: semanticError } = await supabase.rpc('hybrid_search_documentos', {
      filter: {
        cliente_id: clienteId,
        base_id: baseIds
      },
      match_count: matchCount,
      query_embedding: queryEmbedding,
      query_text: null  // Sem busca por texto
    })
    const endSemantic = Date.now()

    if (semanticError) {
      console.error('❌ Erro:', semanticError)
    } else {
      console.log(`✅ Busca concluída em ${endSemantic - startSemantic}ms`)
      console.log(`📄 ${semanticResults.length} resultados\n`)

      const chunk12Semantic = semanticResults.find((r: any) => r.metadata.id === 'fa435ec8-4895-4097-8a50-9aa21f6784ce')
      if (chunk12Semantic) {
        const pos = semanticResults.findIndex((r: any) => r.metadata.id === 'fa435ec8-4895-4097-8a50-9aa21f6784ce') + 1
        console.log(`✅ Chunk 12 (Art. 77) encontrado na posição ${pos}`)
        console.log(`   Similaridade: ${(chunk12Semantic.similarity * 100).toFixed(2)}%`)
      } else {
        console.log(`❌ Chunk 12 (Art. 77) NÃO encontrado no top ${matchCount}`)
      }
    }

    // Teste 2: Busca híbrida (com texto)
    console.log('\n' + '═'.repeat(80))
    console.log('🔍 TESTE 2: Busca Híbrida (texto + semântica)')
    console.log('═'.repeat(80))
    
    const startHybrid = Date.now()
    const { data: hybridResults, error: hybridError } = await supabase.rpc('hybrid_search_documentos', {
      filter: {
        cliente_id: clienteId,
        base_id: baseIds
      },
      match_count: matchCount,
      query_embedding: queryEmbedding,
      query_text: searchText  // COM busca por texto
    })
    const endHybrid = Date.now()

    if (hybridError) {
      console.error('❌ Erro:', hybridError)
      return
    }

    console.log(`✅ Busca concluída em ${endHybrid - startHybrid}ms`)
    console.log(`📄 ${hybridResults.length} resultados\n`)

    // Mostrar resultados
    console.log('Top 10 resultados:')
    console.log('─'.repeat(80))

    hybridResults.forEach((item: any, index: number) => {
      const metadata = item.metadata
      const similarity = (item.similarity * 100).toFixed(2)
      const combinedScore = (item.combined_score * 100).toFixed(2)
      const textMatch = item.text_match ? '📝' : '  '
      const isChunk12 = metadata.id === 'fa435ec8-4895-4097-8a50-9aa21f6784ce' ? '🎯' : '  '

      console.log(`\n${textMatch}${isChunk12} ${index + 1}. ${metadata.nome}`)
      console.log(`   ID: ${metadata.id}`)
      console.log(`   Chunk: ${metadata.chunk_index + 1} de ${metadata.total_chunks}`)
      console.log(`   Similaridade: ${similarity}%`)
      console.log(`   Score combinado: ${combinedScore}%`)
      if (item.text_match) {
        console.log(`   ✅ Match de texto: "${searchText}"`)
      }
    })

    // Validação
    console.log('\n' + '═'.repeat(80))
    console.log('🎯 RESULTADO DA VALIDAÇÃO')
    console.log('═'.repeat(80))

    const chunk12Hybrid = hybridResults.find((r: any) => r.metadata.id === 'fa435ec8-4895-4097-8a50-9aa21f6784ce')
    
    if (chunk12Hybrid) {
      const position = hybridResults.findIndex((r: any) => r.metadata.id === 'fa435ec8-4895-4097-8a50-9aa21f6784ce') + 1
      console.log(`\n✅ SUCESSO! Chunk 12 (Art. 77) encontrado!`)
      console.log(`   Posição: ${position}º lugar`)
      console.log(`   Similaridade: ${(chunk12Hybrid.similarity * 100).toFixed(2)}%`)
      console.log(`   Score combinado: ${(chunk12Hybrid.combined_score * 100).toFixed(2)}%`)
      console.log(`   Match de texto: ${chunk12Hybrid.text_match ? 'Sim ✅' : 'Não'}`)

      if (position === 1) {
        console.log(`\n   🏆 PERFEITO! É o primeiro resultado!`)
      } else if (position <= 3) {
        console.log(`\n   ✅ Excelente! Está no top 3!`)
      } else if (position <= 5) {
        console.log(`\n   ✅ Bom! Está no top 5!`)
      }
    } else {
      console.log(`\n❌ FALHA! Chunk 12 (Art. 77) não foi encontrado`)
    }

    console.log('═'.repeat(80))

  } catch (error: any) {
    console.error('❌ Erro:', error.message || error)
    console.error(error)
  }
}

testHybridSearch()
  .then(() => {
    console.log('\n👋 Finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
