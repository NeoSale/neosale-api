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
  async getInstance(instanceName: string): Promise<EvolutionApiResponse<EvolutionInstance>> {
    try {
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
  async getConnectionStatus(instanceName: string): Promise<EvolutionApiResponse<InstanceConnectionStatus>> {
    try {
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
  async getProfileInfo(instanceName: string): Promise<EvolutionApiResponse<any>> {
    try {
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
  async getQRCode(instanceName: string): Promise<EvolutionApiResponse<QRCodeResponse>> {
    try {
      const response = await this.api.get(`/instance/connect/${instanceName}`);
      return response.data;
    } catch (error: any) {
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

    const instanceData = {
      id: crypto.randomUUID(),
      cliente_id: data.cliente_id,
      instance_name: data.instance_name,
      status: 'disconnected' as const,
      is_connected: false,
      webhook_url: data.webhook_url,
      settings: data.settings || {},
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