import axios, { AxiosInstance } from 'axios';
import { evolutionConfig } from '../config/evolution.config';
import { supabase } from '../lib/supabase';
import {
  EvolutionInstance,
  EvolutionInstanceDB,
  CreateEvolutionInstanceRequest,
  CreateEvolutionInstanceDBRequest,
  UpdateEvolutionInstanceRequest,
  QRCodeResponse,
  EvolutionApiResponse,
  InstanceConnectionStatus
} from '../models/evolution-instances.model';

export class EvolutionInstancesService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: evolutionConfig.baseUrl,
      timeout: evolutionConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionConfig.apiKey
      }
    });

    // Interceptor para retry automático
    this.api.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        const config = error.config;
        if (!config._retry && config._retryCount < evolutionConfig.retryAttempts) {
          config._retry = true;
          config._retryCount = (config._retryCount || 0) + 1;
          
          console.log(`🔄 Tentativa ${config._retryCount}/${evolutionConfig.retryAttempts} para ${config.url}`);
          
          await new Promise(resolve => setTimeout(resolve, evolutionConfig.retryDelay));
          return this.api(config);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Criar uma nova instância
   */
  async createInstance(data: CreateEvolutionInstanceRequest): Promise<EvolutionApiResponse<EvolutionInstance>> {
    try {
      const response = await this.api.post('/instance/create', data);
      return response.data;
    } catch (error: any) {
      throw new Error(`Erro ao criar instância: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Listar todas as instâncias
   */
  async fetchInstances(): Promise<EvolutionApiResponse<EvolutionInstance[]>> {
    try {
      const response = await this.api.get('/instance/fetchInstances');
      return {
        status: 'SUCCESS',
        error: false,
        response: response.data
      };
    } catch (error: any) {
      throw new Error(`Erro ao buscar instâncias: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Obter detalhes de uma instância específica
   */
  async getInstance(instanceName: string, clienteId?: string): Promise<EvolutionApiResponse<EvolutionInstance>> {
    try {
      // Se clienteId for fornecido, verificar se a instância pertence ao cliente
      if (clienteId) {
        const instanceDB = await this.getInstancesByClienteId(clienteId);
        const hasAccess = instanceDB.some(inst => inst.instance_name === instanceName);
        if (!hasAccess) {
          throw new Error('Instância não encontrada ou acesso negado');
        }
      }
      
      const response = await this.api.get(`/instance/connect/${instanceName}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Erro ao obter instância: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Conectar instância e obter QR Code
   */
  async connectInstance(instanceName: string, number?: string): Promise<EvolutionApiResponse<QRCodeResponse>> {
    try {
      const url = number 
        ? `/instance/connect/${instanceName}?number=${number}`
        : `/instance/connect/${instanceName}`;
      
      const response = await this.api.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(`Erro ao conectar instância: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Obter status de conexão da instância
   */
  async getConnectionStatus(instanceName: string, clienteId?: string): Promise<EvolutionApiResponse<InstanceConnectionStatus>> {
    try {
      // Se clienteId for fornecido, verificar se a instância pertence ao cliente
      if (clienteId) {
        const instanceDB = await this.getInstancesByClienteId(clienteId);
        const hasAccess = instanceDB.some(inst => inst.instance_name === instanceName);
        if (!hasAccess) {
          throw new Error('Instância não encontrada ou acesso negado');
        }
      }
      
      const response = await this.api.get(`/instance/connectionState/${instanceName}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Erro ao obter status da instância: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Desconectar instância
   */
  async disconnectInstance(instanceName: string): Promise<EvolutionApiResponse<any>> {
    try {
      const response = await this.api.delete(`/instance/logout/${instanceName}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Erro ao desconectar instância: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Reiniciar instância
   */
  async restartInstance(instanceName: string): Promise<EvolutionApiResponse<any>> {
    try {
      const response = await this.api.put(`/instance/restart/${instanceName}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Erro ao reiniciar instância: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Deletar instância
   */
  async deleteInstance(instanceName: string): Promise<EvolutionApiResponse<any>> {
    try {
      const response = await this.api.delete(`/instance/delete/${instanceName}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Erro ao deletar instância: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Atualizar configurações da instância
   */
  async updateInstance(instanceName: string, data: UpdateEvolutionInstanceRequest): Promise<EvolutionApiResponse<any>> {
    try {
      const response = await this.api.put(`/instance/update/${instanceName}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(`Erro ao atualizar instância: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Obter informações do perfil da instância
   */
  async getProfileInfo(instanceName: string, clienteId?: string): Promise<EvolutionApiResponse<any>> {
    try {
      // Se clienteId for fornecido, verificar se a instância pertence ao cliente
      if (clienteId) {
        const instanceDB = await this.getInstancesByClienteId(clienteId);
        const hasAccess = instanceDB.some(inst => inst.instance_name === instanceName);
        if (!hasAccess) {
          throw new Error('Instância não encontrada ou acesso negado');
        }
      }
      
      const response = await this.api.get(`/chat/whatsappProfile/${instanceName}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Erro ao obter perfil: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Verificar se a Evolution API está funcionando
   */
  async checkApiHealth(): Promise<any> {
    try {
      const response = await this.api.get('/');
      return response.data;
    } catch (error: any) {
      throw new Error(`Erro ao verificar API: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Obter QR Code de uma instância específica
   */
  async getQRCode(instanceName: string, clienteId?: string): Promise<EvolutionApiResponse<QRCodeResponse>> {
    try {
      console.log(`🔍 [DEBUG] Iniciando getQRCode para instância: ${instanceName}`);
      
      // Se clienteId for fornecido, verificar se a instância pertence ao cliente
      if (clienteId) {
        const instanceDB = await this.getInstancesByClienteId(clienteId);
        const hasAccess = instanceDB.some(inst => inst.instance_name === instanceName);
        if (!hasAccess) {
          throw new Error('Instância não encontrada ou acesso negado');
        }
      }
      
      // Primeiro, verificar se a instância está conectada
      const statusResponse = await this.api.get(`/instance/fetchInstances`);
      const instances = statusResponse.data;
      console.log(`🔍 [DEBUG] Status response:`, JSON.stringify(instances, null, 2));
      
      const instance = instances.find((inst: any) => inst.instance?.instanceName === instanceName);
      console.log(`🔍 [DEBUG] Instance found:`, JSON.stringify(instance, null, 2));
      
      // Se a instância estiver conectada (status 'open'), precisamos desconectar primeiro
      if (instance?.instance?.state === 'open') {
        console.log(`🔍 [DEBUG] Instância ${instanceName} está conectada. Desconectando para gerar novo QR Code...`);
        
        try {
          const logoutResponse = await this.api.delete(`/instance/logout/${instanceName}`);
          console.log(`🔍 [DEBUG] Logout response:`, JSON.stringify(logoutResponse.data, null, 2));
          // Aguardar um pouco para a desconexão ser processada
          console.log(`🔍 [DEBUG] Aguardando 2 segundos...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (disconnectError: any) {
          console.warn(`❌ [DEBUG] Aviso: Erro ao desconectar instância ${instanceName}:`, disconnectError.response?.data || disconnectError.message);
        }
      }
      
      // Agora tentar obter o QR Code
      console.log(`🔍 [DEBUG] Tentando obter QR Code...`);
      const response = await this.api.get(`/instance/connect/${instanceName}`);
      console.log(`🔍 [DEBUG] QR Code response:`, JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error(`❌ [DEBUG] Erro ao obter QR Code:`, error);
      throw new Error(`Erro ao obter QR Code: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Definir webhook para uma instância
   */
  async setWebhook(instanceName: string, webhookUrl: string, events?: string[]): Promise<EvolutionApiResponse<any>> {
    try {
      const data = {
        webhook: {
          url: webhookUrl,
          byEvents: true,
          base64: false,
          events: events || ['APPLICATION_STARTUP', 'QRCODE_UPDATED', 'MESSAGES_UPSERT', 'CONNECTION_UPDATE']
        }
      };
      
      const response = await this.api.put(`/webhook/set/${instanceName}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(`Erro ao definir webhook: ${error.response?.data?.message || error.message}`);
    }
  }

  // ========================================
  // MÉTODOS PARA GERENCIAR INSTÂNCIAS NO BANCO DE DADOS
  // ========================================

  /**
   * Criar instância no banco de dados
   */
  async createInstanceDB(data: CreateEvolutionInstanceDBRequest): Promise<EvolutionInstanceDB> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Extrair configurações específicas do Evolution API do settings
    const settings = data.settings || {};
    
    const instanceData = {
      id: crypto.randomUUID(),
      cliente_id: data.cliente_id,
      instance_name: data.instance_name,
      status: 'disconnected' as const,
      is_connected: false,
      webhook_url: data.webhook_url,
      settings: settings,
      // Evolution API specific settings
      always_online: settings.alwaysOnline || false,
      groups_ignore: settings.groupsIgnore || false,
      msg_call: settings.msgCall || null,
      read_messages: settings.readMessages || false,
      read_status: settings.readStatus || false,
      reject_call: settings.rejectCall || false,
      sync_full_history: settings.syncFullHistory || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: result, error } = await supabase
      .from('evolution_instances')
      .insert(instanceData)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar instância no banco: ${error.message}`);
    }

    return result;
  }

  /**
   * Listar todas as instâncias do banco de dados
   */
  async getAllInstancesDB(clienteId?: string): Promise<EvolutionInstanceDB[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    let query = supabase
      .from('evolution_instances')
      .select('*');

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar instâncias: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Listar instâncias do banco de dados por cliente
   */
  async getInstancesByClienteId(clienteId: string): Promise<EvolutionInstanceDB[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('evolution_instances')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar instâncias: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obter instância específica do banco por cliente
   */
  async getInstanceDBByClienteId(clienteId: string, instanceId: string): Promise<EvolutionInstanceDB | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('evolution_instances')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('id', instanceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      throw new Error(`Erro ao buscar instância: ${error.message}`);
    }

    return data;
  }

  /**
   * Atualizar instância no banco de dados
   */
  async updateInstanceDB(clienteId: string, instanceId: string, updates: Partial<EvolutionInstanceDB>): Promise<EvolutionInstanceDB> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Se há configurações no settings, extrair campos específicos
    if (updates.settings) {
      const settings = updates.settings;
      updateData.always_online = settings.alwaysOnline ?? updateData.always_online;
      updateData.groups_ignore = settings.groupsIgnore ?? updateData.groups_ignore;
      updateData.msg_call = settings.msgCall ?? updateData.msg_call;
      updateData.read_messages = settings.readMessages ?? updateData.read_messages;
      updateData.read_status = settings.readStatus ?? updateData.read_status;
      updateData.reject_call = settings.rejectCall ?? updateData.reject_call;
      updateData.sync_full_history = settings.syncFullHistory ?? updateData.sync_full_history;
    }

    // Remove campos que não devem ser atualizados
    delete updateData.id;
    delete updateData.cliente_id;
    delete updateData.created_at;

    const { data, error } = await supabase
      .from('evolution_instances')
      .update(updateData)
      .eq('cliente_id', clienteId)
      .eq('id', instanceId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar instância: ${error.message}`);
    }

    return data;
  }

  /**
   * Deletar instância do banco de dados
   */
  async deleteInstanceDB(clienteId: string, instanceId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('evolution_instances')
      .delete()
      .eq('cliente_id', clienteId)
      .eq('id', instanceId);

    if (error) {
      throw new Error(`Erro ao deletar instância: ${error.message}`);
    }
  }

  /**
   * Sincronizar status da instância com a Evolution API
   */
  async syncInstanceStatus(clienteId: string, instanceId: string): Promise<EvolutionInstanceDB> {
    const instanceDB = await this.getInstanceDBByClienteId(clienteId, instanceId);
    if (!instanceDB) {
      throw new Error('Instância não encontrada');
    }

    try {
      // Buscar status na Evolution API
      const statusResponse = await this.getConnectionStatus(instanceDB.instance_name);
      
      // Atualizar no banco de dados
      const updates: Partial<EvolutionInstanceDB> = {
        status: statusResponse.response?.state || 'disconnected',
        is_connected: statusResponse.response?.state === 'open',
        last_connection: statusResponse.response?.state === 'open' ? new Date() : instanceDB.last_connection
      };

      return await this.updateInstanceDB(clienteId, instanceId, updates);
    } catch (error: any) {
      // Se não conseguir conectar com a API, marcar como desconectado
      const updates: Partial<EvolutionInstanceDB> = {
        status: 'disconnected',
        is_connected: false
      };

      return await this.updateInstanceDB(clienteId, instanceId, updates);
    }
  }

  /**
   * Criar instância completa (API + Banco)
   */
  async createCompleteInstance(clienteId: string, instanceName: string, apiData: CreateEvolutionInstanceRequest, webhookUrl?: string): Promise<{ db: EvolutionInstanceDB; api: EvolutionApiResponse<EvolutionInstance> }> {
    // 1. Criar na Evolution API
    const apiResponse = await this.createInstance(apiData);
    
    try {
      // 2. Criar no banco de dados
      const dbData: CreateEvolutionInstanceDBRequest = {
        cliente_id: clienteId,
        instance_name: instanceName,
        webhook_url: webhookUrl || undefined,
        settings: apiData
      };
      
      const dbResponse = await this.createInstanceDB(dbData);
      
      // 3. Atualizar com dados da API se disponíveis
      if (apiResponse.response) {
        if (apiResponse.response.instanceId) {
          await this.updateInstanceDB(clienteId, dbResponse.id, {
            instance_id: apiResponse.response.instanceId,
            status: apiResponse.response.status,
            api_key: apiResponse.response.apikey
          });
        }
      }
      
      return {
        db: dbResponse,
        api: apiResponse
      };
    } catch (dbError: any) {
      // Se falhar ao criar no banco, tentar deletar da API
      try {
        await this.deleteInstance(instanceName);
      } catch (cleanupError) {
        console.error('Erro ao limpar instância da API:', cleanupError);
      }
      throw dbError;
    }
  }

  /**
   * Deletar instância completa (API + Banco)
   */
  async deleteCompleteInstance(clienteId: string, instanceId: string): Promise<void> {
    const instanceDB = await this.getInstanceDBByClienteId(clienteId, instanceId);
    if (!instanceDB) {
      throw new Error('Instância não encontrada');
    }

    // 1. Deletar da Evolution API (se tiver instance_name)
    if (instanceDB.instance_name) {
      try {
        await this.deleteInstance(instanceDB.instance_name);
      } catch (apiError) {
        console.warn('Erro ao deletar da API (pode já ter sido deletada):', apiError);
      }
    }

    // 2. Deletar do banco de dados
    await this.deleteInstanceDB(clienteId, instanceId);
  }
}