import { supabase } from '../lib/supabase';
import axios, { AxiosInstance } from 'axios';
import { 
  EvolutionApi, 
  CreateEvolutionApiRequest, 
  UpdateEvolutionApiRequest,
  QRCodeResponse,
  ConnectionStatus
} from '../models/evolution-api.model';

class EvolutionApiService {
  private axiosInstances: Map<string, AxiosInstance> = new Map();
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_BASE_URL || '';
    this.apiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || '';
    this.timeout = parseInt(process.env.NEXT_PUBLIC_EVOLUTION_API_TIMEOUT || '');
    this.retryAttempts = parseInt(process.env.NEXT_PUBLIC_EVOLUTION_API_RETRY_ATTEMPTS || '');
    this.retryDelay = parseInt(process.env.NEXT_PUBLIC_EVOLUTION_API_RETRY_DELAY || '');
  }

  private createAxiosInstance(baseUrl?: string, apiKey?: string): AxiosInstance {
    return axios.create({
      baseURL: baseUrl || this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey || this.apiKey
      },
      timeout: this.timeout
    });
  }

  private getAxiosInstance(baseUrl?: string, apiKey?: string): AxiosInstance {
    const effectiveBaseUrl = baseUrl || this.baseUrl;
    const effectiveApiKey = apiKey || this.apiKey;
    const key = `${effectiveBaseUrl}_${effectiveApiKey}`;
    if (!this.axiosInstances.has(key)) {
      this.axiosInstances.set(key, this.createAxiosInstance(effectiveBaseUrl, effectiveApiKey));
    }
    return this.axiosInstances.get(key)!;
  }

  private filterSensitiveFields(instance: EvolutionApi): Omit<EvolutionApi, 'api_key' | 'base_url'> {
    const { api_key, base_url, ...filteredInstance } = instance;
    return filteredInstance;
  }

  private filterSensitiveFieldsArray(instances: EvolutionApi[]): Omit<EvolutionApi, 'api_key' | 'base_url'>[] {
    return instances.map(instance => this.filterSensitiveFields(instance));
  }

  // Internal methods that return complete data (including sensitive fields)
  private async getInstanceByIdInternal(id: string, clienteId: string): Promise<EvolutionApi | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('evolution_api')
      .select('*')
      .eq('id', id)
      .eq('cliente_id', clienteId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching Evolution API instance: ${error.message}`);
    }

    return data;
  }

  private async getInstanceByNameInternal(instanceName: string, clienteId: string): Promise<EvolutionApi | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('evolution_api')
      .select('*')
      .eq('instance_name', instanceName)
      .eq('cliente_id', clienteId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching Evolution API instance: ${error.message}`);
    }

    return data;
  }

  async getAllInstances(clienteId: string): Promise<Omit<EvolutionApi, 'api_key' | 'base_url'>[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Passo 1: Buscar dados na tabela local
    const { data: localInstances, error } = await supabase
      .from('evolution_api')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching Evolution API instances: ${error.message}`);
    }

    if (!localInstances || localInstances.length === 0) {
      return [];
    }

    // Passo 2 e 3: Para cada instância com instance_id, buscar dados na Evolution API e atualizar
    const updatedInstances: EvolutionApi[] = [];
    
    for (const instance of localInstances) {
      if (instance.instance_id) {
        try {
          // Buscar dados atualizados da Evolution API
          const updatedInstance = await this.fetchInstanceData(instance.instance_id, clienteId);
          if (updatedInstance) {
            // Buscar dados completos atualizados do banco após update
            const fullUpdatedInstance = await this.getInstanceByIdInternal(instance.id, clienteId);
            if (fullUpdatedInstance) {
              updatedInstances.push(fullUpdatedInstance);
            } else {
              updatedInstances.push(instance);
            }
          } else {
            updatedInstances.push(instance);
          }
        } catch (error) {
          // Se falhar na API externa, usar dados locais
          console.warn(`Failed to fetch data for instance ${instance.instance_id}:`, error);
          updatedInstances.push(instance);
        }
      } else {
        // Se não tem instance_id, usar dados locais
        updatedInstances.push(instance);
      }
    }

    // Passo 4: Retornar dados atualizados
    return this.filterSensitiveFieldsArray(updatedInstances);
  }

  async getInstanceById(id: string, clienteId: string): Promise<Omit<EvolutionApi, 'api_key' | 'base_url'> | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('evolution_api')
      .select('*')
      .eq('id', id)
      .eq('cliente_id', clienteId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching Evolution API instance: ${error.message}`);
    }

    if (data && data.instance_id) {
      // Use fetchInstanceData to get updated data from Evolution API
      try {
        return await this.fetchInstanceData(data.instance_id, clienteId);
      } catch (error) {
        // If Evolution API is not available, return cached data
        return this.filterSensitiveFields(data);
      }
    }

    // If no instance_id, return cached data
    return data ? this.filterSensitiveFields(data) : null;
  }

  async getInstanceByName(instanceName: string, clienteId: string): Promise<Omit<EvolutionApi, 'api_key' | 'base_url'> | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('evolution_api')
      .select('*')
      .eq('instance_name', instanceName)
      .eq('cliente_id', clienteId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching Evolution API instance: ${error.message}`);
    }

    if (data && data.instance_id) {
      // Use fetchInstanceData to get updated data from Evolution API
      try {
        return await this.fetchInstanceData(data.instance_id, clienteId);
      } catch (error) {
        // If Evolution API is not available, return cached data
        return this.filterSensitiveFields(data);
      }
    }

    // If no instance_id, return cached data
    return data ? this.filterSensitiveFields(data) : null;
  }

  async createInstance(instanceData: CreateEvolutionApiRequest, clienteId: string): Promise<EvolutionApi> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Check if instance name already exists for this client
    const existingInstance = await this.getInstanceByNameInternal(instanceData.instance_name, clienteId);
    if (existingInstance) {
      throw new Error(`Instance with name '${instanceData.instance_name}' already exists`);
    }

    // Create instance in Evolution API
    const axiosInstance = this.getAxiosInstance();
    const evolutionApiPayload: any = {
      instanceName: instanceData.instance_name,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
      webhook: instanceData.webhook_url ? {
        url: instanceData.webhook_url,
        byEvents: true,
        events: instanceData.webhook_events || ['APPLICATION_STARTUP']
      } : undefined,
      rejectCall: instanceData.settings?.reject_call || false,
      msgCall: instanceData.settings?.msg_call || '',
      groupsIgnore: instanceData.settings?.groups_ignore || true,
      alwaysOnline: instanceData.settings?.always_online || false,
      readMessages: instanceData.settings?.read_messages || false,
      readStatus: instanceData.settings?.read_status || false,
      syncFullHistory: instanceData.settings?.sync_full_history || false
    };

    // Remove undefined fields
    Object.keys(evolutionApiPayload).forEach(key => {
      if (evolutionApiPayload[key] === undefined) {
        delete evolutionApiPayload[key];
      }
    });

    let evolutionApiResponse;
    try {
      evolutionApiResponse = await axiosInstance.post('/instance/create', evolutionApiPayload);
    } catch (error: any) {
      throw new Error(`Error creating instance in Evolution API: ${error.response?.data?.message || error.message}`);
    }

    // Extrair o instanceId da resposta da Evolution API
    const instanceId = evolutionApiResponse.data?.instance?.instanceId || evolutionApiResponse.data?.instanceId;

    const newInstance = {
      cliente_id: clienteId,
      instance_name: instanceData.instance_name,
      instance_id: instanceId,
      base_url: this.baseUrl,
      api_key: this.apiKey,
      webhook_url: instanceData.webhook_url,
      webhook_events: instanceData.webhook_events,
      settings: instanceData.settings,
      status: 'disconnected' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('evolution_api')
      .insert([newInstance])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating Evolution API instance: ${error.message}`);
    }

    return data;
  }

  async updateInstance(id: string, updateData: UpdateEvolutionApiRequest, clienteId: string): Promise<EvolutionApi> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Remove base_url and api_key from updateData if they exist (they come from .env)
    const { base_url, api_key, ...filteredUpdateData } = updateData as any;
    
    const updatePayload = {
      ...filteredUpdateData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('evolution_api')
      .update(updatePayload)
      .eq('id', id)
      .eq('cliente_id', clienteId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating Evolution API instance: ${error.message}`);
    }

    return data;
  }

  async deleteInstance(id: string, clienteId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Get instance data before deletion
    const instance = await this.getInstanceByIdInternal(id, clienteId);
    if (!instance) {
      throw new Error('Instance not found');
    }

    // First try to disconnect the instance
    try {
      if (instance.status === 'connected') {
        await this.disconnectInstance(instance.instance_name, clienteId);
      }
    } catch (error) {
      console.warn('Failed to disconnect instance before deletion:', error);
    }

    // Delete instance from Evolution API
    try {
      const axiosInstance = this.getAxiosInstance();
      await axiosInstance.delete(`/instance/delete/${instance.instance_name}`);
    } catch (error: any) {
      console.warn('Failed to delete instance from Evolution API:', error.response?.data?.message || error.message);
      // Continue with local deletion even if Evolution API deletion fails
    }

    const { error } = await supabase
      .from('evolution_api')
      .delete()
      .eq('id', id)
      .eq('cliente_id', clienteId);

    if (error) {
      throw new Error(`Error deleting Evolution API instance: ${error.message}`);
    }
  }

  async connectInstance(instanceName: string, clienteId: string): Promise<QRCodeResponse> {
    const instance = await this.getInstanceByNameInternal(instanceName, clienteId);
    if (!instance) {
      throw new Error(`Instance '${instanceName}' not found`);
    }

    const axiosInstance = this.getAxiosInstance();

    try {
      // Update status to connecting
      await this.updateInstanceStatus(instance.id, 'connecting');

      // Get QR Code (instance already exists from createInstance)
      const qrResponse = await axiosInstance.get(`/instance/connect/${instanceName}`);
      
      const qrCode = qrResponse.data.base64 || qrResponse.data.qrcode;
      
      // Update instance with QR code
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      await supabase
        .from('evolution_api')
        .update({ 
          qr_code: qrCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', instance.id);

      return {
        qr_code: qrCode,
        instance_name: instanceName,
        status: 'connecting'
      };
    } catch (error: any) {
      await this.updateInstanceStatus(instance.id, 'error', error.message);
      throw new Error(`Failed to connect instance: ${error.response?.data?.message || error.message}`);
    }
  }

  async disconnectInstance(instanceName: string, clienteId: string): Promise<void> {
    const instance = await this.getInstanceByNameInternal(instanceName, clienteId);
    if (!instance) {
      throw new Error(`Instance '${instanceName}' not found`);
    }

    const axiosInstance = this.getAxiosInstance();

    try {
      await axiosInstance.delete(`/instance/logout/${instanceName}`);
      await this.updateInstanceStatus(instance.id, 'disconnected');
    } catch (error: any) {
      throw new Error(`Failed to disconnect instance: ${error.response?.data?.message || error.message}`);
    }
  }

  async getQRCode(instanceName: string, clienteId: string): Promise<QRCodeResponse> {
    const instance = await this.getInstanceByNameInternal(instanceName, clienteId);
    if (!instance) {
      throw new Error(`Instance '${instanceName}' not found`);
    }

    const axiosInstance = this.getAxiosInstance();

    try {
      const response = await axiosInstance.get(`/instance/connect/${instanceName}`);
      const qrCode = response.data.base64 || response.data.qrcode;
      
      // Update QR code in database
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      await supabase
        .from('evolution_api')
        .update({ 
          qr_code: qrCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', instance.id);

      // Get updated instance data from database
      const updatedInstance = await this.getInstanceByNameInternal(instanceName, clienteId);
      
      return {
        qr_code: qrCode,
        instance_name: instanceName,
        status: updatedInstance?.status || instance.status
      };
    } catch (error: any) {
      throw new Error(`Failed to get QR code: ${error.response?.data?.message || error.message}`);
    }
  }

  async getConnectionStatus(instanceName: string, clienteId: string): Promise<ConnectionStatus> {
    const instance = await this.getInstanceByNameInternal(instanceName, clienteId);
    if (!instance) {
      throw new Error(`Instance '${instanceName}' not found`);
    }

    const axiosInstance = this.getAxiosInstance();

    try {
      const response = await axiosInstance.get(`/instance/connectionState/${instanceName}`);
      const connectionData = response.data;

      console.log('connectionData', connectionData);

      const status = connectionData.state === 'open' ? 'connected' : 'disconnected';
      
      // Update instance status in database
      await this.updateInstanceStatus(
        instance.id, 
        status,
        undefined,
        connectionData.instance?.profilePictureUrl,
        connectionData.instance?.profileName,
        connectionData.instance?.owner
      );

      // Get updated instance data from database
      const updatedInstance = await this.getInstanceByNameInternal(instanceName, clienteId);

      return {
        instance_name: instanceName,
        status: updatedInstance?.status || status,
        phone_number: updatedInstance?.phone_number || connectionData.instance?.owner,
        profile_name: updatedInstance?.profile_name || connectionData.instance?.profileName,
        profile_picture: updatedInstance?.profile_picture || connectionData.instance?.profilePictureUrl,
        last_connection: updatedInstance?.last_connection || new Date().toISOString()
      };
    } catch (error: any) {
      await this.updateInstanceStatus(instance.id, 'error', error.message);
      throw new Error(`Failed to get connection status: ${error.response?.data?.message || error.message}`);
    }
  }

  async fetchInstanceData(instanceId: string, clienteId: string): Promise<Omit<EvolutionApi, 'api_key' | 'base_url'> | null> {
    try {
      // Primeiro, tentar obter as credenciais da instância do banco de dados
      const existingInstance = await this.getInstanceByIdInternal(instanceId, clienteId);
      let apiKey = this.apiKey;
      
      if (existingInstance && existingInstance.api_key) {
        apiKey = existingInstance.api_key;
      }

      // 1. Buscar dados da Evolution API usando a URL específica
      const baseUrl = existingInstance?.base_url || this.baseUrl;
      const response = await axios.get(
        `${baseUrl}/instance/fetchInstances?instanceId=${instanceId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey
          },
          timeout: this.timeout
        }
      );

      const instanceData = response.data;
      console.log('Evolution API Response:', JSON.stringify(instanceData, null, 2));

      // Verificar diferentes estruturas de resposta possíveis
      let instance = null;
      if (instanceData && instanceData.instance) {
        instance = instanceData.instance;
      } else if (instanceData && Array.isArray(instanceData) && instanceData.length > 0) {
        instance = instanceData[0];
      } else if (instanceData && typeof instanceData === 'object' && instanceData.instanceName) {
        instance = instanceData;
      }

      if (!instance) {
        console.error('Invalid response structure from Evolution API:', instanceData);
        throw new Error('Invalid response from Evolution API');
      }

      console.log('Extracted instance data:', JSON.stringify(instance, null, 2));

      // 2. Atualizar a tabela evolution-api com os dados retornados
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const updateData: any = {
        instance_name: instance.instanceName || instance.name,
        status: instance.state || 'disconnected',
        updated_at: new Date().toISOString()
      };

      // Adicionar campos opcionais se existirem
      if (instance.profilePictureUrl) {
        updateData.profile_picture = instance.profilePictureUrl;
      }
      if (instance.profileName) {
        updateData.profile_name = instance.profileName;
      }
      if (instance.phoneNumber) {
        updateData.phone_number = instance.phoneNumber;
      }
      if (instance.qrcode) {
        updateData.qr_code = instance.qrcode;
      }
      if (instance.state === 'open') {
        updateData.last_connection = new Date().toISOString();
      }

      const { error } = await supabase
        .from('evolution_api')
        .update(updateData)
        .eq('id', instanceId)
        .eq('cliente_id', clienteId);

      if (error) {
        console.error('Error updating instance in database:', error);
        throw new Error(`Failed to update instance: ${error.message}`);
      }

      // 3. Retornar os dados atualizados do banco de dados local
      const updatedInstance = await this.getInstanceByIdInternal(instanceId, clienteId);
      if (!updatedInstance) {
        throw new Error('Failed to retrieve updated instance data');
      }

      return this.filterSensitiveFields(updatedInstance);

    } catch (error: any) {
      console.error('Error fetching instance data from Evolution API:', error);
      
      // Se a API externa falhar, tentar retornar dados em cache
      const cachedInstance = await this.getInstanceByIdInternal(instanceId, clienteId);
      if (cachedInstance) {
        console.log('Returning cached data due to API error');
        return this.filterSensitiveFields(cachedInstance);
      }
      
      throw new Error(`Failed to fetch instance data: ${error.response?.data?.message || error.message}`);
    }
  }

  private async updateInstanceStatus(
    id: string, 
    status: 'connected' | 'disconnected' | 'connecting' | 'error',
    errorMessage?: string,
    profilePicture?: string,
    profileName?: string,
    phoneNumber?: string
  ): Promise<void> {
    if (!supabase) return;

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (errorMessage) updateData.error_message = errorMessage;
    if (profilePicture) updateData.profile_picture = profilePicture;
    if (profileName) updateData.profile_name = profileName;
    if (phoneNumber) updateData.phone_number = phoneNumber;
    if (status === 'connected') updateData.last_connection = new Date().toISOString();

    await supabase
      .from('evolution_api')
      .update(updateData)
      .eq('id', id);
  }
}

export const evolutionApiService = new EvolutionApiService();