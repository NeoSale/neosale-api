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
   * Criar uma nova base
   */
  static async criarBase(data: CreateBaseInput, clienteId: string) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      const baseData = {
        nome: data.nome,
        descricao: data.descricao || null,
        cliente_id: clienteId
      }

      const { data: novaBase, error } = await supabase
        .from('base')
        .insert(baseData)
        .select('*')
        .single()

      if (error) {
        console.error('Erro ao criar base:', error)
        return {
          success: false,
          message: 'Erro ao criar base',
          data: null
        }
      }

      return {
        success: true,
        message: 'Base criada com sucesso',
        data: novaBase
      }
    } catch (error) {
      console.error('Erro no BaseService.criarBase:', error)
      return {
        success: false,
        message: 'Erro interno do servidor',
        data: null
      }
    }
  }

  /**
   * Buscar base por ID
   */
  static async buscarPorId(id: string, clienteId: string) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      const { data, error } = await supabase
        .from('base')
        .select('*')
        .eq('id', id)
        .eq('cliente_id', clienteId)
        .single()

      if (error || !data) {
        return {
          success: false,
          message: 'Base não encontrada',
          data: null
        }
      }

      return {
        success: true,
        message: 'Base encontrada',
        data: data
      }
    } catch (error) {
      console.error('Erro no BaseService.buscarPorId:', error)
      return {
        success: false,
        message: 'Erro interno do servidor',
        data: null
      }
    }
  }

  /**
   * Listar bases com paginação
   */
  static async listarComPaginacao(params: PaginationInput, clienteId: string) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      const page = params.page || 1
      const limit = params.limit || 10
      const offset = (page - 1) * limit

      let query = supabase
      .from('base')
      .select('*', { count: 'exact' })
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Aplicar filtro de busca se fornecido
      if (params.search && params.search.trim()) {
        query = query.or(`nome.ilike.%${params.search}%,descricao.ilike.%${params.search}%`)
      }

      const { data: bases, error, count } = await query

      if (error) {
        console.error('Erro ao listar bases:', error)
        return {
          success: false,
          message: 'Erro ao listar bases',
          data: null
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
    } catch (error) {
      console.error('Erro no BaseService.listarComPaginacao:', error)
      return {
        success: false,
        message: 'Erro interno do servidor',
        data: null
      }
    }
  }

  /**
   * Atualizar base
   */
  static async atualizarBase(id: string, data: UpdateBaseInput, clienteId: string) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }
      // Verificar se a base existe
      const baseExistente = await this.buscarPorId(id, clienteId)
      if (!baseExistente.success) {
        return baseExistente
      }

      const updateData: any = {}
      if (data.nome !== undefined) updateData.nome = data.nome
      if (data.descricao !== undefined) updateData.descricao = data.descricao

      const { data: baseAtualizada, error } = await supabase
        .from('base')
        .update(updateData)
        .eq('id', id)
        .eq('cliente_id', clienteId)

        .select('*')
        .single()

      if (error) {
        console.error('Erro ao atualizar base:', error)
        return {
          success: false,
          message: 'Erro ao atualizar base',
          data: null
        }
      }

      return {
        success: true,
        message: 'Base atualizada com sucesso',
        data: baseAtualizada
      }
    } catch (error) {
      console.error('Erro no BaseService.atualizarBase:', error)
      return {
        success: false,
        message: 'Erro interno do servidor',
        data: null
      }
    }
  }

  /**
   * Excluir base (soft delete)
   */
  static async excluirBase(id: string, clienteId: string) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
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
        console.error('Erro ao excluir base:', error)
        return {
          success: false,
          message: 'Erro ao excluir base',
          data: null
        }
      }

      return {
        success: true,
        message: 'Base excluída com sucesso',
        data: null
      }
    } catch (error) {
      console.error('Erro no BaseService.excluirBase:', error)
      return {
        success: false,
        message: 'Erro interno do servidor',
        data: null
      }
    }
  }
}