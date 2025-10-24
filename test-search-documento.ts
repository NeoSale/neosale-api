import { supabase } from './src/lib/supabase'
import { generateOpenAIEmbedding } from './src/lib/openai'

async function testSearchDocumento() {
  try {
    console.log('🔍 Iniciando teste de busca semântica de documentos...\n')

    // Parâmetros do teste
    const clienteId = 'f029ad69-3465-454e-ba85-e0cdb75c445f'
    const baseIds = ['1b87c1a9-ced5-4760-98ef-6a97e464cd24']
    const queryText = 'o que diz o art. 77 da Lei Complementar 214/2025?'
    const matchCount = 5

    console.log('📋 Parâmetros da busca:')
    console.log(`   Cliente ID: ${clienteId}`)
    console.log(`   Base IDs: ${baseIds.join(', ')}`)
    console.log(`   Consulta: "${queryText}"`)
    console.log(`   Limite de resultados: ${matchCount}\n`)

    // Passo 1: Gerar embedding da consulta
    console.log('⏳ Gerando embedding da consulta...')
    const startEmbedding = Date.now()
    const queryEmbedding = await generateOpenAIEmbedding(queryText)
    const endEmbedding = Date.now()
    console.log(`✅ Embedding gerado em ${endEmbedding - startEmbedding}ms`)
    console.log(`   Dimensões: ${queryEmbedding.length}`)
    console.log(`   Primeiros 5 valores: [${queryEmbedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]\n`)

    // Passo 2: Chamar a função SQL
    console.log('🔎 Buscando documentos similares...')
    const startSearch = Date.now()
    
    if (!supabase) {
      throw new Error('Conexão com Supabase não estabelecida')
    }
    
    const { data, error } = await supabase.rpc('match_documentos_by_base_cliente', {
      filter: {
        cliente_id: clienteId,
        base_id: baseIds
      },
      match_count: matchCount,
      query_embedding: queryEmbedding
    })

    const endSearch = Date.now()

    if (error) {
      console.error('❌ Erro ao buscar documentos:', error)
      return
    }

    console.log(`✅ Busca concluída em ${endSearch - startSearch}ms\n`)

    // Passo 3: Exibir resultados
    if (!data || data.length === 0) {
      console.log('⚠️  Nenhum documento encontrado.')
      console.log('\nPossíveis motivos:')
      console.log('   - Não há documentos com embedding gerado')
      console.log('   - Os base_ids não correspondem a nenhum documento')
      console.log('   - O cliente_id está incorreto')
      return
    }

    console.log(`📄 ${data.length} documento(s) encontrado(s):\n`)
    console.log('═'.repeat(80))

    data.forEach((item: any, index: number) => {
      const metadata = item.metadata
      const similarity = (item.similarity * 100).toFixed(2)
      const chunkInfo = item.chunk_info || {} // Compatibilidade se migration não foi aplicada

      console.log(`\n${index + 1}. Documento: ${metadata.nome}`)
      console.log(`   Similaridade: ${similarity}%`)
      console.log(`   ID: ${metadata.id}`)
      console.log(`   Arquivo: ${metadata.nome_arquivo}`)
      
      if (metadata.descricao) {
        console.log(`   Descrição: ${metadata.descricao}`)
      }

      // Informações de chunk (se disponível)
      if (chunkInfo.is_chunk) {
        console.log(`   📑 Chunk ${chunkInfo.chunk_index + 1} de ${chunkInfo.total_chunks}`)
        console.log(`   📄 Documento pai: ${chunkInfo.documento_pai_id}`)
        if (chunkInfo.chunk_texto) {
          console.log(`   📝 Trecho: "${chunkInfo.chunk_texto.substring(0, 200)}..."`)
        }
      } else if (chunkInfo.total_chunks > 1) {
        console.log(`   📑 Documento com ${chunkInfo.total_chunks} partes`)
      }

      // Informações de chunk do metadata (fallback se migration não aplicada)
      if (!chunkInfo.is_chunk && metadata.documento_pai_id) {
        console.log(`   📑 Chunk ${metadata.chunk_index + 1} de ${metadata.total_chunks}`)
        console.log(`   📄 Documento pai: ${metadata.documento_pai_id}`)
      } else if (!chunkInfo.is_chunk && metadata.total_chunks > 1) {
        console.log(`   📑 Documento com ${metadata.total_chunks} partes`)
      }

      // Mostrar trecho do conteúdo se disponível
      if (metadata.base64) {
        const base64Length = metadata.base64.length
        console.log(`   Tamanho do arquivo: ${(base64Length / 1024 / 1024).toFixed(2)} MB (base64)`)
      }

      console.log(`   Criado em: ${new Date(metadata.created_at).toLocaleString('pt-BR')}`)
      console.log('─'.repeat(80))
    })

    console.log('\n✨ Teste concluído com sucesso!')

    // Passo 4: Verificar se encontrou a resposta esperada
    console.log('\n🎯 Análise dos resultados:')
    const bestMatch = data[0]
    if (bestMatch.similarity > 0.7) {
      console.log(`   ✅ Documento mais relevante encontrado com ${(bestMatch.similarity * 100).toFixed(2)}% de similaridade`)
      console.log(`   📄 ${bestMatch.metadata.nome}`)
    } else {
      console.log(`   ⚠️  Melhor resultado tem apenas ${(bestMatch.similarity * 100).toFixed(2)}% de similaridade`)
      console.log(`   Pode não ser o documento correto`)
    }

  } catch (error: any) {
    console.error('❌ Erro no teste:', error.message || error)
    console.error(error)
  }
}

// Executar o teste
testSearchDocumento()
  .then(() => {
    console.log('\n👋 Finalizando...')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
