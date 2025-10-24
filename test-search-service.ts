import { DocumentoSearchService } from './src/services/documentoSearchService'

async function testSearchService() {
  try {
    console.log('🔍 Testando DocumentoSearchService...\n')

    const clienteId = 'f029ad69-3465-454e-ba85-e0cdb75c445f'
    const baseIds = ['1b87c1a9-ced5-4760-98ef-6a97e464cd24']
    const queryText = 'o que diz o art. 77 da Lei Complementar 214/2025?'

    console.log('📋 Parâmetros:')
    console.log(`   Cliente: ${clienteId}`)
    console.log(`   Base IDs: ${baseIds.join(', ')}`)
    console.log(`   Query: "${queryText}"\n`)

    console.log('═'.repeat(80))
    
    const result = await DocumentoSearchService.buscarHibrido(
      clienteId,
      baseIds,
      queryText
    )

    console.log('═'.repeat(80))

    if (!result.success || !result.data) {
      console.error('\n❌ Erro:', result.message)
      return
    }

    console.log(`\n✅ ${result.data.length} resultado(s) encontrado(s)\n`)

    // Verificar se encontrou o Chunk 12
    const chunk12 = result.data.find(d => d.id === 'fa435ec8-4895-4097-8a50-9aa21f6784ce')
    
    if (chunk12) {
      const position = result.data.findIndex(d => d.id === 'fa435ec8-4895-4097-8a50-9aa21f6784ce') + 1
      console.log('🎯 VALIDAÇÃO')
      console.log('═'.repeat(80))
      console.log(`✅ SUCESSO! Chunk 12 (Art. 77) encontrado!`)
      console.log(`   Posição: ${position}º lugar ${position === 1 ? '🏆' : ''}`)
      console.log(`   Similaridade: ${(chunk12.similarity * 100).toFixed(2)}%`)
      console.log(`   Score combinado: ${(chunk12.combined_score * 100).toFixed(2)}%`)
      console.log(`   Match de texto: ${chunk12.text_match ? 'Sim ✅' : 'Não ❌'}`)
      if (chunk12.matched_term) {
        console.log(`   Termo encontrado: "${chunk12.matched_term}"`)
      }
      console.log('═'.repeat(80))
    } else {
      console.log('❌ Chunk 12 NÃO encontrado')
    }

    // Mostrar top 5
    console.log('\n📊 Top 5 Resultados:')
    console.log('─'.repeat(80))
    
    result.data.slice(0, 5).forEach((doc, i) => {
      const marker = doc.text_match ? '📝' : '🧠'
      const isChunk12 = doc.id === 'fa435ec8-4895-4097-8a50-9aa21f6784ce' ? '🎯 ' : '   '
      
      console.log(`\n${isChunk12}${marker} ${i + 1}. ${doc.nome}`)
      console.log(`   ID: ${doc.id}`)
      console.log(`   Chunk: ${doc.chunk_index + 1} de ${doc.total_chunks}`)
      console.log(`   Similaridade: ${(doc.similarity * 100).toFixed(2)}%`)
      console.log(`   Score: ${(doc.combined_score * 100).toFixed(2)}%`)
      if (doc.text_match) {
        console.log(`   ✅ Match: "${doc.matched_term}"`)
      }
    })

  } catch (error: any) {
    console.error('❌ Erro:', error.message || error)
    console.error(error)
  }
}

testSearchService()
  .then(() => {
    console.log('\n👋 Finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
