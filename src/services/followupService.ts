import { supabase } from '../lib/supabase'
import { CreateFollowupInput, UpdateFollowupInput, PaginationInput } from '../lib/validators'

export class FollowupService {
  // Verificar conexão com Supabase
  private static checkSupabaseConnection() {
    if (!supabase) {
      throw new Error('Supabase não está configurado. Verifique as variáveis de ambiente.')
    }
  }

  // Listar todos os followups com paginação
  static async listarTodos(params: PaginationInput) {
    FollowupService.checkSupabaseConnection();
    console.log('🔄 Listando followups com paginação:', params)
    
    const { page, limit, search } = params
    const offset = (page - 1) * limit
    
    let query = supabase!
      .from('followup')
      .select(`
        *,
        mensagem:id_mensagem(*),
        lead:id_lead(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
    
    if (search) {
      query = query.or(`mensagem_enviada.ilike.%${search}%,status.ilike.%${search}%`)
    }
    
    const { data: followups, error, count } = await query
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('❌ Erro ao listar followups:', error)
      throw error
    }
    
    const totalPages = Math.ceil((count || 0) / limit)
    
    console.log('✅ Followups listados:', followups?.length, 'de', count, 'total')
    return {
      data: followups,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    }
  }

  // Buscar followup por ID
  static async buscarPorId(id: string) {
    FollowupService.checkSupabaseConnection();
    console.log('🔄 Buscando followup:', id)
    
    const { data: followup, error } = await supabase!
      .from('followup')
      .select(`
        *,
        mensagem:id_mensagem(*),
        lead:id_lead(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('❌ Erro ao buscar followup:', error)
      throw error
    }
    
    console.log('✅ Followup encontrado:', id)
    return followup
  }

  // Buscar followups por lead
  static async buscarPorLead(leadId: string) {
    FollowupService.checkSupabaseConnection();
    console.log('🔄 Buscando followups do lead:', leadId)
    
    const { data: followups, error } = await supabase!
      .from('followup')
      .select(`
        *,
        mensagem:id_mensagem(*)
      `)
      .eq('id_lead', leadId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro ao buscar followups do lead:', error)
      throw error
    }
    
    console.log('✅ Followups do lead encontrados:', followups?.length)
    return followups
  }

  // Criar novo followup
  static async criar(data: CreateFollowupInput) {
    FollowupService.checkSupabaseConnection();
    console.log('🔄 Criando followup:', data)
    
    const { data: followup, error } = await supabase!
      .from('followup')
      .insert({
        id_mensagem: data.id_mensagem,
        id_lead: data.id_lead,
        status: data.status,
        erro: data.erro,
        mensagem_enviada: data.mensagem_enviada,
        embedding: data.embedding
      })
      .select(`
        *,
        mensagem:id_mensagem(*),
        lead:id_lead(*)
      `)
      .single()
    
    if (error) {
      console.error('❌ Erro ao criar followup:', error)
      throw error
    }
    
    console.log('✅ Followup criado com sucesso:', followup.id)
    return followup
  }

  // Atualizar followup
  static async atualizar(id: string, data: UpdateFollowupInput) {
    FollowupService.checkSupabaseConnection();
    console.log('🔄 Atualizando followup:', id, data)
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    // Adicionar campos fornecidos
    if (data.id_mensagem) updateData.id_mensagem = data.id_mensagem
    if (data.id_lead) updateData.id_lead = data.id_lead
    if (data.status) updateData.status = data.status
    if (data.erro !== undefined) updateData.erro = data.erro
    if (data.mensagem_enviada) updateData.mensagem_enviada = data.mensagem_enviada
    if (data.embedding) updateData.embedding = data.embedding
    
    const { data: followup, error } = await supabase!
      .from('followup')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        mensagem:id_mensagem(*),
        lead:id_lead(*)
      `)
      .single()
    
    if (error) {
      console.error('❌ Erro ao atualizar followup:', error)
      throw error
    }
    
    console.log('✅ Followup atualizado com sucesso:', id)
    return followup
  }

  // Deletar followup
  static async deletar(id: string) {
    FollowupService.checkSupabaseConnection();
    console.log('🔄 Deletando followup:', id)
    
    const { error } = await supabase!
      .from('followup')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('❌ Erro ao deletar followup:', error)
      throw error
    }
    
    console.log('✅ Followup deletado com sucesso:', id)
    return { message: 'Followup deletado com sucesso' }
  }

  // Buscar followups por status
  static async buscarPorStatus(status: 'sucesso' | 'erro') {
    FollowupService.checkSupabaseConnection();
    console.log('🔄 Buscando followups por status:', status)
    
    const { data: followups, error } = await supabase!
      .from('followup')
      .select(`
        *,
        mensagem:id_mensagem(*),
        lead:id_lead(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro ao buscar followups por status:', error)
      throw error
    }
    
    console.log('✅ Followups por status encontrados:', followups?.length)
    return followups
  }

  // Buscar followups com embedding
  static async buscarComEmbedding() {
    FollowupService.checkSupabaseConnection();
    console.log('🔄 Buscando followups com embedding')
    
    const { data: followups, error } = await supabase!
      .from('followup')
      .select(`
        *,
        mensagem:id_mensagem(*),
        lead:id_lead(*)
      `)
      .not('embedding', 'is', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro ao buscar followups com embedding:', error)
      throw error
    }
    
    console.log('✅ Followups com embedding encontrados:', followups?.length)
    return followups
  }
}