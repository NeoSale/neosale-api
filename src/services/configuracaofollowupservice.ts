import { supabase } from '../lib/supabase'
import { CreateConfiguracaoFollowupInput, UpdateConfiguracaoFollowupInput } from '../lib/validators'

export interface ConfiguracaoFollowup {
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
  cliente_id: string
  embedding?: number[]
  created_at: string
  updated_at: string
}

export class ConfiguracaoFollowupService {
  static async getAll(): Promise<ConfiguracaoFollowup[]> {
    try {
      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado')
      }

      const { data, error } = await supabase
        .from('configuracoes_followup')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar configurações de follow-up:', error)
        throw new Error(`Erro ao buscar configurações de follow-up: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Erro no serviço getAll:', error)
      throw error
    }
  }

  static async getById(id: string): Promise<ConfiguracaoFollowup | null> {
    try {
      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado')
      }

      const { data, error } = await supabase
        .from('configuracoes_followup')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.error('Erro ao buscar configuração de follow-up por ID:', error)
        throw new Error(`Erro ao buscar configuração de follow-up: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Erro no serviço getById:', error)
      throw error
    }
  }

  static async getByClienteId(clienteId: string): Promise<ConfiguracaoFollowup | null> {
    try {
      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado')
      }

      const { data, error } = await supabase
        .from('configuracoes_followup')
        .select('*')
        .eq('cliente_id', clienteId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.error('Erro ao buscar configuração de follow-up por cliente_id:', error)
        throw new Error(`Erro ao buscar configuração de follow-up: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Erro no serviço getByClienteId:', error)
      throw error
    }
  }

  static async create(input: CreateConfiguracaoFollowupInput): Promise<ConfiguracaoFollowup> {
    try {
      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado')
      }

      const { data, error } = await supabase
        .from('configuracoes_followup')
        .insert({
          ...input,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar configuração de follow-up:', error)
        throw new Error(`Erro ao criar configuração de follow-up: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Erro no serviço create:', error)
      throw error
    }
  }

  static async update(id: string, input: UpdateConfiguracaoFollowupInput): Promise<ConfiguracaoFollowup> {
    try {
      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado')
      }

      const { data, error } = await supabase
        .from('configuracoes_followup')
        .update({
          ...input,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar configuração de follow-up:', error)
        throw new Error(`Erro ao atualizar configuração de follow-up: ${error.message}`)
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
        .from('configuracoes_followup')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao deletar configuração de follow-up:', error)
        throw new Error(`Erro ao deletar configuração de follow-up: ${error.message}`)
      }
    } catch (error) {
      console.error('Erro no serviço delete:', error)
      throw error
    }
  }
}