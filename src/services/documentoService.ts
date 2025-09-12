import { supabase } from '../lib/supabase'
import { generateEmbedding } from '../lib/embedding'

export interface CreateDocumentoInput {
  nome: string
  descricao?: string
  nome_arquivo: string
  base_id?: string
  embedding?: number[]
}

export interface UpdateDocumentoInput {
  nome?: string
  descricao?: string
  nome_arquivo?: string
  base_id?: string
  embedding?: number[]
}

export interface PaginationInput {
  page?: number
  limit?: number
  search?: string
}

/**
 * Gera embedding específico para documentos
 * Combina nome, descrição e nome do arquivo para criar um embedding representativo
 */
function generateDocumentoEmbedding(documento: any): number[] {
  const embeddingData = {
    nome: documento.nome || '',
    descricao: documento.descricao || '',
    nome_arquivo: documento.nome_arquivo || '',
    tipo: 'documento'
  }
  
  return generateEmbedding(embeddingData)
}

export class DocumentoService {
  private static checkSupabaseConnection() {
    if (!supabase) {
      throw new Error('Conexão com Supabase não estabelecida')
    }
  }

  /**
   * Criar um novo documento
   */
  static async criarDocumento(data: CreateDocumentoInput, clienteId: string) {
    this.checkSupabaseConnection()

    try {
      // Gerar embedding para o documento
      const embedding = data.embedding || generateDocumentoEmbedding(data)

      // Criar o documento
      const { data: novoDocumento, error } = await supabase!
        .from('documentos')
        .insert({
          nome: data.nome,
          descricao: data.descricao || null,
          nome_arquivo: data.nome_arquivo,
          cliente_id: clienteId,
          base_id: data.base_id || null,
          embedding: embedding
        })
        .select('*')
        .single()

      if (error) {
        console.error('Erro ao criar documento:', error)
        throw new Error(`Erro ao criar documento: ${error.message}`)
      }

      return {
        success: true,
        data: novoDocumento,
        message: 'Documento criado com sucesso'
      }
    } catch (error) {
      console.error('Erro no DocumentoService.criarDocumento:', error)
      throw error
    }
  }

  /**
   * Buscar documento por ID
   */
  static async buscarPorId(id: string, clienteId: string) {
    this.checkSupabaseConnection()

    try {
      const { data: documento, error } = await supabase!
        .from('documentos')
        .select('*')
        .eq('id', id)
        .eq('cliente_id', clienteId)
        .eq('deletado', false)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            data: null,
            message: 'Documento não encontrado'
          }
        }
        throw new Error(`Erro ao buscar documento: ${error.message}`)
      }

      return {
        success: true,
        data: documento,
        message: 'Documento encontrado com sucesso'
      }
    } catch (error) {
      console.error('Erro no DocumentoService.buscarPorId:', error)
      throw error
    }
  }

  /**
   * Listar todos os documentos com paginação
   */
  static async listarComPaginacao(params: PaginationInput, clienteId: string) {
    this.checkSupabaseConnection()

    try {
      const page = params.page || 1
      const limit = params.limit || 10
      const offset = (page - 1) * limit
      const search = params.search || ''

      let query = supabase!
        .from('documentos')
        .select('*', { count: 'exact' })
        .eq('cliente_id', clienteId)
        .eq('deletado', false)
        .order('created_at', { ascending: false })

      // Aplicar filtro de busca se fornecido
      if (search) {
        query = query.or(`nome.ilike.%${search}%,descricao.ilike.%${search}%,nome_arquivo.ilike.%${search}%`)
      }

      const { data: documentos, error, count } = await query
        .range(offset, offset + limit - 1)

      if (error) {
        throw new Error(`Erro ao listar documentos: ${error.message}`)
      }

      const totalPages = Math.ceil((count || 0) / limit)

      return {
        success: true,
        data: {
          documentos: documentos || [],
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: count || 0,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          }
        },
        message: 'Documentos listados com sucesso'
      }
    } catch (error) {
      console.error('Erro no DocumentoService.listarComPaginacao:', error)
      throw error
    }
  }

  /**
   * Atualizar documento
   */
  static async atualizarDocumento(id: string, data: UpdateDocumentoInput, clienteId: string) {
    this.checkSupabaseConnection()

    try {
      // Verificar se o documento existe
      const documentoExistente = await this.buscarPorId(id, clienteId)
      if (!documentoExistente.success) {
        return documentoExistente
      }

      // Preparar dados para atualização
      const updateData: any = {}
      
      if (data.nome !== undefined) updateData.nome = data.nome
      if (data.descricao !== undefined) updateData.descricao = data.descricao
      if (data.nome_arquivo !== undefined) updateData.nome_arquivo = data.nome_arquivo
      if (data.base_id !== undefined) updateData.base_id = data.base_id

      // Regenerar embedding se algum campo relevante foi alterado
      if (data.nome || data.descricao || data.nome_arquivo) {
        const dadosParaEmbedding = {
          ...documentoExistente.data,
          ...updateData
        }
        updateData.embedding = data.embedding || generateDocumentoEmbedding(dadosParaEmbedding)
      }

      const { data: documentoAtualizado, error } = await supabase!
        .from('documentos')
        .update(updateData)
        .eq('id', id)
        .eq('cliente_id', clienteId)
        .eq('deletado', false)
        .select('*')
        .single()

      if (error) {
        throw new Error(`Erro ao atualizar documento: ${error.message}`)
      }

      return {
        success: true,
        data: documentoAtualizado,
        message: 'Documento atualizado com sucesso'
      }
    } catch (error) {
      console.error('Erro no DocumentoService.atualizarDocumento:', error)
      throw error
    }
  }

  /**
   * Excluir documento (soft delete)
   */
  static async excluirDocumento(id: string, clienteId: string) {
    this.checkSupabaseConnection()

    try {
      // Verificar se o documento existe
      const documentoExistente = await this.buscarPorId(id, clienteId)
      if (!documentoExistente.success) {
        return documentoExistente
      }

      const { error } = await supabase!
        .from('documentos')
        .update({ deletado: true })
        .eq('id', id)
        .eq('cliente_id', clienteId)

      if (error) {
        throw new Error(`Erro ao excluir documento: ${error.message}`)
      }

      return {
        success: true,
        data: null,
        message: 'Documento excluído com sucesso'
      }
    } catch (error) {
      console.error('Erro no DocumentoService.excluirDocumento:', error)
      throw error
    }
  }

  /**
   * Buscar documentos por similaridade (usando embedding)
   */
  static async buscarPorSimilaridade(texto: string, clienteId: string, limite: number = 5) {
    this.checkSupabaseConnection()

    try {
      // Gerar embedding do texto de busca
      const embeddingBusca = generateEmbedding({ texto, tipo: 'busca' })

      // Buscar documentos similares usando função do Supabase
      const { data: documentos, error } = await supabase!
        .rpc('buscar_documentos_similares', {
          embedding_busca: embeddingBusca,
          cliente_id_param: clienteId,
          limite_param: limite
        })

      if (error) {
        console.warn('Função de busca por similaridade não disponível, usando busca textual:', error.message)
        
        // Fallback para busca textual simples
        const { data: documentosFallback, error: errorFallback } = await supabase!
          .from('documentos')
          .select('*')
          .eq('cliente_id', clienteId)
          .eq('deletado', false)
          .or(`nome.ilike.%${texto}%,descricao.ilike.%${texto}%,nome_arquivo.ilike.%${texto}%`)
          .limit(limite)

        if (errorFallback) {
          throw new Error(`Erro na busca por similaridade: ${errorFallback.message}`)
        }

        return {
          success: true,
          data: documentosFallback || [],
          message: 'Documentos encontrados (busca textual)'
        }
      }

      return {
        success: true,
        data: documentos || [],
        message: 'Documentos similares encontrados'
      }
    } catch (error) {
      console.error('Erro no DocumentoService.buscarPorSimilaridade:', error)
      throw error
    }
  }
}