import { supabase } from '../lib/supabase'
import { CreateConfiguracaoFollowupInput, UpdateConfiguracaoFollowupInput } from '../lib/validators'

export interface AutomaticMessagesConfig {
  id: string
  dia_horario_envio: {
    segunda: string
    terca: string
    quarta: string
    quinta: string
    sexta: string
    sabado: string
    domingo: string
  }
  qtd_envio_diario: number
  em_execucao: boolean
  ativo: boolean
  cliente_id: string
  embedding?: number[]
  index?: number
  created_at: string
  updated_at: string
  cliente?: {
    id: string
    nome: string
  }
}

export class AutomaticMessagesConfigService {
  static async getAll(): Promise<AutomaticMessagesConfig[]> {
    try {
      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado')
      }

      const { data, error } = await supabase
        .from('config_automatic_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar configurações de mensagens automáticas:', error)
        throw new Error(`Erro ao buscar configurações de mensagens automáticas: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Erro no serviço getAll:', error)
      throw error
    }
  }

  static async getById(id: string): Promise<AutomaticMessagesConfig | null> {
    try {
      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado')
      }

      const { data, error } = await supabase
        .from('config_automatic_messages')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.error('Erro ao buscar configuração de mensagens automáticas por ID:', error)
        throw new Error(`Erro ao buscar configuração de mensagens automáticas: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Erro no serviço getById:', error)
      throw error
    }
  }

  static async getByClienteId(clienteId: string): Promise<AutomaticMessagesConfig | null> {
    try {
      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado')
      }

      const { data, error } = await supabase
        .from('config_automatic_messages')
        .select('*')
        .eq('cliente_id', clienteId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.error('Erro ao buscar configuração de mensagens automáticas por cliente_id:', error)
        throw new Error(`Erro ao buscar configuração de mensagens automáticas: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Erro no serviço getByClienteId:', error)
      throw error
    }
  }

  static async create(input: CreateConfiguracaoFollowupInput): Promise<AutomaticMessagesConfig> {
    try {
      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado')
      }

      const { data, error } = await supabase
        .from('config_automatic_messages')
        .insert({
          ...input,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar configuração de mensagens automáticas:', error)
        throw new Error(`Erro ao criar configuração de mensagens automáticas: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Erro no serviço create:', error)
      throw error
    }
  }

  static async update(id: string, input: UpdateConfiguracaoFollowupInput): Promise<AutomaticMessagesConfig> {
    try {
      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado')
      }

      const { data, error } = await supabase
        .from('config_automatic_messages')
        .update({
          ...input,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar configuração de mensagens automáticas:', error)
        throw new Error(`Erro ao atualizar configuração de mensagens automáticas: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Erro no serviço update:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado')
      }

      const { error } = await supabase
        .from('config_automatic_messages')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao deletar configuração de mensagens automáticas:', error)
        throw new Error(`Erro ao deletar configuração de mensagens automáticas: ${error.message}`)
      }
    } catch (error) {
      console.error('Erro no serviço delete:', error)
      throw error
    }
  }

  static async getByAtivo(ativo: boolean): Promise<AutomaticMessagesConfig[]> {
    try {
      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado')
      }

      const { data, error } = await supabase
        .from('config_automatic_messages')
        .select('*')
        .eq('ativo', ativo)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar configurações de mensagens automáticas por status ativo:', error)
        throw new Error(`Erro ao buscar configurações de mensagens automáticas por status ativo: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Erro no serviço getByAtivo:', error)
      throw error
    }
  }

  static async updateIndex(clienteId: string, index: number): Promise<AutomaticMessagesConfig> {
    try {
      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado')
      }

      const { data, error } = await supabase
        .from('config_automatic_messages')
        .update({
          index: index,
          updated_at: new Date().toISOString()
        })
        .eq('cliente_id', clienteId)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar índice da configuração de mensagens automáticas:', error)
        throw new Error(`Erro ao atualizar índice da configuração de mensagens automáticas: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Erro no serviço updateIndex:', error)
      throw error
    }
  }

  static async updateById(id: string, clienteId: string, updateData: UpdateConfiguracaoFollowupInput): Promise<AutomaticMessagesConfig> {
    try {
      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado')
      }

      const { data, error } = await supabase
        .from('config_automatic_messages')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('cliente_id', clienteId)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar configuração de mensagens automáticas por ID:', error)
        throw new Error(`Erro ao atualizar configuração de mensagens automáticas: ${error.message}`)
      }

      if (!data) {
        throw new Error('Configuração de mensagens automáticas não encontrada')
      }

      return data
    } catch (error) {
      console.error('Erro no serviço updateById:', error)
      throw error
    }
  }
}
