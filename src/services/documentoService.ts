import { supabase } from '../lib/supabase'
import { generateEmbedding } from '../lib/embedding'

export interface CreateDocumentoInput {
  nome: string
  descricao?: string
  nome_arquivo: string
  base64?: string
  base_id?: string[]
  embedding?: number[]
}

export interface UpdateDocumentoInput {
  nome?: string
  descricao?: string
  nome_arquivo?: string
  base64?: string
  base_id?: string[]
  embedding?: number[]
}

export interface PaginationInput {
  page?: number
  limit?: number
  search?: string
}

/**
 * Extrai texto do conteúdo base64 do documento
 * Suporta arquivos de texto, JSON, CSV, etc.
 */
function extractTextFromBase64(base64Content: string, nomeArquivo: string): string {
  try {
    // Remover prefixo data:xxx;base64, se existir
    const base64Data = base64Content.replace(/^data:.*?;base64,/, '')
    
    // Decodificar base64 para texto
    const buffer = Buffer.from(base64Data, 'base64')
    const text = buffer.toString('utf-8')
    
    // Limitar tamanho do texto para embedding (primeiros 5000 caracteres)
    return text.substring(0, 5000)
  } catch (error) {
    console.warn(`Não foi possível extrair texto do arquivo ${nomeArquivo}:`, error)
    return ''
  }
}

/**
 * Gera embedding específico para documentos
 * Combina nome, descrição, nome do arquivo e conteúdo para criar um embedding representativo
 */
function generateDocumentoEmbedding(documento: any): number[] {
  // Extrair conteúdo do arquivo se disponível
  let conteudo = ''
  if (documento.base64) {
    conteudo = extractTextFromBase64(documento.base64, documento.nome_arquivo || '')
  }
  
  const embeddingData = {
    nome: documento.nome || '',
    descricao: documento.descricao || '',
    nome_arquivo: documento.nome_arquivo || '',
    conteudo: conteudo,
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
   * Tratamento de erros do Supabase
   */
  private static handleSupabaseError(error: any, operation: string): string {
    console.error(`Erro ao ${operation}:`, error)

    // Erros específicos do Supabase/PostgreSQL
    if (error.code === '23505') {
      return 'Já existe um documento com este nome'
    }
    if (error.code === '23503') {
      return 'Referência inválida. Verifique se a base ou cliente existe'
    }
    if (error.code === '42P01') {
      return 'Tabela não encontrada. Verifique a estrutura do banco de dados'
    }
    if (error.code === 'PGRST116') {
      return 'Documento não encontrado'
    }
    if (error.code === '42501') {
      return 'Permissão negada para realizar esta operação'
    }

    // Erro genérico
    return error.message || `Erro ao ${operation}`
  }

  /**
   * Criar um novo documento
   */
  static async criarDocumento(data: CreateDocumentoInput, clienteId: string) {
    try {
      if (!supabase) {
        return {
          success: false,
          message: 'Conexão com o banco de dados não estabelecida',
          data: null,
          error: 'SUPABASE_NOT_INITIALIZED'
        }
      }

      // Validações
      if (!data.nome || data.nome.trim().length === 0) {
        return {
          success: false,
          message: 'Nome do documento é obrigatório e não pode estar vazio',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      if (!data.nome_arquivo || data.nome_arquivo.trim().length === 0) {
        return {
          success: false,
          message: 'Nome do arquivo é obrigatório e não pode estar vazio',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      if (data.nome.length > 255) {
        return {
          success: false,
          message: 'Nome do documento não pode exceder 255 caracteres',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      if (!clienteId || clienteId.trim().length === 0) {
        return {
          success: false,
          message: 'ID do cliente é obrigatório',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      // Verificar se já existe documento com o mesmo nome
      const { data: documentoComMesmoNome, error: erroNome } = await supabase
        .from('documentos')
        .select('id')
        .eq('cliente_id', clienteId)
        .eq('nome', data.nome.trim())
        .eq('deletado', false)
        .maybeSingle()

      if (erroNome) {
        console.error('Erro ao verificar nome duplicado:', erroNome)
      }

      if (documentoComMesmoNome) {
        return {
          success: false,
          message: 'Já existe um documento com este nome',
          data: null,
          error: 'DUPLICATE_NAME'
        }
      }

      // Verificar se já existe documento com o mesmo nome_arquivo
      const { data: documentoComMesmoArquivo, error: erroArquivo } = await supabase
        .from('documentos')
        .select('id')
        .eq('cliente_id', clienteId)
        .eq('nome_arquivo', data.nome_arquivo.trim())
        .eq('deletado', false)
        .maybeSingle()

      if (erroArquivo) {
        console.error('Erro ao verificar nome_arquivo duplicado:', erroArquivo)
      }

      if (documentoComMesmoArquivo) {
        return {
          success: false,
          message: 'Já existe um documento com este nome de arquivo',
          data: null,
          error: 'DUPLICATE_FILENAME'
        }
      }

      // Gerar embedding para o documento
      const embedding = data.embedding || generateDocumentoEmbedding(data)

      // Criar o documento
      const { data: novoDocumento, error } = await supabase
        .from('documentos')
        .insert({
          nome: data.nome.trim(),
          descricao: data.descricao?.trim() || null,
          nome_arquivo: data.nome_arquivo.trim(),
          base64: data.base64 || null,
          cliente_id: clienteId,
          base_id: data.base_id || null,
          embedding: embedding
        })
        .select('*')
        .single()

      if (error) {
        const errorMessage = this.handleSupabaseError(error, 'criar documento')
        return {
          success: false,
          message: errorMessage,
          data: null,
          error: error.code || 'DATABASE_ERROR'
        }
      }

      return {
        success: true,
        data: novoDocumento,
        message: 'Documento criado com sucesso'
      }
    } catch (error: any) {
      console.error('Erro no DocumentoService.criarDocumento:', error)
      return {
        success: false,
        message: error.message || 'Erro interno do servidor',
        data: null,
        error: 'INTERNAL_ERROR'
      }
    }
  }

  /**
   * Buscar documento por ID
   */
  static async buscarPorId(id: string, clienteId: string) {
    try {
      if (!supabase) {
        return {
          success: false,
          message: 'Conexão com o banco de dados não estabelecida',
          data: null,
          error: 'SUPABASE_NOT_INITIALIZED'
        }
      }

      // Validações
      if (!id || id.trim().length === 0) {
        return {
          success: false,
          message: 'ID do documento é obrigatório',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      if (!clienteId || clienteId.trim().length === 0) {
        return {
          success: false,
          message: 'ID do cliente é obrigatório',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      const { data: documento, error } = await supabase
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
            message: 'Documento não encontrado',
            error: 'NOT_FOUND'
          }
        }
        const errorMessage = this.handleSupabaseError(error, 'buscar documento')
        return {
          success: false,
          message: errorMessage,
          data: null,
          error: error.code || 'DATABASE_ERROR'
        }
      }

      if (!documento) {
        return {
          success: false,
          message: 'Documento não encontrado',
          data: null,
          error: 'NOT_FOUND'
        }
      }

      return {
        success: true,
        data: documento,
        message: 'Documento encontrado com sucesso'
      }
    } catch (error: any) {
      console.error('Erro no DocumentoService.buscarPorId:', error)
      return {
        success: false,
        message: error.message || 'Erro interno do servidor',
        data: null,
        error: 'INTERNAL_ERROR'
      }
    }
  }

  /**
   * Listar todos os documentos com paginação
   */
  static async listarComPaginacao(params: PaginationInput, clienteId: string) {
    try {
      if (!supabase) {
        return {
          success: false,
          message: 'Conexão com o banco de dados não estabelecida',
          data: null,
          error: 'SUPABASE_NOT_INITIALIZED'
        }
      }

      // Validações
      if (!clienteId || clienteId.trim().length === 0) {
        return {
          success: false,
          message: 'ID do cliente é obrigatório',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      const page = params.page || 1
      const limit = params.limit || 10

      if (page < 1) {
        return {
          success: false,
          message: 'Número da página deve ser maior que 0',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      if (limit < 1 || limit > 100) {
        return {
          success: false,
          message: 'Limite deve estar entre 1 e 100',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      const offset = (page - 1) * limit
      const search = params.search || ''

      let query = supabase
        .from('documentos')
        .select('*', { count: 'exact' })
        .eq('cliente_id', clienteId)
        .eq('deletado', false)
        .order('created_at', { ascending: false })

      // Aplicar filtro de busca se fornecido
      if (search && search.trim()) {
        const searchTerm = search.trim()
        query = query.or(`nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%,nome_arquivo.ilike.%${searchTerm}%`)
      }

      const { data: documentos, error, count } = await query
        .range(offset, offset + limit - 1)

      if (error) {
        const errorMessage = this.handleSupabaseError(error, 'listar documentos')
        return {
          success: false,
          message: errorMessage,
          data: null,
          error: error.code || 'DATABASE_ERROR'
        }
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
    } catch (error: any) {
      console.error('Erro no DocumentoService.listarComPaginacao:', error)
      return {
        success: false,
        message: error.message || 'Erro interno do servidor',
        data: null,
        error: 'INTERNAL_ERROR'
      }
    }
  }

  /**
   * Atualizar documento
   */
  static async atualizarDocumento(id: string, data: UpdateDocumentoInput, clienteId: string) {
    try {
      if (!supabase) {
        return {
          success: false,
          message: 'Conexão com o banco de dados não estabelecida',
          data: null,
          error: 'SUPABASE_NOT_INITIALIZED'
        }
      }

      // Validações
      if (!id || id.trim().length === 0) {
        return {
          success: false,
          message: 'ID do documento é obrigatório',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      if (!clienteId || clienteId.trim().length === 0) {
        return {
          success: false,
          message: 'ID do cliente é obrigatório',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      if (!data.nome && !data.descricao && !data.nome_arquivo && !data.base64 && !data.base_id) {
        return {
          success: false,
          message: 'Pelo menos um campo deve ser fornecido para atualização',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      // Validar nome se fornecido
      if (data.nome !== undefined) {
        if (typeof data.nome !== 'string') {
          return {
            success: false,
            message: 'Nome do documento deve ser uma string',
            data: null,
            error: 'VALIDATION_ERROR'
          }
        }
        if (data.nome.trim().length === 0) {
          return {
            success: false,
            message: 'Nome do documento não pode estar vazio',
            data: null,
            error: 'VALIDATION_ERROR'
          }
        }
        if (data.nome.length > 255) {
          return {
            success: false,
            message: 'Nome do documento não pode exceder 255 caracteres',
            data: null,
            error: 'VALIDATION_ERROR'
          }
        }
      }

      // Validar descrição se fornecida
      if (data.descricao !== undefined && data.descricao !== null) {
        if (typeof data.descricao !== 'string') {
          return {
            success: false,
            message: 'Descrição deve ser uma string',
            data: null,
            error: 'VALIDATION_ERROR'
          }
        }
      }

      // Validar nome_arquivo se fornecido
      if (data.nome_arquivo !== undefined) {
        if (typeof data.nome_arquivo !== 'string') {
          return {
            success: false,
            message: 'Nome do arquivo deve ser uma string',
            data: null,
            error: 'VALIDATION_ERROR'
          }
        }
        if (data.nome_arquivo.trim().length === 0) {
          return {
            success: false,
            message: 'Nome do arquivo não pode estar vazio',
            data: null,
            error: 'VALIDATION_ERROR'
          }
        }
        if (data.nome_arquivo.length > 500) {
          return {
            success: false,
            message: 'Nome do arquivo não pode exceder 500 caracteres',
            data: null,
            error: 'VALIDATION_ERROR'
          }
        }
      }

      // Validar base64 se fornecido
      if (data.base64 !== undefined && data.base64 !== null) {
        if (typeof data.base64 !== 'string') {
          return {
            success: false,
            message: 'Base64 deve ser uma string',
            data: null,
            error: 'VALIDATION_ERROR'
          }
        }
        // Validar formato base64 básico
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
        if (data.base64.trim().length > 0 && !base64Regex.test(data.base64)) {
          return {
            success: false,
            message: 'Base64 inválido. Deve conter apenas caracteres válidos de base64',
            data: null,
            error: 'VALIDATION_ERROR'
          }
        }
      }

      // Validar base_id se fornecido
      if (data.base_id !== undefined && data.base_id !== null) {
        if (!Array.isArray(data.base_id)) {
          return {
            success: false,
            message: 'Base ID deve ser um array de UUIDs',
            data: null,
            error: 'VALIDATION_ERROR'
          }
        }
        // Validar formato UUID de cada item
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        for (const id of data.base_id) {
          if (typeof id !== 'string' || !uuidRegex.test(id)) {
            return {
              success: false,
              message: 'Todos os IDs em base_id devem ser UUIDs válidos',
              data: null,
              error: 'VALIDATION_ERROR'
            }
          }
        }
      }

      // Verificar se o documento existe
      const documentoExistente = await this.buscarPorId(id, clienteId)
      if (!documentoExistente.success) {
        return documentoExistente
      }

      // Verificar se já existe outro documento com o mesmo nome
      if (data.nome !== undefined) {
        const { data: documentoComMesmoNome, error: erroNome } = await supabase
          .from('documentos')
          .select('id')
          .eq('cliente_id', clienteId)
          .eq('nome', data.nome.trim())
          .eq('deletado', false)
          .neq('id', id)
          .maybeSingle()

        if (erroNome) {
          console.error('Erro ao verificar nome duplicado:', erroNome)
        }

        if (documentoComMesmoNome) {
          return {
            success: false,
            message: 'Já existe outro documento com este nome',
            data: null,
            error: 'DUPLICATE_NAME'
          }
        }
      }

      // Verificar se já existe outro documento com o mesmo nome_arquivo
      if (data.nome_arquivo !== undefined) {
        const { data: documentoComMesmoArquivo, error: erroArquivo } = await supabase
          .from('documentos')
          .select('id')
          .eq('cliente_id', clienteId)
          .eq('nome_arquivo', data.nome_arquivo.trim())
          .eq('deletado', false)
          .neq('id', id)
          .maybeSingle()

        if (erroArquivo) {
          console.error('Erro ao verificar nome_arquivo duplicado:', erroArquivo)
        }

        if (documentoComMesmoArquivo) {
          return {
            success: false,
            message: 'Já existe outro documento com este nome de arquivo',
            data: null,
            error: 'DUPLICATE_FILENAME'
          }
        }
      }

      // Preparar dados para atualização
      const updateData: any = {}
      
      if (data.nome !== undefined) updateData.nome = data.nome.trim()
      if (data.descricao !== undefined) updateData.descricao = data.descricao?.trim() || null
      if (data.nome_arquivo !== undefined) updateData.nome_arquivo = data.nome_arquivo.trim()
      if (data.base64 !== undefined) updateData.base64 = data.base64
      if (data.base_id !== undefined) updateData.base_id = data.base_id

      // Regenerar embedding se algum campo relevante foi alterado
      if (data.nome || data.descricao || data.nome_arquivo) {
        const dadosParaEmbedding = {
          ...documentoExistente.data,
          ...updateData
        }
        updateData.embedding = data.embedding || generateDocumentoEmbedding(dadosParaEmbedding)
      }

      const { data: documentoAtualizado, error } = await supabase
        .from('documentos')
        .update(updateData)
        .eq('id', id)
        .eq('cliente_id', clienteId)
        .eq('deletado', false)
        .select('*')
        .single()

      if (error) {
        const errorMessage = this.handleSupabaseError(error, 'atualizar documento')
        return {
          success: false,
          message: errorMessage,
          data: null,
          error: error.code || 'DATABASE_ERROR'
        }
      }

      return {
        success: true,
        data: documentoAtualizado,
        message: 'Documento atualizado com sucesso'
      }
    } catch (error: any) {
      console.error('Erro no DocumentoService.atualizarDocumento:', error)
      return {
        success: false,
        message: error.message || 'Erro interno do servidor',
        data: null,
        error: 'INTERNAL_ERROR'
      }
    }
  }

  /**
   * Excluir documento (soft delete)
   */
  static async excluirDocumento(id: string, clienteId: string) {
    try {
      if (!supabase) {
        return {
          success: false,
          message: 'Conexão com o banco de dados não estabelecida',
          data: null,
          error: 'SUPABASE_NOT_INITIALIZED'
        }
      }

      // Validações
      if (!id || id.trim().length === 0) {
        return {
          success: false,
          message: 'ID do documento é obrigatório',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      if (!clienteId || clienteId.trim().length === 0) {
        return {
          success: false,
          message: 'ID do cliente é obrigatório',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      // Verificar se o documento existe
      const documentoExistente = await this.buscarPorId(id, clienteId)
      if (!documentoExistente.success) {
        return documentoExistente
      }

      const { error } = await supabase
        .from('documentos')
        .update({ deletado: true })
        .eq('id', id)
        .eq('cliente_id', clienteId)

      if (error) {
        const errorMessage = this.handleSupabaseError(error, 'excluir documento')
        return {
          success: false,
          message: errorMessage,
          data: null,
          error: error.code || 'DATABASE_ERROR'
        }
      }

      return {
        success: true,
        data: null,
        message: 'Documento excluído com sucesso'
      }
    } catch (error: any) {
      console.error('Erro no DocumentoService.excluirDocumento:', error)
      return {
        success: false,
        message: error.message || 'Erro interno do servidor',
        data: null,
        error: 'INTERNAL_ERROR'
      }
    }
  }

  /**
   * Buscar documentos por similaridade (usando embedding)
   */
  static async buscarPorSimilaridade(texto: string, clienteId: string, limite: number = 5) {
    try {
      if (!supabase) {
        return {
          success: false,
          message: 'Conexão com o banco de dados não estabelecida',
          data: null,
          error: 'SUPABASE_NOT_INITIALIZED'
        }
      }

      // Validações
      if (!texto || texto.trim().length === 0) {
        return {
          success: false,
          message: 'Texto para busca é obrigatório e não pode estar vazio',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      if (!clienteId || clienteId.trim().length === 0) {
        return {
          success: false,
          message: 'ID do cliente é obrigatório',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      if (limite < 1 || limite > 50) {
        return {
          success: false,
          message: 'Limite deve estar entre 1 e 50',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      const textoTrimmed = texto.trim()

      // Gerar embedding do texto de busca
      const embeddingBusca = generateEmbedding({ texto: textoTrimmed, tipo: 'busca' })

      // Buscar documentos similares usando função do Supabase
      const { data: documentos, error } = await supabase
        .rpc('buscar_documentos_similares', {
          embedding_busca: embeddingBusca,
          cliente_id_param: clienteId,
          limite_param: limite
        })

      if (error) {
        console.warn('Função de busca por similaridade não disponível, usando busca textual:', error.message)
        
        // Fallback para busca textual simples
        const { data: documentosFallback, error: errorFallback } = await supabase
          .from('documentos')
          .select('*')
          .eq('cliente_id', clienteId)
          .eq('deletado', false)
          .or(`nome.ilike.%${textoTrimmed}%,descricao.ilike.%${textoTrimmed}%,nome_arquivo.ilike.%${textoTrimmed}%`)
          .limit(limite)

        if (errorFallback) {
          const errorMessage = this.handleSupabaseError(errorFallback, 'buscar documentos similares')
          return {
            success: false,
            message: errorMessage,
            data: null,
            error: errorFallback.code || 'DATABASE_ERROR'
          }
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
    } catch (error: any) {
      console.error('Erro no DocumentoService.buscarPorSimilaridade:', error)
      return {
        success: false,
        message: error.message || 'Erro interno do servidor',
        data: null,
        error: 'INTERNAL_ERROR'
      }
    }
  }
}