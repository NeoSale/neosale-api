import { supabase } from '../lib/supabase';
import { ChatHistory, CreateChatHistoryRequest, UpdateChatHistoryRequest, ChatHistoryResponse, GetChatHistoriesResponse, GetLeadsWithLastMessageResponse, GetGroupedChatHistoriesResponse, GetClienteChatResponse } from '../models/chat.model';
import evolutionApiService from './evolution-api.service';

export class N8nChatHistoriesService {
  // Verificar se Supabase está configurado
  private static checkSupabaseConnection() {
    if (!supabase) {
      throw new Error('Supabase não está configurado. Configure as credenciais no arquivo .env');
    }
  }

  // Criar uma nova mensagem de chat (apenas gravar na tabela)
  static async createSimpleChatHistory(data: CreateChatHistoryRequest): Promise<ChatHistoryResponse> {
    N8nChatHistoriesService.checkSupabaseConnection();
    console.log('🔄 Criando nova mensagem de chat simples para session_id:', data.session_id);

    try {
      // Gravar apenas na tabela n8n_chat_histories
      const { data: chatHistory, error } = await supabase!
        .from('n8n_chat_histories')
        .insert({
          session_id: data.session_id,
          message: data.message
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar mensagem de chat:', error);
        throw error;
      }

      console.log('✅ Mensagem de chat criada com sucesso (simples):', chatHistory.id);
      return chatHistory;
    } catch (error: any) {
      console.error('❌ Erro no N8nChatHistoriesService.createSimpleChatHistory:', error);
      throw error;
    }
  }

  // Criar uma nova mensagem de chat
  static async createChatHistory(data: CreateChatHistoryRequest): Promise<ChatHistoryResponse> {
    N8nChatHistoriesService.checkSupabaseConnection();
    console.log('🔄 Criando nova mensagem de chat para session_id:', data.session_id);

    try {
      // 1. Gravar na tabela n8n_chat_histories
      const { data: chatHistory, error } = await supabase!
        .from('n8n_chat_histories')
        .insert({
          session_id: data.session_id,
          message: data.message
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar mensagem de chat:', error);
        throw error;
      }

      console.log('✅ Mensagem de chat criada com sucesso:', chatHistory.id);

      // 2. Buscar telefone e instance_name do lead pelo session_id
      try {
        const { data: leadData, error: leadError } = await supabase!
          .from('leads')
          .select('telefone, instance_name, cliente_id')
          .eq('id', data.session_id)
          .eq('deletado', false)
          .single();

        if (leadError || !leadData) {
          console.log('⚠️ Lead não encontrado para session_id:', data.session_id);
          return chatHistory;
        }

        const { telefone, instance_name, cliente_id } = leadData;
        console.log('📞 Lead encontrado - Telefone:', telefone, 'Instance:', instance_name);

        if (!telefone || !instance_name) {
          console.log('⚠️ Telefone ou instance_name não disponível para o lead');
          return chatHistory;
        }

        // 3. Buscar dados da instância na evolution_api pelo instance_name
        const { data: evolutionData, error: evolutionError } = await supabase!
          .from('evolution_api')
          .select('id')
          .eq('instance_name', instance_name)
          .eq('cliente_id', cliente_id)
          .single();

        if (evolutionError || !evolutionData) {
          console.log('⚠️ Instância Evolution API não encontrada:', instance_name);
          return chatHistory;
        }

        console.log('🔗 Instância Evolution API encontrada:', instance_name);

        // Usar a apiKey global do serviço Evolution API
        const apiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || '';
        if (!apiKey) {
          console.log('⚠️ API Key da Evolution API não configurada');
          return chatHistory;
        }

        // 4. Extrair texto da mensagem para envio
        let messageText = '';
        if (typeof data.message === 'string') {
          messageText = data.message;
        } else if (data.message && typeof data.message === 'object') {
          // Tentar extrair texto de diferentes formatos possíveis
          messageText = data.message.text || data.message.content || data.message.message || JSON.stringify(data.message);
        }

        if (!messageText) {
          console.log('⚠️ Não foi possível extrair texto da mensagem para envio');
          return chatHistory;
        }

        // 5. Chamar o endpoint sendText
        try {
          console.log('📤 Enviando mensagem via Evolution API...');
          await evolutionApiService.sendText(
            instance_name,
            telefone,
            messageText,
            apiKey
          );
          console.log('✅ Mensagem enviada com sucesso via Evolution API');
        } catch (sendError: any) {
          console.error('❌ Erro ao enviar mensagem via Evolution API:', sendError.message);
          // Não falhar a criação do chat history se o envio falhar
        }

      } catch (integrationError: any) {
        console.error('❌ Erro na integração com Evolution API:', integrationError.message);
        // Não falhar a criação do chat history se a integração falhar
      }

      return chatHistory;
    } catch (error: any) {
      console.error('❌ Erro no N8nChatHistoriesService.createChatHistory:', error);
      throw error;
    }
  }

  // Buscar lista de leads do cliente com última mensagem (otimizado)
  static async getChatHistoriesByClienteId(
    clienteId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<GetLeadsWithLastMessageResponse> {
    N8nChatHistoriesService.checkSupabaseConnection();
    console.log('🔄 Buscando leads com última mensagem para cliente_id:', clienteId);

    try {
      const offset = (page - 1) * limit;

      // Query otimizada usando window functions para buscar leads únicos por nome
      // com suas últimas mensagens em uma única consulta
      const { data: leadsWithMessages, error: queryError } = await supabase!
        .rpc('get_leads_with_last_message_optimized', {
          p_cliente_id: clienteId,
          p_limit: limit,
          p_offset: offset
        });

      if (queryError) {
        console.error('❌ Erro na consulta otimizada, usando fallback:', queryError);
        // Fallback para a implementação anterior em caso de erro
        return await N8nChatHistoriesService.getChatHistoriesByClienteIdFallback(clienteId, page, limit);
      }

      // Contar total de leads únicos para paginação
      const { data: totalData, error: countError } = await supabase!
        .rpc('count_unique_leads_with_messages', {
          p_cliente_id: clienteId
        });

      const total = totalData || 0;

      console.log('✅ Leads únicos com última mensagem encontrados (otimizado):', leadsWithMessages?.length || 0);
      return {
        data: leadsWithMessages || [],
        total,
        page,
        limit
      };
    } catch (error: any) {
      console.error('❌ Erro no N8nChatHistoriesService.getChatHistoriesByClienteId:', error);
      // Fallback para a implementação anterior
      return await N8nChatHistoriesService.getChatHistoriesByClienteIdFallback(clienteId, page, limit);
    }
  }

  // Implementação fallback (versão anterior) para casos de erro
  static async getChatHistoriesByClienteIdFallback(
    clienteId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<GetLeadsWithLastMessageResponse> {
    console.log('🔄 Usando implementação fallback para cliente_id:', clienteId);

    try {
      const offset = (page - 1) * limit;

      // Primeiro, buscar todos os leads ativos do cliente
      const { data: allLeads, error: leadsError } = await supabase!
        .from('leads')
        .select('id, nome, profile_picture_url, telefone')
        .eq('cliente_id', clienteId)
        .eq('deletado', false);

      if (leadsError) {
        console.error('❌ Erro ao buscar leads:', leadsError);
        throw leadsError;
      }

      if (!allLeads || allLeads.length === 0) {
        return {
          data: [],
          total: 0,
          page,
          limit
        };
      }

      // Agrupar leads por nome e pegar apenas o mais recente de cada grupo
      const leadsByName = new Map();
      
      for (const lead of allLeads) {
        const { data: lastMessage, error: messageError } = await supabase!
          .from('n8n_chat_histories')
          .select('message, created_at')
          .eq('session_id', lead.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (messageError && messageError.code !== 'PGRST116') {
          console.error('❌ Erro ao buscar última mensagem para lead:', lead.id, messageError);
        }

        const leadData = {
          id: lead.id,
          session_id: lead.id,
          nome: lead.nome,
          ultima_mensagem: lastMessage?.message || null,
          data_ultima_mensagem: lastMessage?.created_at || null,
          profile_picture_url: lead.profile_picture_url || null,
          telefone: lead.telefone || null
        };

        // Se não existe lead com esse nome ou se a mensagem atual é mais recente
        if (!leadsByName.has(lead.nome) || 
            (lastMessage?.created_at && leadsByName.get(lead.nome).data_ultima_mensagem && 
             new Date(lastMessage.created_at) > new Date(leadsByName.get(lead.nome).data_ultima_mensagem))) {
          leadsByName.set(lead.nome, leadData);
        }
      }

      // Converter Map para array, ordenar por data decrescente e aplicar paginação
       const uniqueLeads = Array.from(leadsByName.values())
         .sort((a, b) => {
           if (!a.data_ultima_mensagem && !b.data_ultima_mensagem) return 0;
           if (!a.data_ultima_mensagem) return 1;
           if (!b.data_ultima_mensagem) return -1;
           return new Date(b.data_ultima_mensagem).getTime() - new Date(a.data_ultima_mensagem).getTime();
         });
       const totalUnique = uniqueLeads.length;
       const paginatedLeads = uniqueLeads.slice(offset, offset + limit);

      console.log('✅ Leads únicos com última mensagem encontrados (fallback):', paginatedLeads.length);
      return {
        data: paginatedLeads,
        total: totalUnique,
        page,
        limit
      };
    } catch (error: any) {
      console.error('❌ Erro no N8nChatHistoriesService.getChatHistoriesByClienteIdFallback:', error);
      throw error;
    }
  }

  // Buscar mensagens de chat por session_id (id do lead)
  static async getChatHistoriesBySessionId(
    sessionId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<GetChatHistoriesResponse> {
    N8nChatHistoriesService.checkSupabaseConnection();
    console.log('🔄 Buscando mensagens para session_id:', sessionId);

    try {
      const offset = (page - 1) * limit;

      const { data: allChatHistories, error } = await supabase!
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', sessionId)
        .order('id', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar mensagens de chat por session_id:', error);
        throw error;
      }

      // Filtrar mensagens que NÃO contenham "Follow Up:" ou "FollowUp:"
      const filteredChatHistories = (allChatHistories || []).filter((chat: any) => {
        const messageContent = chat.message?.content || '';
        console.log('🔍 Verificando mensagem:', messageContent);
        const hasFollowUp = messageContent.includes('Follow Up:') || messageContent.includes('FollowUp:');
        console.log('🔍 Contém Follow Up?', hasFollowUp);
        return !hasFollowUp;
      });

      // Aplicar paginação após filtrar
      const chatHistories = filteredChatHistories.slice(offset, offset + limit);
      const total = filteredChatHistories.length;

      console.log('✅ Mensagens de chat encontradas para session_id (sem Follow Up):', chatHistories?.length || 0);
      return {
        data: chatHistories || [],
        total: total
      };
    } catch (error: any) {
      console.error('❌ Erro no N8nChatHistoriesService.getChatHistoriesBySessionId:', error);
      throw error;
    }
  }

  // Buscar uma mensagem de chat por ID
  static async getChatHistoryById(id: number): Promise<ChatHistoryResponse | null> {
    N8nChatHistoriesService.checkSupabaseConnection();
    console.log('🔄 Buscando mensagem de chat por ID:', id);

    try {
      const { data: chatHistory, error } = await supabase!
        .from('n8n_chat_histories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('⚠️ Mensagem de chat não encontrada:', id);
          return null;
        }
        console.error('❌ Erro ao buscar mensagem de chat por ID:', error);
        throw error;
      }

      console.log('✅ Mensagem de chat encontrada:', id);
      return chatHistory;
    } catch (error: any) {
      console.error('❌ Erro no N8nChatHistoriesService.getChatHistoryById:', error);
      throw error;
    }
  }

  // Atualizar uma mensagem de chat
  static async updateChatHistory(id: number, data: UpdateChatHistoryRequest): Promise<ChatHistoryResponse> {
    N8nChatHistoriesService.checkSupabaseConnection();
    console.log('🔄 Atualizando mensagem de chat ID:', id);

    try {
      const { data: chatHistory, error } = await supabase!
        .from('n8n_chat_histories')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar mensagem de chat:', error);
        throw error;
      }

      console.log('✅ Mensagem de chat atualizada com sucesso:', id);
      return chatHistory;
    } catch (error: any) {
      console.error('❌ Erro no N8nChatHistoriesService.updateChatHistory:', error);
      throw error;
    }
  }

  // Deletar uma mensagem de chat
  static async deleteChatHistory(id: number): Promise<void> {
    N8nChatHistoriesService.checkSupabaseConnection();
    console.log('🔄 Deletando mensagem de chat ID:', id);

    try {
      const { error } = await supabase!
        .from('n8n_chat_histories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao deletar mensagem de chat:', error);
        throw error;
      }

      console.log('✅ Mensagem de chat deletada com sucesso:', id);
    } catch (error: any) {
      console.error('❌ Erro no N8nChatHistoriesService.deleteChatHistory:', error);
      throw error;
    }
  }

  // Buscar registros agrupados por session_id com join na tabela leads
  static async getAllChatHistoriesByClienteId(
    clienteId: string,
    page: number,
    limit: number
  ): Promise<GetClienteChatResponse> {
    N8nChatHistoriesService.checkSupabaseConnection();
    console.log('🔄 Buscando registros de chat agrupados por session_id para cliente_id:', clienteId);

    try {
      const offset = (page - 1) * limit;

      // Primeira query: buscar histórico de chat
      // Buscar históricos de chat e filtrar para obter apenas o mais recente de cada session_id
      const { data: allChatHistories, error: chatError } = await supabase!
        .from('n8n_chat_histories')
        .select('session_id, message, created_at')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      // Filtrar para obter apenas o registro mais recente de cada session_id
      const chatHistories = allChatHistories ? 
        Object.values(
          allChatHistories.reduce((acc: Record<string, any>, item: any) => {
            if (!acc[item.session_id] || new Date(item.created_at) > new Date(acc[item.session_id].created_at)) {
              acc[item.session_id] = item;
            }
            return acc;
          }, {} as Record<string, any>)
        ) : [];

      if (chatError) {
        console.error('❌ Erro ao buscar histórico de chat:', chatError);
        throw chatError;
      }

      if (!chatHistories || chatHistories.length === 0) {
        console.log('📭 Nenhum registro de chat encontrado para o cliente:', clienteId);
        return {
          data: [],
          total: 0,
          page,
          limit
        };
      }

      // Agrupar por session_id e pegar a última mensagem de cada grupo
      const groupedBySession = chatHistories.reduce((acc: any, record: any) => {
        const sessionId = record.session_id;
        
        if (!acc[sessionId] || new Date(record.created_at) > new Date(acc[sessionId].created_at)) {
          acc[sessionId] = {
            session_id: sessionId,
            message: record.message,
            created_at: record.created_at
          };
        }
        
        return acc;
      }, {});

      // Obter session_ids únicos
      const sessionIds = Object.keys(groupedBySession);

      if (sessionIds.length === 0) {
        return {
          data: [],
          total: 0,
          page,
          limit
        };
      }

      // Segunda query: buscar dados dos leads
      const { data: leads, error: leadsError } = await supabase!
        .from('leads')
        .select('id, nome, telefone, profile_picture_url')
        .in('id', sessionIds)
        .eq('cliente_id', clienteId)
        .eq('deletado', false);

      if (leadsError) {
        console.error('❌ Erro ao buscar dados dos leads:', leadsError);
        throw leadsError;
      }

      // Criar mapa de leads por ID
      const leadsMap = (leads || []).reduce((acc: any, lead: any) => {
        acc[lead.id] = lead;
        return acc;
      }, {});

      // Combinar dados de chat com dados dos leads no formato solicitado
       const combinedData = Object.values(groupedBySession)
         .filter((chatRecord: any) => leadsMap[chatRecord.session_id]) // Filtrar apenas registros com lead válido
         .map((chatRecord: any) => {
           const lead = leadsMap[chatRecord.session_id];
           
           return {
             id: chatRecord.session_id,
             session_id: chatRecord.session_id,
             nome: lead.nome,
             ultima_mensagem: chatRecord.message,
             data_ultima_mensagem: chatRecord.created_at,
             profile_picture_url: lead.profile_picture_url,
             telefone: lead.telefone
           };
         })
         .sort((a: any, b: any) => new Date(b.data_ultima_mensagem).getTime() - new Date(a.data_ultima_mensagem).getTime());

      // Aplicar paginação
      const paginatedResults = combinedData.slice(offset, offset + limit);
      const total = combinedData.length;

      console.log('✅ Registros de chat agrupados encontrados para cliente_id:', paginatedResults.length);
      return {
        data: paginatedResults,
        total,
        page,
        limit
      };
    } catch (error: any) {
      console.error('❌ Erro no N8nChatHistoriesService.getAllChatHistoriesByClienteId:', error);
      throw error;
    }
  }

  // Deletar todas as mensagens de uma sessão
  static async deleteChatHistoriesBySessionId(sessionId: string): Promise<void> {
    N8nChatHistoriesService.checkSupabaseConnection();
    console.log('🔄 Deletando todas as mensagens da sessão:', sessionId);

    try {
      const { error } = await supabase!
        .from('n8n_chat_histories')
        .delete()
        .eq('session_id', sessionId);

      if (error) {
        console.error('❌ Erro ao deletar mensagens da sessão:', error);
        throw error;
      }

      console.log('✅ Mensagens da sessão deletadas com sucesso:', sessionId);
    } catch (error: any) {
      console.error('❌ Erro no N8nChatHistoriesService.deleteChatHistoriesBySessionId:', error);
      throw error;
    }
  }

  // Buscar mensagens por tipo e session_id
  static async getMessagesBySessionIDType(
    sessionId: string,
    messageType?: string
  ): Promise<GetChatHistoriesResponse> {
    N8nChatHistoriesService.checkSupabaseConnection();
    console.log('🔄 Buscando última mensagem para session_id:', sessionId, 'tipo:', messageType);

    try {
      // Buscar a última mensagem da sessão
      let query = supabase!
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1);

      const { data: chatHistories, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar mensagens:', error);
        throw error;
      }

      console.log(`📊 Mensagens encontradas: ${chatHistories?.length || 0}`);

      let lastMessage = null;
      
      if (chatHistories && chatHistories.length > 0) {
        const msg = chatHistories[0];
        
        // Se um tipo específico foi solicitado, verificar se a mensagem corresponde
        if (messageType) {
          try {
            let messageObj = msg.message;
            if (typeof messageObj === 'string') {
              messageObj = JSON.parse(messageObj);
            }
            if (messageObj && messageObj.type === messageType) {
              lastMessage = msg;
            }
          } catch (parseError) {
            console.warn('⚠️ Erro ao parsear mensagem:', parseError, 'Mensagem:', msg.message);
          }
        } else {
          // Se nenhum tipo específico foi solicitado, retornar a última mensagem
          lastMessage = msg;
        }
      }

      const result = lastMessage ? [lastMessage] : [];
      console.log(`✅ Última mensagem encontrada para session_id:`, sessionId, result.length > 0 ? 'Sim' : 'Não');

      return {
         data: result,
         total: result.length
       };
    } catch (error: any) {
      console.error('❌ Erro no N8nChatHistoriesService.getMessagesBySessionIDType:', error);
      throw error;
    }
  }

  // Marcar a última mensagem como erro
  static async markLastMessageAsError(sessionId: string, messageType: 'ai' | 'human', errorMessage?: string): Promise<ChatHistoryResponse> {
    N8nChatHistoriesService.checkSupabaseConnection();
    console.log('🔄 Marcando última mensagem como erro para session_id:', sessionId, 'tipo:', messageType);

    try {
      // 1. Buscar a última mensagem da sessão do tipo especificado
      const { data: messages, error: fetchError } = await supabase!
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Erro ao buscar mensagens:', fetchError);
        throw new Error('Erro ao buscar mensagens da sessão');
      }

      if (!messages || messages.length === 0) {
        throw new Error('Nenhuma mensagem encontrada para esta sessão');
      }

      // 2. Filtrar mensagens pelo tipo especificado
      let lastMessage = null;
      for (const msg of messages) {
        try {
          let messageObj = msg.message;
          if (typeof messageObj === 'string') {
            messageObj = JSON.parse(messageObj);
          }
          if (messageObj && messageObj.type === messageType) {
            lastMessage = msg;
            break;
          }
        } catch (parseError) {
          console.warn('⚠️ Erro ao parsear mensagem:', parseError, 'Mensagem:', msg.message);
        }
      }

      if (!lastMessage) {
        throw new Error(`Nenhuma mensagem do tipo '${messageType}' encontrada para esta sessão`);
      }

      // 3. Atualizar a mensagem com status de erro
      const { data: updatedMessage, error: updateError } = await supabase!
        .from('n8n_chat_histories')
        .update({
          status: 'erro',
          erro: errorMessage || `Erro processando mensagem do tipo ${messageType}`
        })
        .eq('id', lastMessage.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar mensagem:', updateError);
        throw updateError;
      }

      console.log('✅ Última mensagem do tipo', messageType, 'marcada como erro com sucesso:', updatedMessage.id);
      return updatedMessage;
    } catch (error: any) {
      console.error('❌ Erro no N8nChatHistoriesService.markLastMessageAsError:', error);
      throw error;
    }
  }
}

export default N8nChatHistoriesService;