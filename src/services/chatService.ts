import { supabase } from '../lib/supabase';
import evolutionApiServiceV2 from './evolution-api-v2.service';

// Interfaces para a nova tabela chat
interface Chat {
  id: string;
  lead_id: string;
  cliente_id: string;
  tipo: 'human' | 'ai';
  mensagem: string;
  source?: string;
  status: 'sucesso' | 'erro';
  erro?: string;
  created_at: string;
}

interface CreateChatData {
  lead_id: string;
  cliente_id: string;
  tipo: 'human' | 'ai';
  mensagem: string;
  source?: string;
  status?: 'sucesso' | 'erro';
  erro?: string | undefined;
}

interface UpdateChatData {
  tipo?: 'human' | 'ai';
  mensagem?: string;
  source?: string;
  status?: 'sucesso' | 'erro';
  erro?: string | undefined;
}

interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ChatService {
  // Verificar se Supabase está configurado
  private static checkSupabaseConnection() {
    if (!supabase) {
      throw new Error('Supabase não está configurado. Configure as credenciais no arquivo .env');
    }
  }

  // Criar nova mensagem de chat
  static async create(data: CreateChatData): Promise<Chat> {
    ChatService.checkSupabaseConnection();
    console.log('🔄 Criando nova mensagem de chat para lead_id:', data.lead_id);

    try {
      const { data: chat, error } = await supabase!
        .from('chat')
        .insert({
          lead_id: data.lead_id,
          cliente_id: data.cliente_id,
          tipo: data.tipo,
          mensagem: data.mensagem,
          source: data.source,
          status: data.status || 'sucesso',
          erro: data.erro
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar mensagem de chat:', error);
        throw new Error(`Erro ao criar mensagem: ${error.message}`);
      }

      console.log('✅ Mensagem de chat criada com sucesso:', chat.id);
      return chat;
    } catch (error: any) {
      console.error('❌ Erro no ChatService.create:', error);
      throw error;
    }
  }

  // Listar leads únicos com suas últimas mensagens (versão otimizada)
  static async getAll(
    cliente_id: string
  ): Promise<PaginationResult<any>> {
    ChatService.checkSupabaseConnection();
    console.log('🔄 Buscando leads com última mensagem para cliente_id:', cliente_id);

    try {
      // Tentar usar função RPC otimizada primeiro
      try {
        const { data: allLeadsWithMessages, error } = await supabase!
          .rpc('get_leads_with_last_message', {
            p_cliente_id: cliente_id,
            p_offset: 0  // Sempre buscar do início
          });

        if (!error && allLeadsWithMessages) {
          // Retornar todos os resultados sem paginação
          const total = allLeadsWithMessages.length;

          console.log(`✅ RPC: ${total} leads únicos encontrados`);

          return {
            data: allLeadsWithMessages,
            pagination: {
              page: 1,
              total,
              totalPages: 1,
              hasNext: false,
              hasPrev: false
            }
          };
        }
      } catch (rpcError) {
        console.log('🔄 Função RPC não disponível, usando query otimizada...');
      }

      // Fallback: Query otimizada usando Supabase client
      return await ChatService.getAllOptimized(cliente_id);

    } catch (error: any) {
      console.error('❌ Erro no ChatService.getAll:', error);
      throw error;
    }
  }

  // Método otimizado usando Supabase client (sem RPC)
  private static async getAllOptimized(
    cliente_id: string
  ): Promise<PaginationResult<any>> {
    console.log('🔄 Executando query otimizada com Supabase client...');

    // Primeiro, buscar todos os leads que têm mensagens
    const { data: leadsWithChat, error: leadsError } = await supabase!
      .from('leads')
      .select(`
        id,
        nome,
        profile_picture_url,
        telefone,
        chat!inner(
          mensagem,
          created_at
        )
      `)
      .eq('cliente_id', cliente_id)
      .eq('deletado', false)
      .order('chat.created_at', { ascending: false });

    if (leadsError) {
      console.error('❌ Erro ao buscar leads com chat:', leadsError);
      throw new Error(`Erro ao buscar leads: ${leadsError.message}`);
    }

    if (!leadsWithChat || leadsWithChat.length === 0) {
      return {
        data: [],
        pagination: {
          page: 1,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }

    // Processar dados para obter leads únicos com última mensagem
    const leadsMap = new Map();

    for (const lead of leadsWithChat) {
      const leadId = lead.id;
      const leadNome = lead.nome;
      
      // Pegar a primeira mensagem (mais recente devido ao order by)
      const lastMessage = lead.chat && lead.chat.length > 0 ? lead.chat[0] : null;
      
      const leadData = {
        id: leadId,
        nome: leadNome,
        profile_picture_url: lead.profile_picture_url,
        telefone: lead.telefone,
        ultima_mensagem: lastMessage?.mensagem || null,
        data_ultima_mensagem: lastMessage?.created_at || null
      };

      // Manter apenas o lead mais recente por nome
      if (!leadsMap.has(leadNome) || 
          (lastMessage?.created_at && leadsMap.get(leadNome).data_ultima_mensagem &&
           new Date(lastMessage.created_at) > new Date(leadsMap.get(leadNome).data_ultima_mensagem))) {
        leadsMap.set(leadNome, leadData);
      }
    }

    // Converter para array e ordenar por data da última mensagem
    const uniqueLeads = Array.from(leadsMap.values())
      .sort((a, b) => {
        if (!a.data_ultima_mensagem && !b.data_ultima_mensagem) return 0;
        if (!a.data_ultima_mensagem) return 1;
        if (!b.data_ultima_mensagem) return -1;
        return new Date(b.data_ultima_mensagem).getTime() - new Date(a.data_ultima_mensagem).getTime();
      });

    // Retornar todos os resultados sem paginação
    const total = uniqueLeads.length;

    console.log(`✅ Otimizado: ${total} leads únicos encontrados`);

    return {
       data: uniqueLeads,
       pagination: {
         page: 1,
         total,
         totalPages: 1,
         hasNext: false,
         hasPrev: false
       }
     };
  }



  // Buscar mensagem por ID
  static async getById(id: string, cliente_id: string): Promise<Chat | null> {
    ChatService.checkSupabaseConnection();
    console.log('🔄 Buscando mensagem de chat por ID:', id);

    try {
      const { data: chat, error } = await supabase!
        .from('chat')
        .select('*')
        .eq('id', id)
        .eq('cliente_id', cliente_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ Mensagem não encontrada');
          return null;
        }
        console.error('❌ Erro ao buscar mensagem:', error);
        throw new Error(`Erro ao buscar mensagem: ${error.message}`);
      }

      console.log('✅ Mensagem encontrada:', chat.id);
      return chat;
    } catch (error: any) {
      console.error('❌ Erro no ChatService.getById:', error);
      throw error;
    }
  }

  // Buscar mensagens por lead_id
  static async getByLeadId(
    lead_id: string,
    cliente_id: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginationResult<Chat>> {
    ChatService.checkSupabaseConnection();
    console.log('🔄 Buscando mensagens por lead_id:', lead_id);

    try {
      const offset = (page - 1) * limit;

      // Buscar total de registros
      const { count, error: countError } = await supabase!
        .from('chat')
        .select('*', { count: 'exact', head: true })
        .eq('lead_id', lead_id)
        .eq('cliente_id', cliente_id);

      if (countError) {
        console.error('❌ Erro ao contar mensagens do lead:', countError);
        throw new Error(`Erro ao contar mensagens: ${countError.message}`);
      }

      // Buscar dados paginados
      const { data: chats, error } = await supabase!
        .from('chat')
        .select('*')
        .eq('lead_id', lead_id)
        .eq('cliente_id', cliente_id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Erro ao buscar mensagens do lead:', error);
        throw new Error(`Erro ao buscar mensagens: ${error.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      console.log(`✅ ${chats?.length || 0} mensagens do lead encontradas`);

      return {
        data: chats || [],
        pagination: {
          page,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error: any) {
      console.error('❌ Erro no ChatService.getByLeadId:', error);
      throw error;
    }
  }

  // Criar uma nova mensagem de chat
  static async createChatSendText(data: CreateChatData): Promise<Chat> {
    ChatService.checkSupabaseConnection();
    console.log('🔄 Criando nova mensagem de chat para lead_id:', data.lead_id);

    try {
      // 1. Buscar telefone e instance_name do lead pelo lead_id
      const { data: leadData, error: leadError } = await supabase!
        .from('leads')
        .select('telefone, instance_name')
        .eq('id', data.lead_id)
        .eq('cliente_id', data.cliente_id)
        .eq('deletado', false)
        .single();

      if (leadError || !leadData) {
        console.log('⚠️ Lead não encontrado para lead_id:', data.lead_id, 'e cliente_id:', data.cliente_id);
        throw new Error('Lead não encontrado ou não pertence ao cliente informado');
      }

      const { telefone, instance_name } = leadData;
      console.log('📞 Lead encontrado - Telefone:', telefone, 'Instance:', instance_name);

      if (!telefone || !instance_name) {
        console.log('⚠️ Telefone ou instance_name não disponível para o lead');
        throw new Error('Telefone ou instance_name não disponível');
      }

      // 2. Buscar dados da instância na evolution_api_v2 pelo instance_name
      const { data: evolutionData, error: evolutionError } = await supabase!
        .from('evolution_api_v2')
        .select('id')
        .eq('instance_name', instance_name)
        .eq('cliente_id', data.cliente_id)
        .single();

      if (evolutionError || !evolutionData) {
        console.log('⚠️ Instância Evolution API não encontrada:', instance_name);
        throw new Error('Instância Evolution API não encontrada');
      }

      console.log('🔗 Instância Evolution API encontrada:', instance_name);

      // Usar a apiKey global do serviço Evolution API
      const apiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY_V2 || '';
      if (!apiKey) {
        console.log('⚠️ API Key da Evolution API não configurada');
        throw new Error('API Key da Evolution API não configurada');
      }

      // 3. Extrair texto da mensagem para envio
      let messageText = '';
      if (typeof data.mensagem === 'string') {
        messageText = data.mensagem;
      } else if (data.mensagem && typeof data.mensagem === 'object') {
        // Tentar extrair texto de diferentes formatos possíveis
        messageText = data.mensagem || data.mensagem || data.mensagem || JSON.stringify(data.mensagem);
      }

      if (!messageText) {
        console.log('⚠️ Não foi possível extrair texto da mensagem para envio');
        throw new Error('Não foi possível extrair texto da mensagem para envio');
      }

      // 4. Chamar o endpoint sendText
      try {
        console.log('📤 Enviando mensagem via Evolution API...');
        await evolutionApiServiceV2.sendText(
          instance_name,
          telefone,
          messageText,
          apiKey
        );
        console.log('✅ Mensagem enviada com sucesso via Evolution API V2');
        data.status = 'sucesso';
      } catch (sendError: any) {
        console.error('❌ Erro ao enviar mensagem via Evolution API V2:', sendError.message);
        data.status = 'erro';
        data.erro = sendError.message;
      }

      // 5. Gravar na tabela chat
      const { data: chat, error } = await supabase!
        .from('chat')
        .insert({
          lead_id: data.lead_id,
          cliente_id: data.cliente_id,
          tipo: data.tipo,
          mensagem: data.mensagem,
          source: data.source,
          status: data.status,
          erro: data.erro
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar mensagem de chat:', error);
        throw new Error(`Erro ao criar mensagem de chat: ${error.message}`);
      }

      console.log('✅ Mensagem de chat criada com sucesso:', chat.id);

      // 6. Gravar na tabela n8n_chat_histories
      const { data: n8nChatHistory, error: n8nChatHistoryError } = await supabase!
        .from('n8n_chat_histories')
        .insert({
          session_id: data.lead_id,
          message: { type: data.tipo, content: data.mensagem, additional_kwargs: {}, response_metadata: {} }
        })
        .select()
        .single();

      if (n8nChatHistoryError) {
        console.error('❌ Erro ao criar mensagem de n8n_chat_histories:', n8nChatHistoryError);
        throw new Error(`Erro ao criar mensagem de n8n_chat_histories: ${n8nChatHistoryError.message}`);
      }

      console.log('✅ Mensagem de chat criada com sucesso:', n8nChatHistory.id);

      return chat;
    } catch (error: any) {
      console.error('❌ Erro no ChatService.createChatSendText:', error);
      throw error;
    }
  }

  // Atualizar mensagem
  static async update(id: string, data: UpdateChatData, cliente_id: string): Promise<Chat> {
    ChatService.checkSupabaseConnection();
    console.log('🔄 Atualizando mensagem de chat:', id);

    try {
      // Verificar se a mensagem existe e pertence ao cliente
      const existingChat = await ChatService.getById(id, cliente_id);
      if (!existingChat) {
        throw new Error('Mensagem não encontrada');
      }

      const { data: chat, error } = await supabase!
        .from('chat')
        .update(data)
        .eq('id', id)
        .eq('cliente_id', cliente_id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar mensagem:', error);
        throw new Error(`Erro ao atualizar mensagem: ${error.message}`);
      }

      console.log('✅ Mensagem atualizada com sucesso:', chat.id);
      return chat;
    } catch (error: any) {
      console.error('❌ Erro no ChatService.update:', error);
      throw error;
    }
  }

  // Deletar mensagem
  static async delete(id: string, cliente_id: string): Promise<void> {
    ChatService.checkSupabaseConnection();
    console.log('🔄 Deletando mensagem de chat:', id);

    try {
      // Verificar se a mensagem existe e pertence ao cliente
      const existingChat = await ChatService.getById(id, cliente_id);
      if (!existingChat) {
        throw new Error('Mensagem não encontrada');
      }

      const { error } = await supabase!
        .from('chat')
        .delete()
        .eq('id', id)
        .eq('cliente_id', cliente_id);

      if (error) {
        console.error('❌ Erro ao deletar mensagem:', error);
        throw new Error(`Erro ao deletar mensagem: ${error.message}`);
      }

      console.log('✅ Mensagem deletada com sucesso:', id);
    } catch (error: any) {
      console.error('❌ Erro no ChatService.delete:', error);
      throw error;
    }
  }

  // Deletar todas as mensagens de um lead
  static async deleteByLeadId(lead_id: string, cliente_id: string): Promise<void> {
    ChatService.checkSupabaseConnection();
    console.log('🔄 Deletando todas as mensagens do lead:', lead_id);

    try {
      const { error } = await supabase!
        .from('chat')
        .delete()
        .eq('lead_id', lead_id)
        .eq('cliente_id', cliente_id);

      if (error) {
        console.error('❌ Erro ao deletar mensagens do lead:', error);
        throw new Error(`Erro ao deletar mensagens: ${error.message}`);
      }

      console.log('✅ Todas as mensagens do lead deletadas com sucesso:', lead_id);
    } catch (error: any) {
      console.error('❌ Erro no ChatService.deleteByLeadId:', error);
      throw error;
    }
  }
}

export default ChatService;