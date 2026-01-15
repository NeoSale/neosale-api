import { supabase } from '../lib/supabase';
import { EvolutionApiInstanceDataV2, CreateEvolutionApiRequestV2, EvolutionApiFetchInstancesResponseV2 } from '../models/evolution-api-v2.model';
import axios from 'axios';

class EvolutionApiV2Service {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_BASE_URL_V2 || '';
    this.apiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY_V2 || '';
    this.timeout = Number(process.env.NEXT_PUBLIC_EVOLUTION_API_TIMEOUT_V2) || 0; // 30 seconds

    // console.log('Evolution API V2 Service initialized:');
    // console.log('Base URL:', this.baseUrl);
    // console.log('API Key:', this.apiKey ? '[CONFIGURED]' : '[NOT CONFIGURED]');
  }

  async getAllInstances(clienteId: string): Promise<EvolutionApiInstanceDataV2[]> {
    try {
      // 1. Buscar IDs das instâncias na tabela local
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data: localInstances, error } = await supabase
        .from('evolution_api_v2')
        .select('id, followup')
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

      // 2. Buscar dados completos da Evolution API V2
      const instanceIds = localInstances.map(instance => instance.id);
      const evolutionApiData = await this.fetchInstancesFromEvolutionApi(instanceIds);

      return evolutionApiData;
    } catch (error: any) {
      console.error('Error in getAllInstances:', error);
      throw new Error(`Failed to get instances: ${error.message}`);
    }
  }

  async getInstanceById(instanceId: string, clienteId: string): Promise<EvolutionApiInstanceDataV2 | null> {
    try {
      console.log(`Getting instance by ID: ${instanceId} for client: ${clienteId}`);

      // 1. Verificar se a instância pertence ao cliente
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data: localInstance, error } = await supabase
        .from('evolution_api_v2')
        .select('id, instance_name, id_agente, followup, qtd_envios_diarios')
        .eq('id', instanceId)
        .eq('cliente_id', clienteId)
        .single();

      if (error || !localInstance) {
        console.log('Instance not found or does not belong to client');
        return null;
      }

      // 2. Buscar dados da Evolution API V2
      const evolutionApiData = await this.fetchInstancesFromEvolutionApi([instanceId]);

      return evolutionApiData.length > 0 ? evolutionApiData[0] : null;
    } catch (error: any) {
      console.error('Error in getInstanceById:', error);
      throw new Error(`Failed to get instance: ${error.message}`);
    }
  }

  async getInstanceByName(instanceName: string, clienteId: string): Promise<EvolutionApiInstanceDataV2 | null> {
    try {
      console.log(`Getting instance by name: ${instanceName} for client: ${clienteId}`);

      // Buscar todas as instâncias do cliente e filtrar por nome
      const allInstances = await this.getAllInstances(clienteId);
      const instance = allInstances.find(inst => inst.instanceName === instanceName);

      return instance || null;
    } catch (error: any) {
      console.error('Error in getInstanceByName:', error);
      throw new Error(`Failed to get instance by name: ${error.message}`);
    }
  }

  async createInstance(instance: CreateEvolutionApiRequestV2, clienteId: string): Promise<EvolutionApiInstanceDataV2> {
    try {
      console.log(`Creating instance: ${instance.instanceName} for client: ${clienteId}`);

      const responseCreate = await axios.post(
        `${this.baseUrl}/instance/create`,
        instance,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          },
          timeout: this.timeout
        }
      );

      const createdInstance = responseCreate.data;
      console.log('Evolution API V2 create response:', JSON.stringify(createdInstance, null, 2));

      if (!createdInstance || !createdInstance.instance || !createdInstance.instance.instanceName) {
        throw new Error('Invalid response from Evolution API V2');
      }

      const instanceId = createdInstance.instance.instanceId;
      const instanceName = createdInstance.instance.instanceName;

      // 2. Configurar webhook se fornecido
      try {
        await this.setWebhook(instanceName, clienteId, instance.id_agente);
        console.log(`Webhook configured for instance: ${instanceId}`);
      } catch (webhookError) {
        console.error('Error configuring webhook:', webhookError);
        // Não falhar a criação da instância se o webhook falhar
      }

      // Configure settings in Evolution API V2
      if (instance.Setting) {
        await this.configureSettings(instance.instanceName, instance.Setting);
      }

      // 3. Salvar referência na tabela local
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      console.log('Inserting instance into database:', {
        id: instanceId,
        cliente_id: clienteId,
        id_agente: instance.id_agente,
        followup: instance.followup ?? false,
        qtd_envios_diarios: instance.qtd_envios_diarios ?? 50
      });

      const { error } = await supabase
        .from('evolution_api_v2')
        .insert({
          id: instanceId,
          cliente_id: clienteId,
          instance_name: instanceName,
          id_agente: instance.id_agente,
          followup: instance.followup ?? false,
          qtd_envios_diarios: instance.qtd_envios_diarios ?? 50
        });

      if (error) {
        console.error('Error saving instance to database:', error);
        // Tentar deletar a instância da Evolution API V2 se falhar ao salvar no banco
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

  async getInstanceSettings(instanceName: string): Promise<any> {
    try {
      const settingsResponse = await axios.get(
        `${this.baseUrl}/settings/find/${instanceName}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          },
          timeout: this.timeout
        }
      );
      return settingsResponse.data;
    } catch (error: any) {
      console.error(`Error fetching settings for instance ${instanceName}:`, error);
      throw error;
    }
  }

  async configureSettings(instanceName: string, settings: any): Promise<void> {

    console.log(`Configuring settings for instance: ${instanceName}`);
    console.log('Settings:', settings);

    try {
      const settingsResponse = await axios.post(
        `${this.baseUrl}/settings/set/${instanceName}`,
        settings,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey
          },
          timeout: this.timeout
        }
      );
      console.log('Settings configured successfully:', settingsResponse.data);
    } catch (settingsError) {
      console.error('Error configuring settings:', settingsError);
      // Continue even if settings configuration fails
      throw settingsError;
    }
  }

  async setWebhook(instanceName: string, clienteId: string, id_agente?: string): Promise<void> {
    try {
      // let agendamento;

      // // Se id_agente foi fornecido, buscar o campo agendamento da tabela agentes
      // if (id_agente) {
      //   const { data: agenteData, error: agenteError } = await supabase!
      //     .from('agentes')
      //     .select('agendamento')
      //     .eq('id', id_agente)
      //     .single();

      //   if (!agenteError && agenteData) {
      //     agendamento = agenteData.agendamento;
      //   }
      // }

      // Get webhook URL from parameters table based on agendamento flag
      // const webhookKey = agendamento ? 'webhook_url_agendamento' : 'webhook_url';
      const webhookKey = 'webhook_url_v2';
      const { data: webhookParam, error: webhookError } = await supabase!
        .from('parametros')
        .select('valor')
        .eq('chave', webhookKey)
        .single();

      if (webhookError || !webhookParam) {
        throw new Error('Webhook URL parameter not found');
      }

      // Get revendedor nickname from database through client
      // const { data: clientData, error: clientError } = await supabase!
      //   .from('clientes')
      //   .select('revendedor_id')
      //   .eq('id', clienteId)
      //   .single();

      // if (clientError || !clientData?.revendedor_id) {
      //   throw new Error('Client revendedor not found');
      // }

      // const { data: revendedorData, error: revendedorError } = await supabase!
      //   .from('revendedores')
      //   .select('nickname')
      //   .eq('id', clientData.revendedor_id)
      //   .single();

      // if (revendedorError || !revendedorData?.nickname) {
      //   throw new Error('Revendedor nickname not found');
      // }

      // const webhookUrl = `${webhookParam.valor}/${revendedorData.nickname}`;
      const webhookUrl = `${webhookParam.valor}`;
      const events = ["MESSAGES_UPSERT"]; // Default events to listen for

      const url = `${this.baseUrl}/webhook/set/${instanceName}`;
      const payload = {
        webhook: {
          base64: true,
          byEvents: false,
          enabled: true,
          events: events,
          url: webhookUrl
        }
      };

      console.log(`Setting webhook for instance ${instanceName}:`, JSON.stringify(payload, null, 2));

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
        .from('evolution_api_v2')
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

      // 2. Deletar da Evolution API V2 usando instanceName
      try {
        console.log(`Calling Evolution API V2 to delete instance: ${instanceName}`);
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
        console.log(`Instance ${instanceName} deleted from Evolution API V2 successfully`);
      } catch (apiError: any) {
        console.warn('Error deleting from Evolution API V2 (continuing with local deletion):', apiError.message);
        // Continua com a exclusão local mesmo se falhar na Evolution API V2
      }

      // 3. Deletar da tabela local
      const { error: deleteError } = await supabase
        .from('evolution_api_v2')
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
        .from('evolution_api_v2')
        .select('id, instance_name')
        .eq('id', clientName)
        .eq('cliente_id', clienteId)
        .single();

      if (error || !localInstance) {
        throw new Error('Instance not found or does not belong to client');
      }

      // 2. Chamar Evolution API V2 para conectar e obter QR Code
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

      // Conectar na Evolution API V2
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
      console.log('Evolution API V2 connect response:', JSON.stringify(connectionData, null, 2));

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
        .from('evolution_api_v2')
        .select('instance_name')
        .eq('id', instanceId)
        .eq('cliente_id', clienteId)
        .single();

      if (fetchError || !instanceData) {
        console.error('Error fetching instance:', fetchError);
        throw new Error('Instance not found or does not belong to client');
      }

      const instanceName = instanceData.instance_name;
      console.log(`Calling Evolution API V2 logout for instance: ${instanceName}`);

      // Chamar o endpoint logout/{instanceName} DELETE da Evolution API V2
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
        console.log(`Instance ${instanceName} disconnected successfully from Evolution API V2`);
      } catch (apiError: any) {
        console.error('Error calling Evolution API V2 logout:', apiError.response?.data || apiError.message);
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
        .from('evolution_api_v2')
        .select('instance_name')
        .eq('id', instanceId)
        .eq('cliente_id', clienteId)
        .single();

      if (fetchError || !instanceData) {
        console.error('Error fetching instance:', fetchError);
        throw new Error('Instance not found or does not belong to client');
      }

      const instanceName = instanceData.instance_name;
      console.log(`Calling Evolution API V2 restart for instance: ${instanceName}`);

      // Chamar o endpoint /instance/restart/{instance} PUT da Evolution API V2
      await axios.post(
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
      throw new Error(`Erro ao reiniciar instância: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateInstance(instanceId: string, updateData: any, clienteId: string): Promise<EvolutionApiInstanceDataV2> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Buscar o instance_name no Supabase
      const { data: instanceData, error: fetchError } = await supabase
        .from('evolution_api_v2')
        .select('instance_name, id_agente, followup, qtd_envios_diarios')
        .eq('id', instanceId)
        .eq('cliente_id', clienteId)
        .single();

      if (fetchError || !instanceData) {
        console.error('Error fetching instance:', fetchError);
        throw new Error('Instance not found or does not belong to client');
      }

      console.log(`Updating Evolution API V2 instance: ${instanceData.instance_name}`);

      if (updateData.Setting) {
        await this.configureSettings(instanceData.instance_name, updateData.Setting);
      }

      // Update fields in database if provided
      const updateFields: any = {};
      if (updateData.id_agente !== undefined) updateFields.id_agente = updateData.id_agente;
      if (updateData.followup !== undefined) updateFields.followup = updateData.followup;
      if (updateData.qtd_envios_diarios !== undefined) updateFields.qtd_envios_diarios = updateData.qtd_envios_diarios;

      if (Object.keys(updateFields).length > 0) {
        const { error: updateError } = await supabase
          .from('evolution_api_v2')
          .update(updateFields)
          .eq('id', instanceId)
          .eq('cliente_id', clienteId);

        if (updateError) {
          console.error('Error updating evolution_api fields:', updateError);
          throw new Error(`Failed to update fields: ${updateError.message}`);
        }

        // Reconfigure webhook with new followup setting if changed
        if (updateData.followup !== undefined) {
          try {
            await this.setWebhook(instanceData.instance_name, clienteId, updateData.id_agente);
            console.log(`Webhook reconfigured for instance: ${instanceId} with followup: ${updateData.followup}`);
          } catch (webhookError) {
            console.error('Error reconfiguring webhook:', webhookError);
            // Don't fail the update if webhook fails
          }
        }
      }

      console.log(`Instance ${instanceData.instance_name} updated successfully`);

      // Retornar os dados atualizados
      return {
        instanceId: instanceId,
        instanceName: instanceData.instance_name,
        status: 'updated',
        integration: updateData.integration || 'WHATSAPP-BAILEYS',
        apiKey: this.apiKey,
        clientName: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        serverUrl: this.baseUrl,
        webhook_wa_business: updateData.webhook_url || ''
      };
    } catch (error: any) {
      console.error('Error updating instance:', error);
      throw new Error(`Failed to update instance: ${error.response?.data?.message || error.message}`);
    }
  }

  async fetchInstancesFromEvolutionApi(instanceIds: string[]): Promise<EvolutionApiInstanceDataV2[]> {
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

      const allInstances: EvolutionApiFetchInstancesResponseV2[] = response.data;

      if (!Array.isArray(allInstances)) {
        throw new Error('Invalid response format from Evolution API V2');
      }

      // Buscar dados locais das instâncias com dados dos agentes (apenas agentes não deletados)
      const { data: localInstances, error } = await supabase!
        .from('evolution_api_v2')
        .select(`
          id, 
          followup, 
          id_agente, 
          qtd_envios_diarios,
          agente:agentes!inner(
            id,
            nome,
            cliente_id,
            tipo_agente_id,
            prompt,
            agendamento,
            prompt_agendamento,
            prompt_seguranca,
            ativo,
            deletado,
            created_at,
            updated_at,
            tipo_agente:tipo_agentes(
              id,
              nome,
              ativo
            )
          )
        `)
        .in('id', instanceIds)
        .eq('agente.deletado', false);

      if (error) {
        console.error('Error fetching local instances:', error);
      }

      // Filtrar apenas as instâncias que pertencem ao cliente e mapear para o formato esperado
      const filteredInstances = await Promise.all(
        allInstances
          .filter(item => instanceIds.includes(item.Setting.instanceId))
          .map(async item => {
            // Buscar settings da instância
            let settings = null;
            try {
              settings = await this.getInstanceSettings(item.name);
            } catch (error) {
              console.error(`Error fetching settings for instance ${item.name}:`, error);
            }

            // Buscar dados locais da instância
            const localInstance = localInstances?.find((local: any) => local.id === item.Setting.instanceId);

            return {
              instanceId: item.Setting.instanceId,
              instanceName: item.name,
              owner: item.ownerJid,
              profileName: item.profileName,
              profilePictureUrl: item.profilePicUrl,
              status: item.connectionStatus,
              integration: item.integration,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              Setting: settings,
              // Campos obrigatórios da Evolution API
              serverUrl: this.baseUrl,
              apiKey: item.token,
              clientName: item.name, // Usando o nome da instância como clientName
              // Campos adicionais específicos do sistema
              followup: localInstance?.followup ?? false,
              id_agente: localInstance?.id_agente ?? null,
              qtd_envios_diarios: localInstance?.qtd_envios_diarios ?? 50,
              // Dados completos do agente
              agente: localInstance?.agente ?? null,
            } as EvolutionApiInstanceDataV2; 
          })
      );

      return filteredInstances;
    } catch (error: any) {
      console.error('Error fetching instances from Evolution API V2:', error);
      throw new Error(`Failed to fetch instances from Evolution API V2: ${error.response?.data?.message || error.message}`);
    }
  }

  async getClienteIdByInstanceName(instanceName: string): Promise<string | null> {
    try {
      console.log(`Getting cliente_id by instance name: ${instanceName}`);

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data: instance, error } = await supabase
        .from('evolution_api_v2')
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

  async getClienteDataByInstanceName(instanceName: string): Promise<{ cliente_id: string; nome: string; nickname: string } | null> {
    try {
      console.log(`Getting cliente data by instance name: ${instanceName}`);

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Primeiro, buscar o cliente_id da instância
      const { data: instance, error: instanceError } = await supabase
        .from('evolution_api_v2')
        .select('cliente_id')
        .eq('instance_name', instanceName)
        .single();

      if (instanceError || !instance) {
        console.log('Instance not found with name:', instanceName);
        return null;
      }

      // Depois, buscar os dados do cliente
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .select('id, nome, nickname')
        .eq('id', instance.cliente_id)
        .single();

      if (clienteError || !cliente) {
        console.log('Cliente not found with id:', instance.cliente_id);
        return null;
      }

      return {
        cliente_id: cliente.id,
        nome: cliente.nome,
        nickname: cliente.nickname
      };
    } catch (error: any) {
      console.error('Error in getClienteDataByInstanceName:', error);
      throw new Error(`Failed to get cliente data by instance name: ${error.message}`);
    }
  }

  async getBase64FromMediaMessage(instanceName: string, keyId: string, apikey: string): Promise<any> {
    try {
      console.log(`Getting base64 from media message for instance: ${instanceName}, keyId: ${keyId}`);

      if (!this.baseUrl) {
        throw new Error('Evolution API V2 base URL not configured');
      }

      const url = `${this.baseUrl}/chat/getBase64FromMediaMessage/${instanceName}`;

      const requestBody = {
        message: {
          key: {
            id: keyId
          }
        },
        convertToMp4: false
      };

      console.log('Request URL:', url);
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      console.log('Request Headers:', { 'apikey': apikey ? '[REDACTED]' : 'NOT_PROVIDED', 'Content-Type': 'application/json' });

      const response = await axios.post(url, requestBody, {
        headers: {
          'apikey': apikey,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      });

      console.log('Evolution API V2 response status:', response.status);

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Evolution API V2 returned status ${response.status}`);
      }

      return response.data;
    } catch (error: any) {
      console.error('Error in getBase64FromMediaMessage:', error.message);

      if (error.response) {
        console.error('Evolution API V2 error details:');
        console.error('Status:', error.response.status);
        console.error('Status Text:', error.response.statusText);
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response Headers:', error.response.headers);

        // Verificar se é um erro específico de mensagem não encontrada
        if (error.response.status === 400 && error.response.data?.response?.message?.includes('Message not found')) {
          throw new Error('Message not found - The message ID may be invalid or the message may have expired');
        }

        throw new Error(`Evolution API V2 error: ${error.response.data?.message || error.response.data?.response?.message || error.response.statusText}`);
      }

      if (error.code === 'ECONNREFUSED') {
        throw new Error('Unable to connect to Evolution API V2 server');
      }

      throw new Error(`Failed to get base64 from media message: ${error.message}`);
    }
  }

  async sendText(instanceName: string, number: string, text: string, apikey: string): Promise<any> {
    try {
      console.log(`🚀 [sendText] Iniciando envio de mensagem`);
      console.log(`📱 Instance: ${instanceName}`);
      console.log(`📞 Number: ${number}`);
      console.log(`📝 Text length: ${text.length}`);
      console.log(`🔑 API Key configured: ${apikey ? 'YES' : 'NO'}`);
      console.log(`🌐 Base URL: ${this.baseUrl}`);

      // Verificar se as configurações básicas estão presentes
      if (!this.baseUrl) {
        throw new Error('NEXT_PUBLIC_EVOLUTION_API_BASE_URL_V2 não está configurada');
      }

      if (!apikey) {
        throw new Error('API Key não foi fornecida');
      }

      const url = `${this.baseUrl}/message/sendText/${instanceName}`;
      console.log(`🎯 Request URL: ${url}`);

      const requestData = {
        number: number,
        text: text
      };
      console.log(`📦 Request data:`, JSON.stringify(requestData, null, 2));

      const requestConfig = {
        headers: {
          'Content-Type': 'application/json',
          'apikey': apikey
        },
        timeout: this.timeout
      };
      console.log(`⚙️ Request config:`, {
        headers: {
          'Content-Type': requestConfig.headers['Content-Type'],
          'apikey': apikey
        },
        timeout: requestConfig.timeout
      });

      const response = await axios.post(url, requestData, requestConfig);

      console.log(`✅ Response status: ${response.status}`);
      console.log(`📄 Response data:`, JSON.stringify(response.data, null, 2));
      console.log('✅ Text message sent successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ [sendText] Error details:');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);

      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response statusText:', error.response.statusText);
        console.error('Response headers:', error.response.headers);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        throw new Error(`Evolution API V2 error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }

      if (error.code) {
        console.error('Error code:', error.code);
      }

      if (error.config) {
        console.error('Request config URL:', error.config.url);
        console.error('Request config method:', error.config.method);
      }

      throw new Error(`Failed to send text message: ${error.message}`);
    }
  }

  async fetchProfilePictureUrl(instanceName: string, number: string, apikey: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/chat/fetchProfilePictureUrl/${instanceName}`;

      const response = await axios.post(url, {
        number: number
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': apikey
        },
        timeout: this.timeout
      });

      return response.data;
    } catch (error: any) {
      console.error('Error fetching profile picture URL:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch profile picture URL');
    }
  }

  async updateLeadInstanceName(instanceName: string, number: string): Promise<void> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      console.log(`Updating instance_name for leads with phone: ${number} to instance: ${instanceName}`);

      // Primeiro, buscar o cliente_id da instância
      const { data: instanceData, error: instanceError } = await supabase
        .from('evolution_api_v2')
        .select('cliente_id')
        .eq('instance_name', instanceName)
        .single();

      if (instanceError || !instanceData) {
        console.log(`Instance ${instanceName} not found in database, skipping lead update`);
        return;
      }

      const clienteId = instanceData.cliente_id;
      console.log(`Found cliente_id: ${clienteId} for instance: ${instanceName}`);

      // Limpar o número de telefone para comparação (remover caracteres especiais)
      const cleanNumber = number.replace(/[^0-9]/g, '');

      // Atualizar apenas leads do mesmo cliente que tenham o telefone correspondente
      const { data, error } = await supabase
        .from('leads')
        .update({ instance_name: instanceName })
        .or(`telefone.eq.${number},telefone.eq.${cleanNumber},telefone.like.%${cleanNumber}%`)
        .eq('cliente_id', clienteId)
        .eq('deletado', false)
        .select('id, nome, telefone, cliente_id');

      if (error) {
        console.error('Error updating lead instance_name:', error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log(`Updated instance_name for ${data.length} leads of cliente ${clienteId}:`, data.map(lead => ({ id: lead.id, nome: lead.nome, telefone: lead.telefone })));
      } else {
        console.log(`No leads found with phone number: ${number} for cliente: ${clienteId}`);
      }
    } catch (error: any) {
      console.error('Error in updateLeadInstanceName:', error);
      // Não falhar o envio da mensagem se a atualização do lead falhar
    }
  }

  async findContacts(instanceName: string, where: { id?: string }, apiKey: string): Promise<any[]> {
    try {
      console.log(`Finding contacts for instance: ${instanceName} with filter:`, where);

      const url = `${this.baseUrl}/chat/findContacts/${instanceName}`;

      const requestConfig = {
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey || this.apiKey
        },
        timeout: this.timeout
      };

      const response = await axios.post(url, { where }, requestConfig);

      console.log(`✅ Response status: ${response.status}`);
      console.log(`📄 Found ${response.data.length || 0} contacts`);
      
      // Retornar todos os dados brutos da Evolution API sem processar
      return response.data;
    } catch (error: any) {
      console.error('❌ [findContacts] Error details:');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);

      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response statusText:', error.response.statusText);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        throw new Error(`Evolution API V2 error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }

      throw new Error(`Failed to find contacts: ${error.message}`);
    }
  }

  async sendPresence(instanceName: string, number: string, presence: string, delay: number, apikey: string): Promise<any> {
    try {
      console.log(`🚀 [sendPresence] Iniciando envio de presença`);
      console.log(`📱 Instance: ${instanceName}`);
      console.log(`📞 Number: ${number}`);
      console.log(`👁️ Presence: ${presence}`);
      console.log(`⏱️ Delay: ${delay}ms`);
      console.log(`🔑 API Key configured: ${apikey ? 'YES' : 'NO'}`);
      console.log(`🌐 Base URL: ${this.baseUrl}`);

      // Verificar se as configurações básicas estão presentes
      if (!this.baseUrl) {
        throw new Error('NEXT_PUBLIC_EVOLUTION_API_BASE_URL_V2 não está configurada');
      }

      if (!apikey) {
        throw new Error('API Key não foi fornecida');
      }

      const url = `${this.baseUrl}/chat/sendPresence/${instanceName}`;
      console.log(`🎯 Request URL: ${url}`);

      const requestData = {
        number: number,
        delay: delay,
        presence: presence
      };
      console.log(`📦 Request data:`, JSON.stringify(requestData, null, 2));

      const requestConfig = {
        headers: {
          'Content-Type': 'application/json',
          'apikey': apikey
        },
        timeout: this.timeout
      };
      console.log(`⚙️ Request config:`, {
        headers: {
          'Content-Type': requestConfig.headers['Content-Type'],
          'apikey': '[HIDDEN]'
        },
        timeout: requestConfig.timeout
      });

      const response = await axios.post(url, requestData, requestConfig);

      console.log(`✅ Response status: ${response.status}`);
      console.log(`📄 Response data:`, JSON.stringify(response.data, null, 2));
      console.log('✅ Presence sent successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ [sendPresence] Error details:');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);

      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response statusText:', error.response.statusText);
        console.error('Response headers:', error.response.headers);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        throw new Error(`Evolution API V2 error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }

      if (error.code) {
        console.error('Error code:', error.code);
      }

      if (error.config) {
        console.error('Request config URL:', error.config.url);
        console.error('Request config method:', error.config.method);
      }

      throw new Error(`Failed to send presence: ${error.message}`);
    }
  }
}

export default new EvolutionApiV2Service();