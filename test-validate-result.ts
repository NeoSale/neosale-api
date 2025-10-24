import { supabase } from './src/lib/supabase'
import { generateOpenAIEmbedding } from './src/lib/openai'

async function validateSearchResult() {
  try {
    console.log('🔍 Validando resultado da busca...\n')

    const expectedDocId = 'fa435ec8-4895-4097-8a50-9aa21f6784ce' // Chunk 12 com Art. 77
    const clienteId = 'f029ad69-3465-454e-ba85-e0cdb75c445f'
    const baseIds = ['1b87c1a9-ced5-4760-98ef-6a97e464cd24']
    const queryText = 'o que diz o art. 77 da Lei Complementar 214/2025?'

    // Passo 1: Verificar se o documento existe
    console.log('📄 Verificando documento esperado...')
    if (!supabase) {
      throw new Error('Conexão com Supabase não estabelecida')
    }

    const { data: docData, error: docError } = await supabase
      .from('documentos')
      .select('*')
      .eq('id', expectedDocId)
      .single()

    if (docError || !docData) {
      console.error('❌ Documento não encontrado:', docError)
      return
    }

    console.log('✅ Documento encontrado:')
    console.log(`   ID: ${docData.id}`)
    console.log(`   Nome: ${docData.nome}`)
    console.log(`   Arquivo: ${docData.nome_arquivo}`)
    console.log(`   Chunk: ${docData.chunk_index + 1} de ${docData.total_chunks}`)
    if (docData.documento_pai_id) {
      console.log(`   Documento Pai: ${docData.documento_pai_id}`)
    }
    if (docData.chunk_texto) {
      console.log(`   Texto do chunk (primeiros 300 chars):`)
      console.log(`   "${docData.chunk_texto.substring(0, 300)}..."`)
    }
    console.log()

    // Passo 2: Gerar embedding e buscar
    console.log('⏳ Gerando embedding da consulta...')
    const queryEmbedding = await generateOpenAIEmbedding(queryText)
    console.log('✅ Embedding gerado\n')

    console.log('🔎 Buscando documentos similares...')
    const { data: searchResults, error: searchError } = await supabase.rpc('match_documentos_by_base_cliente', {
      filter: {
        cliente_id: clienteId,
        base_id: baseIds
      },
      match_count: 10, // Buscar top 10
      query_embedding: queryEmbedding
    })

    if (searchError) {
      console.error('❌ Erro na busca:', searchError)
      return
    }

    console.log(`✅ Busca concluída: ${searchResults.length} resultados\n`)

    // Passo 3: Verificar se o documento esperado está nos resultados
    console.log('═'.repeat(80))
    console.log('📊 VALIDAÇÃO DOS RESULTADOS')
    console.log('═'.repeat(80))

    let foundExpected = false
    let expectedPosition = -1

    searchResults.forEach((item: any, index: number) => {
      const metadata = item.metadata
      const similarity = (item.similarity * 100).toFixed(2)
      const isExpected = metadata.id === expectedDocId

      if (isExpected) {
        foundExpected = true
        expectedPosition = index + 1
      }

      const marker = isExpected ? '🎯' : '  '
      console.log(`\n${marker} ${index + 1}. ${metadata.nome}`)
      console.log(`   ID: ${metadata.id}`)
      console.log(`   Similaridade: ${similarity}%`)
      
      if (metadata.chunk_index !== undefined) {
        console.log(`   Chunk: ${metadata.chunk_index + 1} de ${metadata.total_chunks}`)
      }

      if (isExpected) {
        console.log(`   ✅ ESTE É O DOCUMENTO ESPERADO!`)
      }
    })

    console.log('\n' + '═'.repeat(80))
    console.log('🎯 RESULTADO DA VALIDAÇÃO')
    console.log('═'.repeat(80))

    if (foundExpected) {
      console.log(`✅ SUCESSO! O documento esperado foi encontrado!`)
      console.log(`   Posição no ranking: ${expectedPosition}º lugar`)
      console.log(`   ID: ${expectedDocId}`)
      
      const expectedResult = searchResults.find((r: any) => r.metadata.id === expectedDocId)
      const similarity = (expectedResult.similarity * 100).toFixed(2)
      console.log(`   Similaridade: ${similarity}%`)

      if (expectedPosition === 1) {
        console.log(`   🏆 Melhor resultado! A busca está perfeita!`)
      } else if (expectedPosition <= 3) {
        console.log(`   ✅ Entre os top 3! Boa precisão!`)
      } else if (expectedPosition <= 5) {
        console.log(`   ⚠️  Entre os top 5. Pode melhorar.`)
      } else {
        console.log(`   ⚠️  Fora do top 5. Similaridade pode estar baixa.`)
      }
    } else {
      console.log(`❌ FALHA! O documento esperado NÃO foi encontrado nos top 10 resultados.`)
      console.log(`   ID esperado: ${expectedDocId}`)
      console.log(`\n   Possíveis motivos:`)
      console.log(`   - O documento não tem embedding gerado`)
      console.log(`   - O base_id não corresponde`)
      console.log(`   - A similaridade é muito baixa (fora do top 10)`)
      console.log(`   - O documento está marcado como deletado`)
    }

    console.log('═'.repeat(80))

    // Passo 4: Calcular similaridade direta se não encontrado
    if (!foundExpected && docData.embedding) {
      console.log('\n🔬 Calculando similaridade direta...')
      
      // Calcular similaridade de cosseno manualmente
      const docEmbedding = docData.embedding
      let dotProduct = 0
      let normA = 0
      let normB = 0

      for (let i = 0; i < queryEmbedding.length; i++) {
        dotProduct += queryEmbedding[i] * docEmbedding[i]
        normA += queryEmbedding[i] * queryEmbedding[i]
        normB += docEmbedding[i] * docEmbedding[i]
      }

      const cosineSimilarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
      const similarityPercent = (cosineSimilarity * 100).toFixed(2)

      console.log(`   Similaridade calculada: ${similarityPercent}%`)
      
      if (cosineSimilarity < 0.5) {
        console.log(`   ⚠️  Similaridade muito baixa. O conteúdo pode não ser relevante para a consulta.`)
      }
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message || error)
    console.error(error)
  }
}

validateSearchResult()
  .then(() => {
    console.log('\n👋 Finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
