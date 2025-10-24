import { supabase } from './src/lib/supabase'

async function listDocuments() {
  try {
    console.log('📋 Listando documentos disponíveis...\n')

    const clienteId = 'f029ad69-3465-454e-ba85-e0cdb75c445f'
    const baseIds = ['1b87c1a9-ced5-4760-98ef-6a97e464cd24']

    if (!supabase) {
      throw new Error('Conexão com Supabase não estabelecida')
    }

    // Buscar todos os documentos do cliente e base
    const { data: docs, error } = await supabase
      .from('documentos')
      .select('id, nome, nome_arquivo, chunk_index, total_chunks, documento_pai_id, created_at, embedding')
      .eq('cliente_id', clienteId)
      .eq('deletado', false)
      .order('created_at', { ascending: false })
      .order('chunk_index', { ascending: true })

    if (error) {
      console.error('❌ Erro:', error)
      return
    }

    if (!docs || docs.length === 0) {
      console.log('❌ Nenhum documento encontrado')
      console.log('\n💡 Possíveis motivos:')
      console.log('   - Documentos foram deletados')
      console.log('   - Cliente ID ou Base ID incorretos')
      console.log('   - Nenhum documento foi criado ainda')
      return
    }

    console.log(`✅ ${docs.length} documento(s) encontrado(s)\n`)
    console.log('═'.repeat(80))

    // Agrupar por documento pai
    const documentosPai = docs.filter(d => !d.documento_pai_id)
    const chunks = docs.filter(d => d.documento_pai_id)

    console.log(`\n📄 Documentos Pai: ${documentosPai.length}`)
    console.log('─'.repeat(80))

    documentosPai.forEach((doc, index) => {
      const docChunks = chunks.filter(c => c.documento_pai_id === doc.id)
      const hasEmbedding = doc.embedding ? '✅' : '❌'
      
      console.log(`\n${index + 1}. ${doc.nome}`)
      console.log(`   ID: ${doc.id}`)
      console.log(`   Arquivo: ${doc.nome_arquivo}`)
      console.log(`   Total de chunks: ${doc.total_chunks}`)
      console.log(`   Chunks filhos: ${docChunks.length}`)
      console.log(`   Embedding: ${hasEmbedding}`)
      console.log(`   Criado em: ${new Date(doc.created_at).toLocaleString('pt-BR')}`)

      if (docChunks.length > 0) {
        console.log(`\n   Chunks:`)
        docChunks.slice(0, 5).forEach(chunk => {
          const chunkEmb = chunk.embedding ? '✅' : '❌'
          console.log(`   - Chunk ${chunk.chunk_index + 1}: ${chunk.id} ${chunkEmb}`)
        })
        if (docChunks.length > 5) {
          console.log(`   ... e mais ${docChunks.length - 5} chunks`)
        }
      }
    })

    // Verificar se há documentos com Art. 77
    console.log('\n' + '═'.repeat(80))
    console.log('🔍 Procurando por "Art. 77"...')
    console.log('─'.repeat(80))

    const { data: art77Docs, error: art77Error } = await supabase
      .from('documentos')
      .select('id, nome, chunk_index, total_chunks, documento_pai_id')
      .eq('cliente_id', clienteId)
      .eq('deletado', false)
      .or('chunk_texto.ilike.%Art. 77%,chunk_texto.ilike.%Artigo 77%')

    if (art77Error) {
      console.error('❌ Erro ao buscar Art. 77:', art77Error)
    } else if (art77Docs && art77Docs.length > 0) {
      console.log(`\n✅ Encontrados ${art77Docs.length} chunk(s) com "Art. 77":\n`)
      art77Docs.forEach((doc, i) => {
        console.log(`${i + 1}. ${doc.nome}`)
        console.log(`   ID: ${doc.id}`)
        console.log(`   Chunk: ${doc.chunk_index + 1} de ${doc.total_chunks}`)
        console.log(`   Documento Pai: ${doc.documento_pai_id || 'N/A'}`)
        console.log()
      })
    } else {
      console.log('\n⚠️  Nenhum chunk encontrado com "Art. 77"')
      console.log('   Isso significa que o documento ainda não foi enviado com chunking')
    }

    console.log('═'.repeat(80))

  } catch (error: any) {
    console.error('❌ Erro:', error.message || error)
  }
}

listDocuments()
  .then(() => {
    console.log('\n👋 Finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
