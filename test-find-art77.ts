import { supabase } from './src/lib/supabase'

async function findArt77() {
  try {
    console.log('🔍 Procurando Art. 77 nos chunks...\n')

    if (!supabase) {
      throw new Error('Conexão com Supabase não estabelecida')
    }

    // Buscar todos os chunks que contêm "Art. 77" ou "Artigo 77"
    const { data: chunks, error } = await supabase
      .from('documentos')
      .select('id, nome, chunk_index, total_chunks, chunk_texto, documento_pai_id, embedding')
      .or('chunk_texto.ilike.%Art. 77%,chunk_texto.ilike.%Artigo 77%,chunk_texto.ilike.%art. 77%')
      .eq('deletado', false)
      .order('chunk_index')

    if (error) {
      console.error('❌ Erro na busca:', error)
      return
    }

    console.log(`📄 Encontrados ${chunks.length} chunk(s) contendo "Art. 77"\n`)
    console.log('═'.repeat(80))

    if (chunks.length === 0) {
      console.log('❌ Nenhum chunk encontrado com "Art. 77"')
      console.log('\n💡 Isso pode significar que:')
      console.log('   1. O Art. 77 não está no documento')
      console.log('   2. O texto foi truncado antes do Art. 77')
      console.log('   3. A formatação é diferente (ex: "Artigo 77", "art 77", etc.)')
      return
    }

    chunks.forEach((chunk, index) => {
      console.log(`\n${index + 1}. Chunk ${chunk.chunk_index + 1} de ${chunk.total_chunks}`)
      console.log(`   ID: ${chunk.id}`)
      console.log(`   Nome: ${chunk.nome}`)
      console.log(`   Documento Pai: ${chunk.documento_pai_id || 'N/A'}`)
      console.log(`   Tem embedding: ${chunk.embedding ? 'Sim' : 'Não'}`)
      
      // Encontrar a posição do Art. 77 no texto
      const text = chunk.chunk_texto || ''
      const regex = /art\.?\s*77/gi
      const matches = [...text.matchAll(regex)]
      
      console.log(`   Ocorrências de "Art. 77": ${matches.length}`)
      
      matches.forEach((match, i) => {
        const position = match.index || 0
        const start = Math.max(0, position - 100)
        const end = Math.min(text.length, position + 300)
        const context = text.substring(start, end)
        
        console.log(`\n   Contexto ${i + 1}:`)
        console.log(`   "${context.replace(/\s+/g, ' ')}"`)
      })
      
      console.log('\n' + '─'.repeat(80))
    })

    // Verificar se o chunk esperado está na lista
    const expectedId = '3e2d29b7-06ee-4612-87b5-500f41018ce9'
    const expectedChunk = chunks.find(c => c.id === expectedId)

    console.log('\n' + '═'.repeat(80))
    console.log('🎯 VERIFICAÇÃO DO CHUNK ESPERADO')
    console.log('═'.repeat(80))

    if (expectedChunk) {
      console.log(`✅ O chunk esperado (${expectedId}) CONTÉM "Art. 77"!`)
      console.log(`   Chunk: ${expectedChunk.chunk_index + 1} de ${expectedChunk.total_chunks}`)
      console.log(`   Tem embedding: ${expectedChunk.embedding ? 'Sim' : 'Não'}`)
    } else {
      console.log(`❌ O chunk esperado (${expectedId}) NÃO contém "Art. 77"`)
      console.log(`\n   Verificando o conteúdo do chunk esperado...`)
      
      const { data: expectedData } = await supabase
        .from('documentos')
        .select('chunk_texto')
        .eq('id', expectedId)
        .single()
      
      if (expectedData?.chunk_texto) {
        console.log(`\n   Primeiros 500 caracteres do chunk:`)
        console.log(`   "${expectedData.chunk_texto.substring(0, 500)}"`)
      }
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message || error)
  }
}

findArt77()
  .then(() => {
    console.log('\n👋 Finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
