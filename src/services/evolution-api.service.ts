import { supabase } from '../lib/supabase';
import { EvolutionApi, EvolutionApiInstanceData, CreateEvolutionApiRequest, EvolutionApiFetchInstancesResponse } from '../models/evolution-api.model';
import axios from 'axios';

class EvolutionApiService {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_BASE_URL || '';
    this.apiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || '';
    this.timeout = 30000; // 30 seconds

    // console.log('Evolution API Service initialized:');
    // console.log('Base URL:', this.baseUrl);
    // console.log('API Key:', this.apiKey ? '[CONFIGURED]' : '[NOT CONFIGURED]');
  }

  async getAllInstances(clienteId: string): Promise<EvolutionApiInstanceData[]> {
    try {
      // 1. Buscar IDs das instâncias na tabela local
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data: localInstances, error } = await supabase
        .from('evolution_api')
        .select('id')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching local instances:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!localInstances || localInstances.length === 0) {
        console.log('No instances found for this client');
        return [];
      }

      // 2. Buscar dados completos da Evolution API
      const instanceIds = localInstances.map(instance => instance.id);
      const evolutionApiData = await this.fetchInstancesFromEvolutionApi(instanceIds);

      return evolutionApiData;
    } catch (error: any) {
      console.error('Error in getAllInstances:', error);
      throw new Error(`Failed to get instances: ${error.message}`);
    }
  }

  async getInstanceById(instanceId: string, clienteId: string): Promise<EvolutionApiInstanceData | null> {
    try {
      console.log(`Getting instance by ID: ${instanceId} for client: ${clienteId}`);

      // 1. Verificar se a instância pertence ao cliente
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data: localInstance, error } = await supabase
        .from('evolution_api')
        .select('id, instance_name')
        .eq('id', instanceId)
        .eq('cliente_id', clienteId)
        .single();

      if (error || !localInstance) {
        console.log('Instance not found or does not belong to client');
        return null;
      }

      // 2. Buscar dados da Evolution API
      const evolutionApiData = await this.fetchInstancesFromEvolutionApi([instanceId]);

      return evolutionApiData.length > 0 ? evolutionApiData[0] : null;
    } catch (error: any) {
      console.error('Error in getInstanceById:', error);
      throw new Error(`Failed to get instance: ${error.message}`);
    }
  }

  async getInstanceByName(instanceName: string, clienteId: string): Promise<EvolutionApiInstanceData | null> {
    try {
      console.log(`Getting instance by name: ${instanceName} for client: ${clienteId}`);

      // Buscar todas as instâncias do cliente e filtrar por nome
      const allInstances = await this.getAllInstances(clienteId);
      const instance = allInstances.find(inst => inst.name === instanceName);

      return instance || null;
    } catch (error: any) {
      console.error('Error in getInstanceByName:', error);
      throw new Error(`Failed to get instance by name: ${error.message}`);
    }
  }

  async createInstance(instanceData: CreateEvolutionApiRequest, clienteId: string): Promise<EvolutionApiInstanceData> {
    try {
      console.log(`Creating instance: ${instanceData.instance_name} for client: ${clienteId}`);

      // 1. Criar instância na Evolution API
      const createPayload: any = {
        instanceName: instanceData.instance_name,
        integration: instanceData.integration,
        qrcode: instanceData.qrcode ?? true
      };

      // Adicionar settings se fornecido
      if (instanceData.settings) {
        createPayload.settings = {
          reject_call: instanceData.settings.reject_call ?? false,
          msg_call: instanceData.settings.msg_call ?? '',
          groups_ignore: instanceData.settings.groups_ignore ?? false,
          always_online: instanceData.settings.always_online ?? false,
          read_messages: instanceData.settings.read_messages ?? false,
          read_status: instanceData.settings.read_status ?? false,
          sync_full_history: instanceData.settings.sync_full_history ?? false
        };
      }

      // Nota: webhook_url e webhook_events devem ser configurados separadamente
      // após a criação da instância usando o endpoint /webhook/set/{instance}

      const url = `${this.baseUrl}/instance/create`;

      const response = await axios.post(
        url,
        createPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          },
          timeout: this.timeout
        }
      );

      const createdInstance = response.data;
      console.log('Evolution API create response:', JSON.stringify(createdInstance, null, 2));

      if (!createdInstance || !createdInstance.instance || !createdInstance.instance.instanceName) {
        throw new Error('Invalid response from Evolution API');
      }

      const instanceId = createdInstance.instance.instanceId;
      const instanceName = createdInstance.instance.instanceName;

      // 2. Configurar webhook se fornecido
      if (instanceData.webhook_url && instanceData.webhook_events && instanceData.webhook_events.length > 0) {
        try {
          await this.setWebhook(instanceId, instanceData.webhook_url, instanceData.webhook_events);
          console.log(`Webhook configured for instance: ${instanceId}`);
        } catch (webhookError) {
          console.error('Error configuring webhook:', webhookError);
          // Não falhar a criação da instância se o webhook falhar
        }
      }

      // 3. Salvar referência na tabela local
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      console.log('Inserting instance into database:', {
        id: instanceId,
        cliente_id: clienteId
      });

      const { error } = await supabase
        .from('evolution_api')
        .insert({
          id: instanceId,
          cliente_id: clienteId,
          instance_name: instanceName
        });

      if (error) {
        console.error('Error saving instance to database:', error);
        // Tentar deletar a instância da Evolution API se falhar ao salvar no banco
        try {
          await this.deleteInstance(instanceId, clienteId);
        } catch (deleteError) {
          console.error('Error cleaning up instance after database failure:', deleteError);
        }
        throw new Error(`Failed to save instance: ${error.message}`);
      }

      // 3. Buscar dados completos da instância criada
      const fullInstanceData = await this.getInstanceById(instanceId, clienteId);

      if (!fullInstanceData) {
        throw new Error('Failed to retrieve created instance data');
      }

      return fullInstanceData;
    } catch (error: any) {
      const errorMessage = error.response?.data?.response?.message ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;

      throw new Error(`Failed to create instance: ${errorMessage}`);
    }
  }

  async setWebhook(instanceId: string, webhookUrl: string, events: string[]): Promise<void> {
    try {
      const url = `${this.baseUrl}/webhook/set/${instanceId}`;
      const payload = {
        url: webhookUrl,
        webhook_by_events: false,
        webhook_base64: false,
        events: events
      };

      console.log(`Setting webhook for instance ${instanceId}:`, JSON.stringify(payload, null, 2));

      const response = await axios.post(
        url,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          },
          timeout: this.timeout
        }
      );

      console.log('Webhook set response:', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      console.error('Error setting webhook:', error.response?.data || error.message);
      throw new Error(`Failed to set webhook: ${error.response?.data?.message || error.message}`);
    }
  }

  async deleteInstance(instanceId: string, clienteId: string): Promise<void> {
    try {
      console.log(`Deleting instance: ${instanceId} for client: ${clienteId}`);

      // 1. Verificar se a instância pertence ao cliente e buscar o instance_name
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data: localInstance, error: fetchError } = await supabase
        .from('evolution_api')
        .select('id, instance_name')
        .eq('id', instanceId)
        .eq('cliente_id', clienteId)
        .single();

      if (fetchError || !localInstance) {
        throw new Error('Instance not found or does not belong to client');
      }

      const instanceName = localInstance.instance_name;
      if (!instanceName) {
        throw new Error('Instance name not found');
      }

      // 2. Deletar da Evolution API usando instanceName
      try {
        console.log(`Calling Evolution API to delete instance: ${instanceName}`);
        await axios.delete(
          `${this.baseUrl}/instance/delete/${instanceName}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'apikey': this.apiKey
            },
            timeout: this.timeout
          }
        );
        console.log(`Instance ${instanceName} deleted from Evolution API successfully`);
      } catch (apiError: any) {
        console.warn('Error deleting from Evolution API (continuing with local deletion):', apiError.message);
        // Continua com a exclusão local mesmo se falhar na Evolution API
      }

      // 3. Deletar da tabela local
      const { error: deleteError } = await supabase
        .from('evolution_api')
        .delete()
        .eq('id', instanceId)
        .eq('cliente_id', clienteId);

      if (deleteError) {
        console.error('Error deleting from database:', deleteError);
        throw new Error(`Failed to delete instance: ${deleteError.message}`);
      }

      console.log(`Instance ${instanceId} (${instanceName}) deleted successfully`);
    } catch (error: any) {
      console.error('Error deleting instance:', error);
      throw new Error(`Failed to delete instance: ${error.message}`);
    }
  }

  async getQRCode(clientName: string, clienteId: string): Promise<any> {
    try {
      console.log(`Getting QR Code for instance: ${clientName} for client: ${clienteId}`);

      // 1. Verificar se a instância pertence ao cliente
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data: localInstance, error } = await supabase
        .from('evolution_api')
        .select('id, instance_name')
        .eq('id', clientName)
        .eq('cliente_id', clienteId)
        .single();

      if (error || !localInstance) {
        throw new Error('Instance not found or does not belong to client');
      }

      // 2. Chamar Evolution API para conectar e obter QR Code
      const response = await axios.get(
        `${this.baseUrl}/instance/connect/${localInstance.instance_name}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          },
          timeout: this.timeout
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error getting QR Code:', error);
      throw new Error(`Failed to get QR Code: ${error.response?.data?.message || error.message}`);
    }
  }

  async connectInstance(instanceId: string, clienteId: string): Promise<{ qrCode?: string; status: string }> {
    try {
      console.log(`Connecting instance: ${instanceId} for client: ${clienteId}`);

      // Verificar se a instância pertence ao cliente
      const instance = await this.getInstanceById(instanceId, clienteId);
      if (!instance) {
        throw new Error('Instance not found or does not belong to client');
      }

      // Conectar na Evolution API
      const response = await axios.get(
        `${this.baseUrl}/instance/connect/${instanceId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          },
          timeout: this.timeout
        }
      );

      const connectionData = response.data;
      console.log('Evolution API connect response:', JSON.stringify(connectionData, null, 2));

      return {
        qrCode: connectionData.base64 || connectionData.qrcode,
        status: connectionData.instance?.state || 'connecting'
      };
    } catch (error: any) {
      console.error('Error connecting instance:', error);
      throw new Error(`Failed to connect instance: ${error.response?.data?.message || error.message}`);
    }
  }

  async disconnectInstance(instanceId: string, clienteId: string): Promise<void> {
    try {
      console.log(`Disconnecting instance: ${instanceId} for client: ${clienteId}`);

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Verificar se a instância pertence ao cliente e buscar o instance_name
      const { data: instanceData, error: fetchError } = await supabase
        .from('evolution_api')
        .select('instance_name')
        .eq('id', instanceId)
        .eq('cliente_id', clienteId)
        .single();

      if (fetchError || !instanceData) {
        console.error('Error fetching instance:', fetchError);
        throw new Error('Instance not found or does not belong to client');
      }

      const instanceName = instanceData.instance_name;
      console.log(`Calling Evolution API logout for instance: ${instanceName}`);

      // Chamar o endpoint logout/{instanceName} DELETE da Evolution API
      try {
        await axios.delete(
          `${this.baseUrl}/instance/logout/${instanceName}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'apikey': this.apiKey
            },
            timeout: this.timeout
          }
        );
        console.log(`Instance ${instanceName} disconnected successfully from Evolution API`);
      } catch (apiError: any) {
        console.error('Error calling Evolution API logout:', apiError.response?.data || apiError.message);
        // Continuar mesmo se a API falhar, pois pode ser que a instância já esteja desconectada
      }

      console.log(`Instance ${instanceId} disconnect process completed`);
    } catch (error: any) {
      console.error('Error disconnecting instance:', error);
      throw new Error(`Failed to disconnect instance: ${error.message}`);
    }
  }

  async restartInstance(instanceId: string, clienteId: string): Promise<void> {
    try {
      console.log(`Restarting instance: ${instanceId} for client: ${clienteId}`);

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Verificar se a instância pertence ao cliente e buscar o instance_name
      const { data: instanceData, error: fetchError } = await supabase
        .from('evolution_api')
        .select('instance_name')
        .eq('id', instanceId)
        .eq('cliente_id', clienteId)
        .single();

      if (fetchError || !instanceData) {
        console.error('Error fetching instance:', fetchError);
        throw new Error('Instance not found or does not belong to client');
      }

      const instanceName = instanceData.instance_name;
      console.log(`Calling Evolution API restart for instance: ${instanceName}`);

      // Chamar o endpoint /instance/restart/{instance} PUT da Evolution API
      await axios.put(
        `${this.baseUrl}/instance/restart/${instanceName}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          },
          timeout: this.timeout
        }
      );

      console.log(`Instance ${instanceName} restarted successfully`);
    } catch (error: any) {
      console.error('Error restarting instance:', error);
      throw new Error(`Failed to restart instance: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateInstance(instanceId: string, updateData: any, clienteId: string): Promise<EvolutionApiInstanceData> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Buscar o instance_name no Supabase
      const { data: instanceData, error: fetchError } = await supabase
        .from('evolution_api')
        .select('instance_name')
        .eq('id', instanceId)
        .eq('cliente_id', clienteId)
        .single();

      if (fetchError || !instanceData) {
        console.error('Error fetching instance:', fetchError);
        throw new Error('Instance not found or does not belong to client');
      }

      const instanceName = instanceData.instance_name;
      console.log(`Updating Evolution API instance: ${instanceName}`);

      // Primeiro, chamar o endpoint /settings/set/{instanceName} com as configurações
      const settingsData = {
        always_online: updateData.settings?.always_online || true,
        groups_ignore: updateData.settings?.groups_ignore || true,
        msg_call: updateData.settings?.msg_call || "",
        read_messages: updateData.settings?.read_messages || false,
        read_status: updateData.settings?.read_status || false,
        reject_call: updateData.settings?.reject_call || false,
        sync_full_history: updateData.settings?.sync_full_history || false
      };

      const settingsResponse = await axios.post(
        `${this.baseUrl}/settings/set/${instanceName}`,
        settingsData,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          },
          timeout: this.timeout
        }
      );

      console.log(`Instance ${instanceName} settings updated successfully`);

      // Depois, chamar o endpoint /webhook/set/{instanceName} com as configurações de webhook
      const webhookData = {
        enabled: updateData.enabled,
        events: ["MESSAGES_UPSERT"],
        url: updateData.webhook_url,
        webhook_base64: true
      };

      const webhookResponse = await axios.post(
        `${this.baseUrl}/webhook/set/${instanceName}`,
        webhookData,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          },
          timeout: this.timeout
        }
      );

      console.log(`Instance ${instanceName} webhook updated successfully`);

      // Retornar os dados atualizados
      return {
        id: instanceId,
        name: instanceName,
        connectionStatus: 'updated',
        integration: updateData.integration || 'WHATSAPP-BAILEYS',
        token: this.apiKey,
        clientName: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        serverUrl: this.baseUrl,
        webhookUrl: updateData.webhook_url || ''
      };
    } catch (error: any) {
      console.error('Error updating instance:', error);
      throw new Error(`Failed to update instance: ${error.response?.data?.message || error.message}`);
    }
  }

  private async fetchInstancesFromEvolutionApi(instanceIds: string[]): Promise<EvolutionApiInstanceData[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/instance/fetchInstances`,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          },
          timeout: this.timeout
        }
      );

      const allInstances: EvolutionApiFetchInstancesResponse[] = response.data;

      if (!Array.isArray(allInstances)) {
        throw new Error('Invalid response format from Evolution API');
      }

      // Filtrar apenas as instâncias que pertencem ao cliente e mapear para o formato esperado
      const filteredInstances = allInstances
        .filter(item => instanceIds.includes(item.instance.instanceId))
        .map(item => ({
          instance: {
            instanceId: item.instance.instanceId,
            instanceName: item.instance.instanceName,
            webhook_wa_business: item.instance.integration.webhook_wa_business,
            owner: item.instance.owner,
            profileName: item.instance.profileName,
            status: item.instance.status,
            profilePictureUrl: item.instance.profilePictureUrl,
            profileStatus: item.instance.profileStatus,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any));

      return filteredInstances;
    } catch (error: any) {
      console.error('Error fetching instances from Evolution API:', error);
      throw new Error(`Failed to fetch instances from Evolution API: ${error.response?.data?.message || error.message}`);
    }
  }

  async getClienteIdByInstanceName(instanceName: string): Promise<string | null> {
    try {
      console.log(`Getting cliente_id by instance name: ${instanceName}`);

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data: instance, error } = await supabase
        .from('evolution_api')
        .select('cliente_id')
        .eq('instance_name', instanceName)
        .single();

      if (error || !instance) {
        console.log('Instance not found with name:', instanceName);
        return null;
      }

      return instance.cliente_id;
    } catch (error: any) {
      console.error('Error in getClienteIdByInstanceName:', error);
      throw new Error(`Failed to get cliente_id by instance name: ${error.message}`);
    }
  }
}

export default new EvolutionApiService();