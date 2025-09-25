import { supabase } from '../lib/supabase'

export interface Qualificacao {
  id: string
  nome: string
  tipo_agente: string[] // array de tipos de agente
  descricao: string
  embedding?: any
  created_at?: string
  updated_at?: string
}

export interface CreateQualificacaoData {
  nome: string
  tipo_agente: string[]
  descricao: string
  embedding?: any
}

export interface UpdateQualificacaoData {
  nome?: string
  tipo_agente?: string[]
  descricao?: string
}

export class QualificacaoService {
  // Verificar conexão com Supabase
  private static checkSupabaseConnection() {
    if (!supabase) {
      throw new Error('Conexão com Supabase não estabelecida')
    }
  }

  // Listar todas as qualificações
  static async listarQualificacoes(): Promise<Qualificacao[]> {
    QualificacaoService.checkSupabaseConnection()
    console.log('🔍 Listando qualificações')

    try {
      const { data, error } = await supabase!
        .from('qualificacao')
        .select('*')
        .order('nome', { ascending: true })

      if (error) {
        console.error('❌ Erro ao listar qualificações:', error)
        throw error
      }

      console.log('✅ Qualificações listadas com sucesso:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ Erro ao listar qualificações:', error)
      throw error
    }
  }

  // Buscar qualificação por ID
  static async buscarQualificacaoPorId(id: string): Promise<Qualificacao | null> {
    QualificacaoService.checkSupabaseConnection()
    console.log('🔍 Buscando qualificação por ID:', id)

    try {
      const { data, error } = await supabase!
        .from('qualificacao')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('⚠️ Qualificação não encontrada')
          return null
        }
        console.error('❌ Erro ao buscar qualificação:', error)
        throw error
      }

      console.log('✅ Qualificação encontrada:', data.nome)
      return data
    } catch (error) {
      console.error('❌ Erro ao buscar qualificação:', error)
      throw error
    }
  }

  // Criar nova qualificação
  static async criarQualificacao(data: CreateQualificacaoData): Promise<Qualificacao> {
    QualificacaoService.checkSupabaseConnection()
    console.log('➕ Criando nova qualificação:', data.nome)

    try {
      const { data: qualificacao, error } = await supabase!
        .from('qualificacao')
        .insert([{
          nome: data.nome,
          tipo_agente: data.tipo_agente,
          descricao: data.descricao,
          embedding: data.embedding
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao criar qualificação:', error)
        throw error
      }

      console.log('✅ Qualificação criada com sucesso:', qualificacao.nome)
      return qualificacao
    } catch (error) {
      console.error('❌ Erro ao criar qualificação:', error)
      throw error
    }
  }

  // Atualizar qualificação
  static async atualizarQualificacao(id: string, data: UpdateQualificacaoData): Promise<Qualificacao> {
    QualificacaoService.checkSupabaseConnection()
    console.log('🔄 Atualizando qualificação:', id)

    try {
      // Adicionar timestamp de atualização
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      }

      const { data: qualificacao, error } = await supabase!
        .from('qualificacao')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Qualificação não encontrada')
        }
        console.error('❌ Erro ao atualizar qualificação:', error)
        throw error
      }

      console.log('✅ Qualificação atualizada com sucesso:', qualificacao.nome)
      return qualificacao
    } catch (error) {
      console.error('❌ Erro ao atualizar qualificação:', error)
      throw error
    }
  }

  // Deletar qualificação
  static async deletarQualificacao(id: string): Promise<void> {
    QualificacaoService.checkSupabaseConnection()
    console.log('🗑️ Deletando qualificação:', id)

    try {
      // Verificar se a qualificação está sendo usada por algum lead
      const { data: leadsUsandoQualificacao, error: checkError } = await supabase!
        .from('leads')
        .select('id')
        .eq('qualificacao_id', id)
        .eq('deletado', false)
        .limit(1)

      if (checkError) {
        console.error('❌ Erro ao verificar uso da qualificação:', checkError)
        throw checkError
      }

      if (leadsUsandoQualificacao && leadsUsandoQualificacao.length > 0) {
        throw new Error('Não é possível deletar qualificação que está sendo usada por leads')
      }

      const { error } = await supabase!
        .from('qualificacao')
        .delete()
        .eq('id', id)

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Qualificação não encontrada')
        }
        console.error('❌ Erro ao deletar qualificação:', error)
        throw error
      }

      console.log('✅ Qualificação deletada com sucesso')
    } catch (error) {
      console.error('❌ Erro ao deletar qualificação:', error)
      throw error
    }
  }

  // Verificar se qualificação existe
  static async qualificacaoExiste(nome: string, excludeId?: string): Promise<boolean> {
    QualificacaoService.checkSupabaseConnection()

    try {
      let query = supabase!
        .from('qualificacao')
        .select('id')
        .eq('nome', nome)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query.limit(1)

      if (error) {
        console.error('❌ Erro ao verificar existência da qualificação:', error)
        throw error
      }

      return data && data.length > 0
    } catch (error) {
      console.error('❌ Erro ao verificar existência da qualificação:', error)
      throw error
    }
  }
}