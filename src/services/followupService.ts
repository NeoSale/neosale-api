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
  static async listarTodos(params: PaginationInput & { clienteId?: string }) {
    FollowupService.checkSupabaseConnection();
    console.log('🔄 Listando followups com paginação:', params)
    
    const { page, limit, search, clienteId } = params
    const offset = (page - 1) * limit
    
    let query = supabase!
      .from('followup')
      .select(`
        *,
        mensagem:id_mensagem(*),
        lead:id_lead(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
    
    if (clienteId) {
      query = query.eq('cliente_id', clienteId)
    }
    
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
  static async buscarPorId(id: string, clienteId?: string) {
    FollowupService.checkSupabaseConnection();
    console.log('🔄 Buscando followup:', id)
    
    let query = supabase!
      .from('followup')
      .select(`
        *,
        mensagem:id_mensagem(*),
        lead:id_lead(*)
      `)
      .eq('id', id);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data: followup, error } = await query.single();
    
    if (error) {
      console.error('❌ Erro ao buscar followup:', error)
      throw error
    }
    
    console.log('✅ Followup encontrado:', id)
    return followup
  }

  // Buscar followups por lead
  static async buscarPorLead(leadId: string, clienteId?: string) {
    FollowupService.checkSupabaseConnection();
    console.log('🔄 Buscando followups do lead:', leadId)
    
    let query = supabase!
      .from('followup')
      .select(`
        *,
        mensagem:id_mensagem(*)
      `)
      .eq('id_lead', leadId);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data: followups, error } = await query
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar followups do lead:', error)
      throw error
    }
    
    console.log('✅ Followups do lead encontrados:', followups?.length)
    return followups
  }

  // Criar novo followup
  static async criar(data: CreateFollowupInput & { cliente_id?: string }) {
    FollowupService.checkSupabaseConnection();
    console.log('🔄 Criando followup:', data)
    
    const insertData: any = {
      id_mensagem: data.id_mensagem,
      id_lead: data.id_lead,
      status: data.status,
      erro: data.erro,
      mensagem_enviada: data.mensagem_enviada,
      embedding: data.embedding
    };

    if (data.cliente_id) {
      insertData.cliente_id = data.cliente_id;
    }

    const { data: followup, error } = await supabase!
      .from('followup')
      .insert(insertData)
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
  static async atualizar(id: string, data: UpdateFollowupInput, clienteId?: string) {
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
    
    let query = supabase!
      .from('followup')
      .update(updateData)
      .eq('id', id);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data: followup, error } = await query
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
  static async deletar(id: string, clienteId?: string) {
    FollowupService.checkSupabaseConnection();
    console.log('🔄 Deletando followup:', id)
    
    let query = supabase!
      .from('followup')
      .delete()
      .eq('id', id);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { error } = await query;
    
    if (error) {
      console.error('❌ Erro ao deletar followup:', error)
      throw error
    }
    
    console.log('✅ Followup deletado com sucesso:', id)
    return { message: 'Followup deletado com sucesso' }
  }

  // Buscar followups por status
  static async buscarPorStatus(status: 'sucesso' | 'erro', clienteId?: string) {
    FollowupService.checkSupabaseConnection();
    console.log('🔄 Buscando followups por status:', status)
    
    let query = supabase!
      .from('followup')
      .select(`
        *,
        mensagem:id_mensagem(*),
        lead:id_lead(*)
      `)
      .eq('status', status);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data: followups, error } = await query
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar followups por status:', error)
      throw error
    }
    
    console.log('✅ Followups por status encontrados:', followups?.length)
    return followups
  }

  // Buscar followups com embedding
  static async buscarComEmbedding(clienteId?: string) {
    FollowupService.checkSupabaseConnection();
    console.log('🔄 Buscando followups com embedding')
    
    let query = supabase!
      .from('followup')
      .select(`
        *,
        mensagem:id_mensagem(*),
        lead:id_lead(*)
      `);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data: followups, error } = await query
      .not('embedding', 'is', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro ao buscar followups com embedding:', error)
      throw error
    }
    
    console.log('✅ Followups com embedding encontrados:', followups?.length)
    return followups
  }

  // Buscar leads para envio de mensagens com priorização
  static async buscarLeadsParaEnvio(clienteId: string, quantidade: number) {
    FollowupService.checkSupabaseConnection();
    console.log('🔄 Buscando leads para envio:', { clienteId, quantidade });

    // Query complexa que prioriza:
    // 1. Leads com followup anterior que precisam da próxima mensagem (ordenados por data da última followup + período)
    // 2. Leads sem followup ainda (ordenados por data de criação)
    const { data: leadsParaEnvio, error } = await supabase!
      .rpc('buscar_leads_para_followup', {
        p_cliente_id: clienteId,
        p_limite: quantidade
      });

    if (error) {
      console.error('❌ Erro ao buscar leads para envio:', error);
      throw error;
    }

    // Transformar os dados no formato solicitado
    const leadsFormatados = await Promise.all(
      (leadsParaEnvio || []).map(async (lead: any) => {
        const resultado: any = {
          lead: {
            id: lead.lead_id,
            nome: lead.lead_nome,
            telefone: lead.lead_telefone,
            email: lead.lead_email
          },
          mensagem: {
            id: lead.mensagem_id,
            nome: lead.mensagem_nome,
            texto: lead.mensagem_texto
          },
          tem_followup_anterior: lead.tem_followup_anterior
        };

        // Se tem followup anterior, buscar mensagens anteriores
        if (lead.tem_followup_anterior) {
          const { data: mensagensAnteriores, error: errorMensagens } = await supabase!
            .from('followup')
            .select(`
              mensagem:id_mensagem(
                id,
                nome,
                texto_mensagem,
                ordem
              ),
              created_at
            `)
            .eq('id_lead', lead.lead_id)
            .eq('status', 'sucesso')
            .order('created_at', { ascending: true });

          if (!errorMensagens && mensagensAnteriores) {
            resultado.mensagens_anteriores = mensagensAnteriores.map((item: any) => ({
              mensagem: {
                id: item.mensagem.id,
                nome: item.mensagem.nome,
                texto: item.mensagem.texto_mensagem,
                created_at: item.created_at
              }
            }));
          }
        }

        return resultado;
      })
    );

    console.log('✅ Leads para envio encontrados:', leadsFormatados?.length);
    return leadsFormatados;
  }
}