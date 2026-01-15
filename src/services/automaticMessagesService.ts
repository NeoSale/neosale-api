import { supabase } from '../lib/supabase'
import { CreateAutomaticMessageInput, UpdateAutomaticMessageInput, PaginationInput } from '../lib/validators'

export class AutomaticMessagesService {
  // Verificar conexão com Supabase
  private static checkSupabaseConnection() {
    if (!supabase) {
      throw new Error('Supabase não está configurado. Verifique as variáveis de ambiente.')
    }
  }

  // Listar todas as mensagens automáticas com paginação
  static async listarTodos(params: PaginationInput & { clienteId?: string }) {
    AutomaticMessagesService.checkSupabaseConnection();
    console.log('🔄 Listando mensagens automáticas com paginação:', params)
    
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
    
    const { data: automaticMessages, error, count } = await query
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('❌ Erro ao listar mensagens automáticas:', error)
      throw error
    }
    
    const totalPages = Math.ceil((count || 0) / limit)
    
    console.log('✅ Mensagens automáticas listadas:', automaticMessages?.length, 'de', count, 'total')
    return {
      data: automaticMessages,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    }
  }

  // Buscar mensagem automática por ID
  static async buscarPorId(id: string, clienteId?: string) {
    AutomaticMessagesService.checkSupabaseConnection();
    console.log('🔄 Buscando mensagem automática:', id)
    
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

    const { data: automaticMessage, error } = await query.single();
    
    if (error) {
      console.error('❌ Erro ao buscar mensagem automática:', error)
      throw error
    }
    
    console.log('✅ Mensagem automática encontrada:', id)
    return automaticMessage
  }

  // Buscar mensagens automáticas por lead
  static async buscarPorLead(leadId: string, clienteId?: string) {
    AutomaticMessagesService.checkSupabaseConnection();
    console.log('🔄 Buscando mensagens automáticas do lead:', leadId)
    
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

    const { data: automaticMessages, error } = await query
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar mensagens automáticas do lead:', error)
      throw error
    }
    
    console.log('✅ Mensagens automáticas do lead encontradas:', automaticMessages?.length)
    return automaticMessages
  }

  // Criar nova mensagem automática
  static async criar(data: CreateAutomaticMessageInput & { cliente_id?: string }) {
    AutomaticMessagesService.checkSupabaseConnection();
    console.log('🔄 Criando mensagem automática:', data)
    
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

    const { data: automaticMessage, error } = await supabase!
      .from('automatic_messages')
      .insert(insertData)
      .select(`
        *,
        mensagem:id_mensagem(*),
        lead:id_lead(*)
      `)
      .single()
    
    if (error) {
      console.error('❌ Erro ao criar mensagem automática:', error)
      throw error
    }
    
    console.log('✅ Mensagem automática criada com sucesso:', automaticMessage.id)
    return automaticMessage
  }

  // Atualizar mensagem automática
  static async atualizar(id: string, data: UpdateAutomaticMessageInput, clienteId?: string) {
    AutomaticMessagesService.checkSupabaseConnection();
    console.log('🔄 Atualizando mensagem automática:', id, data)
    
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

    const { data: automaticMessage, error } = await query
      .select(`
        *,
        mensagem:id_mensagem(*),
        lead:id_lead(*)
      `)
      .single()
    
    if (error) {
      console.error('❌ Erro ao atualizar mensagem automática:', error)
      throw error
    }
    
    console.log('✅ Mensagem automática atualizada com sucesso:', id)
    return automaticMessage
  }

  // Deletar mensagem automática
  static async deletar(id: string, clienteId?: string) {
    AutomaticMessagesService.checkSupabaseConnection();
    console.log('🔄 Deletando mensagem automática:', id)
    
    let query = supabase!
      .from('automatic_messages')
      .delete()
      .eq('id', id);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { error } = await query;
    
    if (error) {
      console.error('❌ Erro ao deletar mensagem automática:', error)
      throw error
    }
    
    console.log('✅ Mensagem automática deletada com sucesso:', id)
    return { message: 'Mensagem automática deletada com sucesso' }
  }

  // Buscar mensagens automáticas por status
  static async buscarPorStatus(status: 'sucesso' | 'erro', clienteId?: string) {
    AutomaticMessagesService.checkSupabaseConnection();
    console.log('🔄 Buscando mensagens automáticas por status:', status)
    
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

    const { data: automaticMessages, error } = await query
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar mensagens automáticas por status:', error)
      throw error
    }
    
    console.log('✅ Mensagens automáticas por status encontradas:', automaticMessages?.length)
    return automaticMessages
  }

  // Buscar mensagens automáticas com embedding
  static async buscarComEmbedding(clienteId?: string) {
    AutomaticMessagesService.checkSupabaseConnection();
    console.log('🔄 Buscando mensagens automáticas com embedding')
    
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

    const { data: automaticMessages, error } = await query
      .not('embedding', 'is', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro ao buscar mensagens automáticas com embedding:', error)
      throw error
    }
    
    console.log('✅ Mensagens automáticas com embedding encontradas:', automaticMessages?.length)
    return automaticMessages
  }

  // Buscar leads para envio de mensagens com priorização
  static async buscarLeadsParaEnvio(clienteId: string, quantidade: number) {
    AutomaticMessagesService.checkSupabaseConnection();
    console.log('🔄 Buscando leads para envio:', { clienteId, quantidade });

    // Query complexa que prioriza:
    // 1. Leads com mensagem automática anterior que precisam da próxima mensagem (ordenados por data da última mensagem + período)
    // 2. Leads sem mensagem automática ainda (ordenados por data de criação)
    const { data: leadsParaEnvio, error } = await supabase!
      .rpc('buscar_leads_para_automatic_messages', {
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
          tem_automatic_messages_anterior: lead.tem_automatic_messages_anterior
        };

        // Se tem mensagem automática anterior, buscar mensagens anteriores
        if (lead.tem_automatic_messages_anterior) {
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

  // Buscar estatísticas de mensagens automáticas por dia
  static async getEstatisticasPorDia(clienteId: string) {
    AutomaticMessagesService.checkSupabaseConnection();
    console.log('🔄 Buscando estatísticas de mensagens automáticas por dia para cliente:', clienteId)
    
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
        console.error('❌ Erro ao buscar estatísticas de mensagens automáticas:', error)
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
    
    allData.forEach(automaticMessage => {
      const data = new Date(automaticMessage.created_at).toISOString().split('T')[0] // YYYY-MM-DD
      
      if (!estatisticas.has(data)) {
        estatisticas.set(data, {
          data,
          qtd_sucesso: 0,
          qtd_erro: 0,
          total: 0
        })
      }
      
      const stats = estatisticas.get(data)
      if (automaticMessage.status === 'sucesso') {
        stats.qtd_sucesso++
      } else if (automaticMessage.status === 'erro') {
        stats.qtd_erro++
      }
      stats.total++
    })
    
    const resultado = Array.from(estatisticas.values()).sort((a, b) => b.data.localeCompare(a.data))
    
    console.log('✅ Estatísticas de mensagens automáticas encontradas:', resultado.length, 'dias')
    return resultado
  }

  // Buscar detalhes de mensagens automáticas por data
  static async getDetalhesPorData(clienteId: string, data: string) {
    AutomaticMessagesService.checkSupabaseConnection();
    console.log('🔄 Buscando detalhes de mensagens automáticas para cliente:', clienteId, 'data:', data)
    
    const dataInicio = `${data}T00:00:00.000Z`
    const dataFim = `${data}T23:59:59.999Z`
    
    const { data: automaticMessages, error } = await supabase!
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
      console.error('❌ Erro ao buscar detalhes de mensagens automáticas:', error)
      throw error
    }
    
    const resultado = automaticMessages?.map(automaticMessage => {
      const lead = Array.isArray(automaticMessage.lead) ? automaticMessage.lead[0] : automaticMessage.lead;
      return {
        id_lead: lead?.id || null,
        nome_lead: lead?.nome || 'N/A',
        telefone_lead: lead?.telefone || 'N/A',
        horario: automaticMessage.created_at,
        status: automaticMessage.status,
        mensagem_enviada: automaticMessage.mensagem_enviada,
        mensagem_erro: automaticMessage.erro || null
      }
    }) || []
    
    console.log('✅ Detalhes de mensagens automáticas encontrados:', resultado.length, 'registros')
    return resultado
  }
}
