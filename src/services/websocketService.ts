import WebSocket from 'ws';
import { supabase } from '../lib/supabase';
import http from 'http';

interface WebSocketClient {
  ws: WebSocket;
  clientId: string;
  leadId?: string;
}

class WebSocketService {
  private wss: WebSocket.Server | null = null;
  private clients: Map<string, WebSocketClient> = new Map();
  private supabaseSubscription: any = null;

  /**
   * Inicializa o servidor WebSocket
   * @param server Servidor HTTP para anexar o WebSocket
   */
  initialize(server: http.Server) {
    if (this.wss) {
      console.log('⚠️ WebSocket já está inicializado');
      return;
    }

    // Criar servidor WebSocket
    this.wss = new WebSocket.Server({ server });
    console.log('🔌 Servidor WebSocket inicializado');

    // Configurar eventos do WebSocket
    this.wss.on('connection', (ws: WebSocket) => {
      this.handleConnection(ws);
    });

    // Iniciar assinatura do Supabase
    this.setupSupabaseSubscription();
  }

  /**
   * Manipula nova conexão WebSocket
   */
  private handleConnection(ws: WebSocket) {
    // Gerar ID único para o cliente
    const clientId = Math.random().toString(36).substring(2, 15);
    
    console.log(`🔌 Nova conexão WebSocket: ${clientId}`);
    
    // Armazenar cliente
    this.clients.set(clientId, { ws, clientId });

    // Enviar mensagem de boas-vindas
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Conectado ao servidor WebSocket',
      clientId
    }));

    // Configurar evento de mensagem
    ws.on('message', (message: string) => {
      this.handleMessage(clientId, message);
    });

    // Configurar evento de fechamento
    ws.on('close', () => {
      console.log(`🔌 Conexão WebSocket fechada: ${clientId}`);
      this.clients.delete(clientId);
    });

    // Configurar evento de erro
    ws.on('error', (error) => {
      console.error(`❌ Erro na conexão WebSocket ${clientId}:`, error);
      this.clients.delete(clientId);
    });
  }

  /**
   * Manipula mensagens recebidas dos clientes
   */
  private handleMessage(clientId: string, message: string) {
    try {
      const data = JSON.parse(message.toString());
      console.log(`📩 Mensagem recebida de ${clientId}:`, data);

      // Processar comandos
      switch (data.type) {
        case 'subscribe':
          // Inscrever cliente para receber atualizações de um lead específico
          if (data.leadId) {
            const client = this.clients.get(clientId);
            if (client) {
              client.leadId = data.leadId;
              console.log(`🔔 Cliente ${clientId} inscrito para atualizações do lead ${data.leadId}`);
              
              // Confirmar inscrição
              client.ws.send(JSON.stringify({
                type: 'subscribed',
                leadId: data.leadId
              }));
            }
          }
          break;

        case 'unsubscribe':
          // Cancelar inscrição do cliente
          const client = this.clients.get(clientId);
          if (client) {
            delete client.leadId;
            console.log(`🔕 Cliente ${clientId} cancelou inscrição`);
            
            // Confirmar cancelamento
            client.ws.send(JSON.stringify({
              type: 'unsubscribed'
            }));
          }
          break;

        case 'ping':
          // Responder ping para manter conexão ativa
          const pingClient = this.clients.get(clientId);
          if (pingClient) {
            pingClient.ws.send(JSON.stringify({
              type: 'pong',
              timestamp: Date.now()
            }));
          }
          break;

        default:
          console.log(`⚠️ Tipo de mensagem desconhecido: ${data.type}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao processar mensagem de ${clientId}:`, error);
    }
  }

  /**
   * Configura assinatura para mudanças na tabela chat do Supabase
   */
  private setupSupabaseSubscription() {
    if (!supabase) {
      console.error('❌ Supabase não está configurado. Não é possível configurar assinatura em tempo real.');
      return;
    }

    try {
      // Cancelar assinatura existente, se houver
      if (this.supabaseSubscription) {
        this.supabaseSubscription.unsubscribe();
      }

      // Criar canal para escutar mudanças na tabela chat
      this.supabaseSubscription = supabase
        .channel('chat-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'chat' }, 
          (payload) => this.handleChatChange(payload)
        )
        .subscribe((status) => {
          console.log(`🔄 Status da assinatura Supabase: ${status}`);
        });

      console.log('🔄 Assinatura Supabase configurada para tabela chat');
    } catch (error) {
      console.error('❌ Erro ao configurar assinatura Supabase:', error);
    }
  }

  /**
   * Manipula mudanças na tabela chat
   */
  private handleChatChange(payload: any) {
    console.log('🔄 Mudança detectada na tabela chat:', payload);

    // Extrair dados da mensagem
    const chatMessage = payload.new;
    const leadId = chatMessage.lead_id;

    // Enviar atualização para clientes inscritos no leadId específico
    this.clients.forEach((client) => {
      // Verificar se o cliente está inscrito para este lead
      if (client.leadId === leadId) {
        try {
          client.ws.send(JSON.stringify({
            type: 'chat_update',
            event: payload.eventType, // INSERT, UPDATE, DELETE
            data: chatMessage
          }));
          console.log(`📤 Atualização enviada para cliente ${client.clientId}`);
        } catch (error) {
          console.error(`❌ Erro ao enviar atualização para cliente ${client.clientId}:`, error);
        }
      }
    });
  }

  /**
   * Encerra o servidor WebSocket
   */
  shutdown() {
    // Cancelar assinatura do Supabase
    if (this.supabaseSubscription) {
      this.supabaseSubscription.unsubscribe();
      this.supabaseSubscription = null;
    }

    // Fechar todas as conexões
    if (this.wss) {
      this.clients.forEach((client) => {
        try {
          client.ws.close();
        } catch (error) {
          console.error(`❌ Erro ao fechar conexão WebSocket ${client.clientId}:`, error);
        }
      });

      this.clients.clear();

      // Fechar servidor WebSocket
      this.wss.close(() => {
        console.log('🔌 Servidor WebSocket encerrado');
      });

      this.wss = null;
    }
  }
}

// Exportar instância única do serviço
export default new WebSocketService();