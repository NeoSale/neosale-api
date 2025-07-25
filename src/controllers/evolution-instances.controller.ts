import { Request, Response } from 'express';
import { EvolutionInstancesService } from '../services/evolution-instances.service';
import { CreateEvolutionInstanceRequest, UpdateEvolutionInstanceRequest } from '../models/evolution-instances.model';

export class EvolutionInstancesController {
  private evolutionService: EvolutionInstancesService;

  constructor() {
    this.evolutionService = new EvolutionInstancesService();
  }

  /**
   * Criar uma nova instância
   */
  async createInstance(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateEvolutionInstanceRequest = req.body;
      
      // Validações básicas
      if (!data.instanceName) {
        res.status(400).json({
          success: false,
          message: 'Nome da instância é obrigatório'
        });
        return;
      }

      const result = await this.evolutionService.createInstance(data);
      
      res.status(201).json({
        success: true,
        message: 'Instância criada com sucesso',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Listar todas as instâncias
   */
  async fetchInstances(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.evolutionService.fetchInstances();
      
      res.status(200).json({
        success: true,
        message: 'Instâncias obtidas com sucesso',
        data: result.response
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obter detalhes de uma instância específica
   */
  async getInstance(req: Request, res: Response): Promise<void> {
    try {
      const { instanceName } = req.params;
      
      if (!instanceName) {
        res.status(400).json({
          success: false,
          message: 'Nome da instância é obrigatório'
        });
        return;
      }

      const result = await this.evolutionService.getInstance(instanceName);
      
      res.status(200).json({
        success: true,
        message: 'Instância obtida com sucesso',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Conectar instância e obter QR Code
   */
  async connectInstance(req: Request, res: Response): Promise<void> {
    try {
      const { instanceName } = req.params;
      const { number } = req.query;
      
      if (!instanceName) {
        res.status(400).json({
          success: false,
          message: 'Nome da instância é obrigatório'
        });
        return;
      }

      const result = await this.evolutionService.connectInstance(
        instanceName, 
        number as string
      );
      
      res.status(200).json({
        success: true,
        message: 'Instância conectada com sucesso',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obter QR Code de uma instância
   */
  async getQRCode(req: Request, res: Response): Promise<void> {
    try {
      const { instanceName } = req.params;
      
      if (!instanceName) {
        res.status(400).json({
          success: false,
          message: 'Nome da instância é obrigatório'
        });
        return;
      }

      const result = await this.evolutionService.getQRCode(instanceName);
      
      res.status(200).json({
        success: true,
        message: 'QR Code obtido com sucesso',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obter status de conexão da instância
   */
  async getConnectionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { instanceName } = req.params;
      
      if (!instanceName) {
        res.status(400).json({
          success: false,
          message: 'Nome da instância é obrigatório'
        });
        return;
      }

      const result = await this.evolutionService.getConnectionStatus(instanceName);
      
      res.status(200).json({
        success: true,
        message: 'Status obtido com sucesso',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Desconectar instância
   */
  async disconnectInstance(req: Request, res: Response): Promise<void> {
    try {
      const { instanceName } = req.params;
      
      if (!instanceName) {
        res.status(400).json({
          success: false,
          message: 'Nome da instância é obrigatório'
        });
        return;
      }

      const result = await this.evolutionService.disconnectInstance(instanceName);
      
      res.status(200).json({
        success: true,
        message: 'Instância desconectada com sucesso',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Reiniciar instância
   */
  async restartInstance(req: Request, res: Response): Promise<void> {
    try {
      const { instanceName } = req.params;
      
      if (!instanceName) {
        res.status(400).json({
          success: false,
          message: 'Nome da instância é obrigatório'
        });
        return;
      }

      const result = await this.evolutionService.restartInstance(instanceName);
      
      res.status(200).json({
        success: true,
        message: 'Instância reiniciada com sucesso',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Deletar instância
   */
  async deleteInstance(req: Request, res: Response): Promise<void> {
    try {
      const { instanceName } = req.params;
      
      if (!instanceName) {
        res.status(400).json({
          success: false,
          message: 'Nome da instância é obrigatório'
        });
        return;
      }

      const result = await this.evolutionService.deleteInstance(instanceName);
      
      res.status(200).json({
        success: true,
        message: 'Instância deletada com sucesso',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Atualizar configurações da instância
   */
  async updateInstance(req: Request, res: Response): Promise<void> {
    try {
      const { instanceName } = req.params;
      const data: UpdateEvolutionInstanceRequest = req.body;
      
      if (!instanceName) {
        res.status(400).json({
          success: false,
          message: 'Nome da instância é obrigatório'
        });
        return;
      }

      const result = await this.evolutionService.updateInstance(instanceName, data);
      
      res.status(200).json({
        success: true,
        message: 'Instância atualizada com sucesso',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obter informações do perfil da instância
   */
  async getProfileInfo(req: Request, res: Response): Promise<void> {
    try {
      const { instanceName } = req.params;
      
      if (!instanceName) {
        res.status(400).json({
          success: false,
          message: 'Nome da instância é obrigatório'
        });
        return;
      }

      const result = await this.evolutionService.getProfileInfo(instanceName);
      
      res.status(200).json({
        success: true,
        message: 'Perfil obtido com sucesso',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Verificar se a Evolution API está funcionando
   */
  async checkApiHealth(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.evolutionService.checkApiHealth();
      
      res.status(200).json({
        success: true,
        message: 'API funcionando corretamente',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Definir webhook para uma instância
   */
  async setWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { instanceName } = req.params;
      const { webhookUrl, events } = req.body;
      
      if (!instanceName) {
        res.status(400).json({
          success: false,
          message: 'Nome da instância é obrigatório'
        });
        return;
      }

      if (!webhookUrl) {
        res.status(400).json({
          success: false,
          message: 'URL do webhook é obrigatória'
        });
        return;
      }

      const result = await this.evolutionService.setWebhook(instanceName, webhookUrl, events);
      
      res.status(200).json({
        success: true,
        message: 'Webhook configurado com sucesso',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ========================================
  // MÉTODOS PARA GERENCIAR INSTÂNCIAS POR CLIENTE
  // ========================================

  /**
   * Listar todas as instâncias de um cliente
   */
  async getInstancesByCliente(req: Request, res: Response): Promise<void> {
    try {
      const { clienteId } = req.params;
      
      if (!clienteId) {
        res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório'
        });
        return;
      }

      const instances = await this.evolutionService.getInstancesByClienteId(clienteId);
      
      res.status(200).json({
        success: true,
        message: 'Instâncias obtidas com sucesso',
        data: instances,
        total: instances.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obter uma instância específica de um cliente
   */
  async getInstanceByCliente(req: Request, res: Response): Promise<void> {
    try {
      const { clienteId, instanceId } = req.params;
      
      if (!clienteId || !instanceId) {
        res.status(400).json({
          success: false,
          message: 'ID do cliente e ID da instância são obrigatórios'
        });
        return;
      }

      const instance = await this.evolutionService.getInstanceDBByClienteId(clienteId, instanceId);
      
      if (!instance) {
        res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Instância obtida com sucesso',
        data: instance
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Criar uma nova instância para um cliente
   */
  async createInstanceForCliente(req: Request, res: Response): Promise<void> {
    try {
      const { clienteId } = req.params;
      const { instanceName, webhookUrl, ...apiData } = req.body;
      
      if (!clienteId) {
        res.status(400).json({
          success: false,
          message: 'ID do cliente é obrigatório'
        });
        return;
      }

      if (!instanceName) {
        res.status(400).json({
          success: false,
          message: 'Nome da instância é obrigatório'
        });
        return;
      }

      // Preparar dados para a Evolution API
      const evolutionApiData: CreateEvolutionInstanceRequest = {
        instanceName,
        qrcode: true,
        ...apiData
      };

      // Criar instância completa (API + Banco)
      const result = await this.evolutionService.createCompleteInstance(
        clienteId,
        instanceName,
        evolutionApiData,
        webhookUrl
      );

      res.status(201).json({
        success: true,
        message: 'Instância criada com sucesso',
        data: {
          database: result.db,
          api: result.api
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Conectar uma instância de um cliente e obter QR Code
   */
  async connectInstanceByCliente(req: Request, res: Response): Promise<void> {
    try {
      const { clienteId, instanceId } = req.params;
      const { number } = req.query;
      
      if (!clienteId || !instanceId) {
        res.status(400).json({
          success: false,
          message: 'ID do cliente e ID da instância são obrigatórios'
        });
        return;
      }

      // Buscar instância no banco
      const instanceDB = await this.evolutionService.getInstanceDBByClienteId(clienteId, instanceId);
      if (!instanceDB) {
        res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
        return;
      }

      // Conectar na Evolution API
      const qrResponse = await this.evolutionService.connectInstance(
        instanceDB.instance_name,
        number as string
      );

      // Atualizar QR Code no banco
      if (qrResponse.response?.qrcode) {
        await this.evolutionService.updateInstanceDB(clienteId, instanceId, {
          qr_code: qrResponse.response.qrcode,
          status: 'connecting'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Instância conectada, QR Code gerado',
        data: qrResponse
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obter status de conexão de uma instância de um cliente
   */
  async getConnectionStatusByCliente(req: Request, res: Response): Promise<void> {
    try {
      const { clienteId, instanceId } = req.params;
      
      if (!clienteId || !instanceId) {
        res.status(400).json({
          success: false,
          message: 'ID do cliente e ID da instância são obrigatórios'
        });
        return;
      }

      // Sincronizar status com a Evolution API
      const updatedInstance = await this.evolutionService.syncInstanceStatus(clienteId, instanceId);

      res.status(200).json({
        success: true,
        message: 'Status sincronizado',
        data: updatedInstance
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Desconectar uma instância de um cliente
   */
  async disconnectInstanceByCliente(req: Request, res: Response): Promise<void> {
    try {
      const { clienteId, instanceId } = req.params;
      
      if (!clienteId || !instanceId) {
        res.status(400).json({
          success: false,
          message: 'ID do cliente e ID da instância são obrigatórios'
        });
        return;
      }

      // Buscar instância no banco
      const instanceDB = await this.evolutionService.getInstanceDBByClienteId(clienteId, instanceId);
      if (!instanceDB) {
        res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
        return;
      }

      // Desconectar na Evolution API
      await this.evolutionService.disconnectInstance(instanceDB.instance_name);

      // Atualizar status no banco
      const updatedInstance = await this.evolutionService.updateInstanceDB(clienteId, instanceId, {
        status: 'disconnected',
        is_connected: false,
        qr_code: undefined
      });

      res.status(200).json({
        success: true,
        message: 'Instância desconectada',
        data: updatedInstance
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Deletar uma instância de um cliente
   */
  async deleteInstanceByCliente(req: Request, res: Response): Promise<void> {
    try {
      const { clienteId, instanceId } = req.params;
      
      if (!clienteId || !instanceId) {
        res.status(400).json({
          success: false,
          message: 'ID do cliente e ID da instância são obrigatórios'
        });
        return;
      }

      // Deletar instância completa (API + Banco)
      await this.evolutionService.deleteCompleteInstance(clienteId, instanceId);

      res.status(200).json({
        success: true,
        message: 'Instância deletada com sucesso'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Atualizar configurações de uma instância de um cliente
   */
  async updateInstanceByCliente(req: Request, res: Response): Promise<void> {
    try {
      const { clienteId, instanceId } = req.params;
      const updates = req.body;
      
      if (!clienteId || !instanceId) {
        res.status(400).json({
          success: false,
          message: 'ID do cliente e ID da instância são obrigatórios'
        });
        return;
      }

      // Atualizar no banco de dados
      const updatedInstance = await this.evolutionService.updateInstanceDB(clienteId, instanceId, updates);

      res.status(200).json({
        success: true,
        message: 'Instância atualizada com sucesso',
        data: updatedInstance
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Reiniciar uma instância de um cliente
   */
  async restartInstanceByCliente(req: Request, res: Response): Promise<void> {
    try {
      const { clienteId, instanceId } = req.params;
      
      if (!clienteId || !instanceId) {
        res.status(400).json({
          success: false,
          message: 'ID do cliente e ID da instância são obrigatórios'
        });
        return;
      }

      // Buscar instância no banco
      const instanceDB = await this.evolutionService.getInstanceDBByClienteId(clienteId, instanceId);
      if (!instanceDB) {
        res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
        return;
      }

      // Reiniciar na Evolution API
      const result = await this.evolutionService.restartInstance(instanceDB.instance_name);

      // Atualizar status no banco
      await this.evolutionService.updateInstanceDB(clienteId, instanceId, {
        status: 'connecting',
        is_connected: false
      });

      res.status(200).json({
        success: true,
        message: 'Instância reiniciada',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}