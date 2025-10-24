import { supabase } from './src/lib/supabase'
import { generateOpenAIEmbedding } from './src/lib/openai'

async function investigateLowSimilarity() {
  try {
    console.log('🔍 Investigando por que Chunk 6 tem baixa similaridade...\n')

    const chunk6Id = '3e2d29b7-06ee-4612-87b5-500f41018ce9'
    const queryText = 'o que diz o art. 77 da Lei Complementar 214/2025?'

    if (!supabase) {
      throw new Error('Conexão com Supabase não estabelecida')
    }

    // 1. Buscar o Chunk 6
    console.log('📄 Buscando Chunk 6...')
    const { data: chunk6, error: chunk6Error } = await supabase
      .from('documentos')
      .select('*')
      .eq('id', chunk6Id)
      .single()

    if (chunk6Error || !chunk6) {
      console.error('❌ Erro:', chunk6Error)
      return
    }

    console.log(`✅ Chunk 6 encontrado`)
    console.log(`   Nome: ${chunk6.nome}`)
    console.log(`   Chunk: ${chunk6.chunk_index + 1} de ${chunk6.total_chunks}`)
    console.log(`   Tamanho: ${chunk6.chunk_texto?.length || 0} caracteres\n`)

    // 2. Mostrar o conteúdo completo do Chunk 6
    console.log('═'.repeat(80))
    console.log('📝 CONTEÚDO COMPLETO DO CHUNK 6')
    console.log('═'.repeat(80))
    const text = chunk6.chunk_texto || ''
    console.log(text.substring(0, 1000))
    console.log('\n...(mostrando primeiros 1000 caracteres)...\n')

    // 3. Gerar embedding da consulta
    console.log('⏳ Gerando embedding da consulta...')
    const queryEmbedding = await generateOpenAIEmbedding(queryText)
    console.log('✅ Embedding gerado\n')

    // 4. Gerar embedding do texto do Chunk 6 (para comparar)
    console.log('⏳ Gerando novo embedding do texto do Chunk 6...')
    const chunk6TextEmbedding = await generateOpenAIEmbedding(text)
    console.log('✅ Novo embedding gerado\n')

    // 5. Calcular similaridade entre consulta e novo embedding
    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < queryEmbedding.length; i++) {
      dotProduct += queryEmbedding[i] * chunk6TextEmbedding[i]
      normA += queryEmbedding[i] * queryEmbedding[i]
      normB += chunk6TextEmbedding[i] * chunk6TextEmbedding[i]
    }

    const newSimilarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
    const newSimilarityPercent = (newSimilarity * 100).toFixed(2)

    console.log('═'.repeat(80))
    console.log('📊 ANÁLISE DE SIMILARIDADE')
    console.log('═'.repeat(80))
    console.log(`\n1. Similaridade com NOVO embedding (texto puro do chunk):`)
    console.log(`   ${newSimilarityPercent}%`)

    // 6. Tentar parsear o embedding armazenado no banco
    console.log(`\n2. Embedding armazenado no banco:`)
    const storedEmbedding = chunk6.embedding
    console.log(`   Tipo: ${typeof storedEmbedding}`)
    
    if (typeof storedEmbedding === 'string') {
      try {
        const parsedEmbedding = JSON.parse(storedEmbedding)
        console.log(`   ✅ Parse bem-sucedido`)
        console.log(`   Length: ${parsedEmbedding.length}`)
        
        // Calcular similaridade com embedding armazenado
        let dot2 = 0
        let nA2 = 0
        let nB2 = 0

        for (let i = 0; i < queryEmbedding.length; i++) {
          dot2 += queryEmbedding[i] * parsedEmbedding[i]
          nA2 += queryEmbedding[i] * queryEmbedding[i]
          nB2 += parsedEmbedding[i] * parsedEmbedding[i]
        }

        const storedSimilarity = dot2 / (Math.sqrt(nA2) * Math.sqrt(nB2))
        const storedSimilarityPercent = (storedSimilarity * 100).toFixed(2)

        console.log(`\n3. Similaridade com embedding ARMAZENADO no banco:`)
        console.log(`   ${storedSimilarityPercent}%`)

        console.log('\n' + '═'.repeat(80))
        console.log('🎯 CONCLUSÃO')
        console.log('═'.repeat(80))

        if (newSimilarity > 0.6) {
          console.log(`✅ O texto do chunk TEM alta similaridade (${newSimilarityPercent}%)`)
          console.log(`   O problema pode estar no embedding armazenado`)
        } else {
          console.log(`⚠️  O texto do chunk tem similaridade moderada (${newSimilarityPercent}%)`)
          console.log(`   Isso é esperado porque o chunk contém muito mais que só o Art. 77`)
        }

        if (Math.abs(newSimilarity - storedSimilarity) > 0.05) {
          console.log(`\n⚠️  DIFERENÇA SIGNIFICATIVA entre embeddings:`)
          console.log(`   Novo: ${newSimilarityPercent}%`)
          console.log(`   Armazenado: ${storedSimilarityPercent}%`)
          console.log(`   Diferença: ${Math.abs(newSimilarity - storedSimilarity).toFixed(4)}`)
          console.log(`\n   Possível causa: O embedding foi gerado com texto diferente`)
        } else {
          console.log(`\n✅ Embeddings são consistentes`)
        }

      } catch (e) {
        console.error(`   ❌ Erro ao fazer parse: ${e}`)
      }
    }

    // 7. Testar diferentes queries
    console.log('\n' + '═'.repeat(80))
    console.log('🧪 TESTANDO DIFERENTES QUERIES')
    console.log('═'.repeat(80))

    const testQueries = [
      'Art. 77',
      'Artigo 77',
      'diferenças percentuais de bens a granel',
      'quebra decréscimo acréscimo autoridade aduaneira',
      'Lei Complementar 214 artigo 77'
    ]

    for (const testQuery of testQueries) {
      const testEmb = await generateOpenAIEmbedding(testQuery)
      
      let dot = 0
      let nA = 0
      let nB = 0

      for (let i = 0; i < testEmb.length; i++) {
        dot += testEmb[i] * chunk6TextEmbedding[i]
        nA += testEmb[i] * testEmb[i]
        nB += chunk6TextEmbedding[i] * chunk6TextEmbedding[i]
      }

      const sim = dot / (Math.sqrt(nA) * Math.sqrt(nB))
      const simPercent = (sim * 100).toFixed(2)

      console.log(`\n"${testQuery}"`)
      console.log(`   Similaridade: ${simPercent}%`)
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message || error)
    console.error(error)
  }
}

investigateLowSimilarity()
  .then(() => {
    console.log('\n👋 Finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
