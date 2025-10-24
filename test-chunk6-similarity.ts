import { supabase } from './src/lib/supabase'
import { generateOpenAIEmbedding } from './src/lib/openai'

async function testChunk6Similarity() {
  try {
    console.log('🔍 Testando similaridade do Chunk 12 (que contém Art. 77)...\n')

    const chunk6Id = 'fa435ec8-4895-4097-8a50-9aa21f6784ce' // Chunk 12 com Art. 77
    const queryText = 'o que diz o art. 77 da Lei Complementar 214/2025?'

    if (!supabase) {
      throw new Error('Conexão com Supabase não estabelecida')
    }

    // Buscar o chunk 6
    const { data: chunk6, error: chunkError } = await supabase
      .from('documentos')
      .select('*')
      .eq('id', chunk6Id)
      .single()

    if (chunkError || !chunk6) {
      console.error('❌ Erro ao buscar chunk:', chunkError)
      return
    }

    console.log('📄 Chunk 6:')
    console.log(`   ID: ${chunk6.id}`)
    console.log(`   Nome: ${chunk6.nome}`)
    console.log(`   Chunk: ${chunk6.chunk_index + 1} de ${chunk6.total_chunks}`)
    console.log(`   Tamanho do texto: ${chunk6.chunk_texto?.length || 0} caracteres`)
    console.log()

    // Mostrar o conteúdo do Art. 77
    const text = chunk6.chunk_texto || ''
    const art77Index = text.toLowerCase().indexOf('art. 77')
    if (art77Index >= 0) {
      const context = text.substring(Math.max(0, art77Index - 50), Math.min(text.length, art77Index + 400))
      console.log('📝 Conteúdo do Art. 77:')
      console.log(`"${context.replace(/\s+/g, ' ')}"\n`)
    }

    // Gerar embedding da consulta
    console.log('⏳ Gerando embedding da consulta...')
    const queryEmbedding = await generateOpenAIEmbedding(queryText)
    console.log('✅ Embedding da consulta gerado\n')

    // Calcular similaridade de cosseno
    if (!chunk6.embedding || !Array.isArray(chunk6.embedding)) {
      console.error('❌ Chunk não tem embedding válido')
      return
    }

    console.log('🧮 Calculando similaridade de cosseno...')
    const docEmbedding = chunk6.embedding
    
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

    console.log('═'.repeat(80))
    console.log('📊 RESULTADO DA SIMILARIDADE')
    console.log('═'.repeat(80))
    console.log(`   Similaridade: ${similarityPercent}%`)
    console.log(`   Cosseno: ${cosineSimilarity.toFixed(4)}`)
    console.log()

    if (cosineSimilarity >= 0.7) {
      console.log('   ✅ Similaridade ALTA - Deveria estar no top 3')
    } else if (cosineSimilarity >= 0.5) {
      console.log('   ⚠️  Similaridade MODERADA - Pode estar no top 10')
    } else if (cosineSimilarity >= 0.3) {
      console.log('   ⚠️  Similaridade BAIXA - Provavelmente fora do top 10')
    } else {
      console.log('   ❌ Similaridade MUITO BAIXA - Não será encontrado')
    }

    console.log('═'.repeat(80))

    // Comparar com outros chunks
    console.log('\n🔍 Comparando com outros chunks...\n')

    const { data: allChunks, error: allError } = await supabase
      .from('documentos')
      .select('id, nome, chunk_index, embedding')
      .eq('documento_pai_id', chunk6.documento_pai_id)
      .not('embedding', 'is', null)
      .order('chunk_index')

    if (allError || !allChunks) {
      console.error('❌ Erro ao buscar chunks:', allError)
      return
    }

    console.log(`📊 Calculando similaridade de todos os ${allChunks.length} chunks...\n`)

    const similarities = allChunks.map(chunk => {
      const chunkEmb = chunk.embedding
      let dot = 0
      let nA = 0
      let nB = 0

      for (let i = 0; i < queryEmbedding.length; i++) {
        dot += queryEmbedding[i] * chunkEmb[i]
        nA += queryEmbedding[i] * queryEmbedding[i]
        nB += chunkEmb[i] * chunkEmb[i]
      }

      const sim = dot / (Math.sqrt(nA) * Math.sqrt(nB))
      return {
        id: chunk.id,
        nome: chunk.nome,
        chunk_index: chunk.chunk_index,
        similarity: sim,
        isChunk6: chunk.id === chunk6Id
      }
    })

    // Ordenar por similaridade
    similarities.sort((a, b) => b.similarity - a.similarity)

    console.log('Top 10 chunks por similaridade:')
    console.log('─'.repeat(80))

    similarities.slice(0, 10).forEach((item, index) => {
      const marker = item.isChunk6 ? '🎯' : '  '
      const percent = (item.similarity * 100).toFixed(2)
      console.log(`${marker} ${index + 1}. Chunk ${item.chunk_index + 1} - ${percent}% ${item.isChunk6 ? '← CHUNK COM ART. 77' : ''}`)
    })

    const chunk6Position = similarities.findIndex(s => s.isChunk6) + 1
    console.log('\n' + '═'.repeat(80))
    console.log(`🎯 Chunk 6 está na posição: ${chunk6Position}º de ${similarities.length}`)
    console.log('═'.repeat(80))

    if (chunk6Position <= 3) {
      console.log('✅ Excelente! Está no top 3')
    } else if (chunk6Position <= 10) {
      console.log('⚠️  Está no top 10, mas não é o melhor resultado')
    } else {
      console.log('❌ Está fora do top 10 - A busca não vai encontrá-lo facilmente')
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message || error)
    console.error(error)
  }
}

testChunk6Similarity()
  .then(() => {
    console.log('\n👋 Finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
