import { supabase } from '../lib/supabase'

export class ReferenciaService {
  // Verificar se Supabase está configurado
  private static checkSupabaseConnection() {
    if (!supabase) {
      throw new Error('Supabase não está configurado. Configure as credenciais no arquivo .env');
    }
  }

  // Listar todas as qualificações
  static async listarQualificacoes(clienteId?: string) {
    ReferenciaService.checkSupabaseConnection();
    console.log('🔄 Listando qualificações')
    
    try {
      let query = supabase!
        .from('qualificacao')
        .select('*')
      
      if (clienteId) {
        query = query.eq('cliente_id', clienteId)
      }
      
      const { data: qualificacoes, error } = await query.order('nome')
      
      if (error) {
        console.error('❌ Erro ao listar qualificações:', error)
        throw error
      }
      
      console.log('✅ Qualificações listadas:', qualificacoes?.length || 0)
      return qualificacoes || []
      
    } catch (error) {
      console.error('❌ Erro ao listar qualificações:', error)
      throw error
    }
  }

  // Listar todas as origens
  static async listarOrigens(clienteId?: string) {
    ReferenciaService.checkSupabaseConnection();
    console.log('🔄 Listando origens')
    
    try {
      let query = supabase!
        .from('origens_leads')
        .select('*')
      
      if (clienteId) {
        query = query.eq('cliente_id', clienteId)
      }
      
      const { data: origens, error } = await query.order('nome')
      
      if (error) {
        console.error('❌ Erro ao listar origens:', error)
        throw error
      }
      
      console.log('✅ Origens listadas:', origens?.length || 0)
      return origens || []
      
    } catch (error) {
      console.error('❌ Erro ao listar origens:', error)
      throw error
    }
  }

  // Buscar origem por nome
  static async buscarOrigemPorNome(nome: string, clienteId?: string) {
    ReferenciaService.checkSupabaseConnection();
    console.log('🔄 Buscando origem por nome:', nome)
    
    try {
      let query = supabase!
        .from('origens_leads')
        .select('*')
        .eq('nome', nome)
      
      if (clienteId) {
        query = query.eq('cliente_id', clienteId)
      }
      
      const { data: origem, error } = await query.single()
      
      if (error) {
        console.error('❌ Erro ao buscar origem por nome:', error)
        return null
      }
      
      console.log('✅ Origem encontrada:', origem?.id)
      return origem
      
    } catch (error) {
      console.error('❌ Erro ao buscar origem por nome:', error)
      return null
    }
  }

  // Listar todas as etapas do funil
  static async listarEtapasFunil(clienteId?: string) {
    ReferenciaService.checkSupabaseConnection();
    console.log('🔄 Listando etapas do funil')
    
    try {
      let query = supabase!
        .from('etapas_funil')
        .select('*')
      
      if (clienteId) {
        query = query.eq('cliente_id', clienteId)
      }
      
      const { data: etapas, error } = await query.order('nome')
      
      if (error) {
        console.error('❌ Erro ao listar etapas do funil:', error)
        throw error
      }
      
      console.log('✅ Etapas do funil listadas:', etapas?.length || 0)
      return etapas || []
      
    } catch (error) {
      console.error('❌ Erro ao listar etapas do funil:', error)
      throw error
    }
  }

  // Listar todos os status de negociação
  static async listarStatusNegociacao(clienteId?: string) {
    ReferenciaService.checkSupabaseConnection();
    console.log('🔄 Listando status de negociação')
    
    try {
      let query = supabase!
        .from('status_negociacao')
        .select('*')
      
      if (clienteId) {
        query = query.eq('cliente_id', clienteId)
      }
      
      const { data: status, error } = await query.order('nome')
      
      if (error) {
        console.error('❌ Erro ao listar status de negociação:', error)
        throw error
      }
      
      console.log('✅ Status de negociação listados:', status?.length || 0)
      return status || []
      
    } catch (error) {
      console.error('❌ Erro ao listar status de negociação:', error)
      throw error
    }
  }

  // Listar todas as referências em um único endpoint
  static async listarTodasReferencias(clienteId?: string) {
    ReferenciaService.checkSupabaseConnection();
    console.log('🔄 Listando todas as referências')
    
    try {
      const [qualificacoes, origens, etapas, status] = await Promise.all([
        ReferenciaService.listarQualificacoes(clienteId),
        ReferenciaService.listarOrigens(clienteId),
        ReferenciaService.listarEtapasFunil(clienteId),
        ReferenciaService.listarStatusNegociacao(clienteId)
      ])
      
      const referencias = {
        qualificacoes,
        origens,
        etapas_funil: etapas,
        status_negociacao: status
      }
      
      console.log('✅ Todas as referências listadas')
      return referencias
      
    } catch (error) {
      console.error('❌ Erro ao listar todas as referências:', error)
      throw error
    }
  }
}