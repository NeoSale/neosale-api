import { supabase } from '../lib/supabase'

export class ReferenciaService {
  // Verificar se Supabase está configurado
  private static checkSupabaseConnection() {
    if (!supabase) {
      throw new Error('Supabase não está configurado. Configure as credenciais no arquivo .env');
    }
  }

  // Listar todas as qualificações
  static async listarQualificacoes() {
    ReferenciaService.checkSupabaseConnection();
    console.log('🔄 Listando qualificações')
    
    try {
      const { data: qualificacoes, error } = await supabase!
        .from('qualificacao')
        .select('*')
        .order('nome')
      
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
  static async listarOrigens() {
    ReferenciaService.checkSupabaseConnection();
    console.log('🔄 Listando origens')
    
    try {
      const { data: origens, error } = await supabase!
        .from('origens_leads')
        .select('*')
        .order('nome')
      
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

  // Listar todas as etapas do funil
  static async listarEtapasFunil() {
    ReferenciaService.checkSupabaseConnection();
    console.log('🔄 Listando etapas do funil')
    
    try {
      const { data: etapas, error } = await supabase!
        .from('etapas_funil')
        .select('*')
        .order('nome')
      
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
  static async listarStatusNegociacao() {
    ReferenciaService.checkSupabaseConnection();
    console.log('🔄 Listando status de negociação')
    
    try {
      const { data: status, error } = await supabase!
        .from('status_negociacao')
        .select('*')
        .order('nome')
      
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
  static async listarTodasReferencias() {
    ReferenciaService.checkSupabaseConnection();
    console.log('🔄 Listando todas as referências')
    
    try {
      const [qualificacoes, origens, etapas, status] = await Promise.all([
        ReferenciaService.listarQualificacoes(),
        ReferenciaService.listarOrigens(),
        ReferenciaService.listarEtapasFunil(),
        ReferenciaService.listarStatusNegociacao()
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