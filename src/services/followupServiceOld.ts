import { supabase } from '../lib/supabase'
import { CreateFollowupInput, UpdateFollowupInput, PaginationInput } from '../lib/validators'

export class FollowupServiceOld {
  // Verificar conexão com Supabase
  private static checkSupabaseConnection() {
    if (!supabase) {
      throw new Error('Supabase não está configurado. Verifique as variáveis de ambiente.')
    }
  }

  // Listar todos os followups com paginação
  static async listarTodosOld(params: PaginationInput & { clienteId?: string }) {
    FollowupServiceOld.checkSupabaseConnection();
    console.log('🔄 Listando followups com paginação:', params)
    
    const { page, limit, search, clienteId } = params
    const offset = (page - 1) * limit
    
    let query = supabase!
      .from('automatic_messages')
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
  static async buscarPorIdOld(id: string, clienteId?: string) {
    FollowupServiceOld.checkSupabaseConnection();
    console.log('🔄 Buscando followup:', id)
    
    let query = supabase!
      .from('automatic_messages')
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
  static async buscarPorLeadOld(leadId: string, clienteId?: string) {
    FollowupServiceOld.checkSupabaseConnection();
    console.log('🔄 Buscando followups do lead:', leadId)
    
    let query = supabase!
      .from('automatic_messages')
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
  static async criarOld(data: CreateFollowupInput & { cliente_id?: string }) {
    FollowupServiceOld.checkSupabaseConnection();
    console.log('🔄 Criando followup:', data)
    
    const insertData: any = {
      id_mensagem: data.id_mensagem,
      id_lead: data.id_lead,
      status: data.status,
      erro: data.erro,
      mensagem_enviada: data.mensagem_enviada
    };

    if (data.cliente_id) {
      insertData.cliente_id = data.cliente_id;
    }

    const { data: followup, error } = await supabase!
      .from('automatic_messages')
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
  static async atualizarOld(id: string, data: UpdateFollowupInput, clienteId?: string) {
    FollowupServiceOld.checkSupabaseConnection();
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

    
    let query = supabase!
      .from('automatic_messages')
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
  static async deletarOld(id: string, clienteId?: string) {
    FollowupServiceOld.checkSupabaseConnection();
    console.log('🔄 Deletando followup:', id)
    
    let query = supabase!
      .from('automatic_messages')
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
  static async buscarPorStatusOld(status: 'sucesso' | 'erro', clienteId?: string) {
    FollowupServiceOld.checkSupabaseConnection();
    console.log('🔄 Buscando followups por status:', status)
    
    let query = supabase!
      .from('automatic_messages')
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
  static async buscarComEmbeddingOld(clienteId?: string) {
    FollowupServiceOld.checkSupabaseConnection();
    console.log('🔄 Buscando followups com embedding')
    
    let query = supabase!
      .from('automatic_messages')
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
  static async buscarLeadsParaEnvioOld(clienteId: string, quantidade: number) {
    FollowupServiceOld.checkSupabaseConnection();
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

    console.log('🔍 Debug - Dados Brutos retornados pela RPC:', leadsParaEnvio);
    console.log('🔍 Debug - Dados retornados pela RPC:', JSON.stringify(leadsParaEnvio?.[0], null, 2));
    console.log('🔍 Debug - Campos disponíveis:', Object.keys(leadsParaEnvio?.[0] || {}));

    // Transformar os dados no formato solicitado
    const leadsFormatados = await Promise.all(
      (leadsParaEnvio || []).map(async (lead: any) => {
        const resultado: any = {
          lead: {
            id: lead.lead_id,
            nome: lead.lead_nome,
            telefone: lead.lead_telefone,
            email: lead.lead_email,
            created_at: lead.lead_created_at,
            ai_habilitada: lead.lead_ai_habilitada
          },
          mensagem: {
            id: lead.mensagem_id,
            nome: lead.mensagem_nome,
            texto: lead.mensagem_texto,
            created_at: lead.mensagem_created_at
          },
          tem_followup_anterior: lead.tem_followup_anterior
        };

        // Se tem followup anterior, buscar mensagens anteriores
        if (lead.tem_followup_anterior) {
          const { data: mensagensAnteriores, error: errorMensagens } = await supabase!
            .from('automatic_messages')
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

  // Buscar estatísticas de followups por dia
  static async getEstatisticasPorDiaOld(clienteId: string) {
    FollowupServiceOld.checkSupabaseConnection();
    console.log('🔄 Buscando estatísticas de followups por dia para cliente:', clienteId)
    
    // Buscar todos os registros usando paginação
    let allData: any[] = []
    let from = 0
    const pageSize = 1000
    let hasMore = true
    
    while (hasMore) {
      const { data, error } = await supabase!
        .from('automatic_messages')
        .select(`
          created_at,
          status
        `)
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1)
      
      if (error) {
        console.error('❌ Erro ao buscar estatísticas de followups:', error)
        throw error
      }
      
      if (data && data.length > 0) {
        allData = allData.concat(data)
        from += pageSize
        hasMore = data.length === pageSize
      } else {
        hasMore = false
      }
    }
    
    // Agrupar por data e status
    const estatisticas = new Map()
    
    allData.forEach(followup => {
      const data = new Date(followup.created_at).toISOString().split('T')[0] // YYYY-MM-DD
      
      if (!estatisticas.has(data)) {
        estatisticas.set(data, {
          data,
          qtd_sucesso: 0,
          qtd_erro: 0,
          total: 0
        })
      }
      
      const stats = estatisticas.get(data)
      if (followup.status === 'sucesso') {
        stats.qtd_sucesso++
      } else if (followup.status === 'erro') {
        stats.qtd_erro++
      }
      stats.total++
    })
    
    const resultado = Array.from(estatisticas.values()).sort((a, b) => b.data.localeCompare(a.data))
    
    console.log('✅ Estatísticas de followups encontradas:', resultado.length, 'dias')
    return resultado
  }

  // Buscar detalhes de followups por data
  static async getDetalhesPorDataOld(clienteId: string, data: string) {
    FollowupServiceOld.checkSupabaseConnection();
    console.log('🔄 Buscando detalhes de followups para cliente:', clienteId, 'data:', data)
    
    const dataInicio = `${data}T00:00:00.000Z`
    const dataFim = `${data}T23:59:59.999Z`
    
    const { data: followups, error } = await supabase!
      .from('automatic_messages')
      .select(`
        id,
        status,
        erro,
        mensagem_enviada,
        created_at,
        lead:id_lead(
          id,
          nome,
          telefone
        )
      `)
      .eq('cliente_id', clienteId)
      .gte('created_at', dataInicio)
      .lte('created_at', dataFim)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro ao buscar detalhes de followups:', error)
      throw error
    }
    
    const resultado = followups?.map(followup => {
      const lead = Array.isArray(followup.lead) ? followup.lead[0] : followup.lead;
      return {
        id_lead: lead?.id || null,
        nome_lead: lead?.nome || 'N/A',
        telefone_lead: lead?.telefone || 'N/A',
        horario: followup.created_at,
        status: followup.status,
        mensagem_enviada: followup.mensagem_enviada,
        mensagem_erro: followup.erro || null
      }
    }) || []
    
    console.log('✅ Detalhes de followups encontrados:', resultado.length, 'registros')
    return resultado
  }
}
