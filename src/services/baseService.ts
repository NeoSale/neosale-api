import { supabase } from '../lib/supabase'

export interface CreateBaseInput {
  nome: string
  descricao?: string
}

export interface UpdateBaseInput {
  nome?: string
  descricao?: string
}

export interface PaginationInput {
  page?: number
  limit?: number
  search?: string
}

export interface BaseData {
  id: string
  nome: string
  descricao?: string
  cliente_id: string
  created_at: string
  updated_at: string
}

export class BaseService {
  /**
   * Tratamento de erros do Supabase
   */
  private static handleSupabaseError(error: any, operation: string): string {
    console.error(`Erro ao ${operation}:`, error)

    // Erros específicos do Supabase/PostgreSQL
    if (error.code === '23505') {
      return 'Já existe uma base com este nome'
    }
    if (error.code === '23503') {
      return 'Referência inválida. Verifique se o cliente existe'
    }
    if (error.code === '42P01') {
      return 'Tabela não encontrada. Verifique a estrutura do banco de dados'
    }
    if (error.code === 'PGRST116') {
      return 'Registro não encontrado'
    }
    if (error.code === '42501') {
      return 'Permissão negada para realizar esta operação'
    }

    // Erro genérico
    return error.message || `Erro ao ${operation}`
  }

  /**
   * Criar uma nova base
   */
  static async criarBase(data: CreateBaseInput, clienteId: string) {
    try {
      if (!supabase) {
        return {
          success: false,
          message: 'Conexão com o banco de dados não estabelecida',
          data: null,
          error: 'SUPABASE_NOT_INITIALIZED'
        }
      }

      // Validações adicionais
      if (!data.nome || data.nome.trim().length === 0) {
        return {
          success: false,
          message: 'Nome da base é obrigatório e não pode estar vazio',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      if (data.nome.length > 255) {
        return {
          success: false,
          message: 'Nome da base não pode exceder 255 caracteres',
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

      const baseData = {
        nome: data.nome.trim(),
        descricao: data.descricao?.trim() || null,
        cliente_id: clienteId
      }

      const { data: novaBase, error } = await supabase
        .from('base')
        .insert(baseData)
        .select('*')
        .single()

      if (error) {
        const errorMessage = this.handleSupabaseError(error, 'criar base')
        return {
          success: false,
          message: errorMessage,
          data: null,
          error: error.code || 'DATABASE_ERROR'
        }
      }

      return {
        success: true,
        message: 'Base criada com sucesso',
        data: novaBase
      }
    } catch (error: any) {
      console.error('Erro no BaseService.criarBase:', error)
      return {
        success: false,
        message: error.message || 'Erro interno do servidor',
        data: null,
        error: 'INTERNAL_ERROR'
      }
    }
  }

  /**
   * Buscar base por ID
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
          message: 'ID da base é obrigatório',
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

      const { data, error } = await supabase
        .from('base')
        .select('*')
        .eq('id', id)
        .eq('cliente_id', clienteId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            message: 'Base não encontrada',
            data: null,
            error: 'NOT_FOUND'
          }
        }
        const errorMessage = this.handleSupabaseError(error, 'buscar base')
        return {
          success: false,
          message: errorMessage,
          data: null,
          error: error.code || 'DATABASE_ERROR'
        }
      }

      if (!data) {
        return {
          success: false,
          message: 'Base não encontrada',
          data: null,
          error: 'NOT_FOUND'
        }
      }

      return {
        success: true,
        message: 'Base encontrada',
        data: data
      }
    } catch (error: any) {
      console.error('Erro no BaseService.buscarPorId:', error)
      return {
        success: false,
        message: error.message || 'Erro interno do servidor',
        data: null,
        error: 'INTERNAL_ERROR'
      }
    }
  }

  /**
   * Listar bases com paginação
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

      let query = supabase
        .from('base')
        .select('*', { count: 'exact' })
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Aplicar filtro de busca se fornecido
      if (params.search && params.search.trim()) {
        const searchTerm = params.search.trim()
        query = query.or(`nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`)
      }

      const { data: bases, error, count } = await query

      if (error) {
        const errorMessage = this.handleSupabaseError(error, 'listar bases')
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
        message: 'Bases listadas com sucesso',
        data: {
          bases: bases || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      }
    } catch (error: any) {
      console.error('Erro no BaseService.listarComPaginacao:', error)
      return {
        success: false,
        message: error.message || 'Erro interno do servidor',
        data: null,
        error: 'INTERNAL_ERROR'
      }
    }
  }

  /**
   * Atualizar base
   */
  static async atualizarBase(id: string, data: UpdateBaseInput, clienteId: string) {
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
          message: 'ID da base é obrigatório',
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

      if (!data.nome && !data.descricao) {
        return {
          success: false,
          message: 'Pelo menos um campo deve ser fornecido para atualização',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      if (data.nome !== undefined && data.nome.trim().length === 0) {
        return {
          success: false,
          message: 'Nome da base não pode estar vazio',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      if (data.nome && data.nome.length > 255) {
        return {
          success: false,
          message: 'Nome da base não pode exceder 255 caracteres',
          data: null,
          error: 'VALIDATION_ERROR'
        }
      }

      // Verificar se a base existe
      const baseExistente = await this.buscarPorId(id, clienteId)
      if (!baseExistente.success) {
        return baseExistente
      }

      const updateData: any = {}
      if (data.nome !== undefined) updateData.nome = data.nome.trim()
      if (data.descricao !== undefined) updateData.descricao = data.descricao?.trim() || null

      const { data: baseAtualizada, error } = await supabase
        .from('base')
        .update(updateData)
        .eq('id', id)
        .eq('cliente_id', clienteId)
        .select('*')
        .single()

      if (error) {
        const errorMessage = this.handleSupabaseError(error, 'atualizar base')
        return {
          success: false,
          message: errorMessage,
          data: null,
          error: error.code || 'DATABASE_ERROR'
        }
      }

      return {
        success: true,
        message: 'Base atualizada com sucesso',
        data: baseAtualizada
      }
    } catch (error: any) {
      console.error('Erro no BaseService.atualizarBase:', error)
      return {
        success: false,
        message: error.message || 'Erro interno do servidor',
        data: null,
        error: 'INTERNAL_ERROR'
      }
    }
  }

  /**
   * Excluir base
   */
  static async excluirBase(id: string, clienteId: string) {
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
          message: 'ID da base é obrigatório',
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

      // Verificar se a base existe
      const baseExistente = await this.buscarPorId(id, clienteId)
      if (!baseExistente.success) {
        return baseExistente
      }

      const { data, error } = await supabase
        .from('base')
        .delete()
        .eq('id', id)
        .eq('cliente_id', clienteId)
        .select()
        .single()

      if (error) {
        // Verificar se há documentos vinculados
        if (error.code === '23503') {
          return {
            success: false,
            message: 'Não é possível excluir a base pois existem documentos vinculados a ela',
            data: null,
            error: 'FOREIGN_KEY_VIOLATION'
          }
        }
        const errorMessage = this.handleSupabaseError(error, 'excluir base')
        return {
          success: false,
          message: errorMessage,
          data: null,
          error: error.code || 'DATABASE_ERROR'
        }
      }

      return {
        success: true,
        message: 'Base excluída com sucesso',
        data: null
      }
    } catch (error: any) {
      console.error('Erro no BaseService.excluirBase:', error)
      return {
        success: false,
        message: error.message || 'Erro interno do servidor',
        data: null,
        error: 'INTERNAL_ERROR'
      }
    }
  }
}