import { Request, Response } from 'express';
import { evolutionApiService } from '../services/evolution-api.service';
import { 
  CreateEvolutionApiRequest, 
  UpdateEvolutionApiRequest,
  ConnectInstanceRequest
} from '../models/evolution-api.model';

export class EvolutionApiController {
  // GET /api/evolution-api - List all instances
  async getAllInstances(req: Request, res: Response) {
    try {
      const clienteId = req.headers.cliente_id as string;
      const instances = await evolutionApiService.getAllInstances(clienteId);
      res.json({
        success: true,
        data: instances,
        message: 'Evolution API instances retrieved successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve Evolution API instances'
      });
    }
  }

  // GET /api/evolution-api/:id - Get instance by ID
  async getInstanceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const clienteId = req.headers.cliente_id as string;
      const instance = await evolutionApiService.getInstanceById(id, clienteId);
      
      if (!instance) {
        return res.status(404).json({
          success: false,
          message: 'Evolution API instance not found'
        });
      }

      return res.json({
        success: true,
        data: instance,
        message: 'Evolution API instance retrieved successfully'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve Evolution API instance'
      });
    }
  }

  // GET /api/evolution-api/name/:instanceName - Get instance by name
  async getInstanceByName(req: Request, res: Response) {
    try {
      const { instanceName } = req.params;
      const clienteId = req.headers.cliente_id as string;
      const instance = await evolutionApiService.getInstanceByName(instanceName, clienteId);
      
      if (!instance) {
        return res.status(404).json({
          success: false,
          message: 'Evolution API instance not found'
        });
      }

      return res.json({
        success: true,
        data: instance,
        message: 'Evolution API instance retrieved successfully'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve Evolution API instance'
      });
    }
  }

  // POST /api/evolution-api - Create new instance
  async createInstance(req: Request, res: Response) {
    const instanceData: CreateEvolutionApiRequest = req.body;
    const clienteId = req.headers.cliente_id as string;
    
    try {
      const newInstance = await evolutionApiService.createInstance(instanceData, clienteId);
      
      res.status(201).json({
        success: true,
        data: newInstance,
        message: 'Evolution API instance created successfully'
      });
    } catch (error: any) {
      // Check for specific error types and provide friendly messages
      let friendlyMessage = 'Failed to create Evolution API instance';
      let statusCode = 400;
      
      if (error.message.includes('already exists')) {
        friendlyMessage = `Já existe uma instância com o nome '${instanceData.instance_name}'. Por favor, escolha um nome diferente.`;
        statusCode = 409; // Conflict
      } else if (error.message.includes('Unauthorized')) {
        friendlyMessage = 'Erro de autenticação com a Evolution API. Verifique as configurações.';
        statusCode = 401;
      } else if (error.message.includes('foreign key constraint')) {
        friendlyMessage = 'Cliente não encontrado. Verifique se o ID do cliente está correto.';
        statusCode = 404;
      }
      
      res.status(statusCode).json({
        success: false,
        error: error.message,
        message: friendlyMessage
      });
    }
  }

  // PUT /api/evolution-api/:id - Update instance
  async updateInstance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateEvolutionApiRequest = req.body;
      const clienteId = req.headers['cliente_id'] as string;
      const updatedInstance = await evolutionApiService.updateInstance(id, updateData, clienteId);
      
      res.json({
        success: true,
        data: updatedInstance,
        message: 'Evolution API instance updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        message: 'Failed to update Evolution API instance'
      });
    }
  }

  // DELETE /api/evolution-api/:id - Delete instance
  async deleteInstance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const clienteId = req.headers['cliente_id'] as string;
      await evolutionApiService.deleteInstance(id, clienteId);
      
      res.json({
        success: true,
        message: 'Evolution API instance deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        message: 'Failed to delete Evolution API instance'
      });
    }
  }

  // POST /api/evolution-api/:instanceName/connect - Connect instance and get QR code
  async connectInstance(req: Request, res: Response) {
    try {
      const { instanceName } = req.params;
      const clienteId = req.headers.cliente_id as string;
      const qrData = await evolutionApiService.connectInstance(instanceName, clienteId);
      
      res.json({
        success: true,
        data: qrData,
        message: 'Instance connection initiated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        message: 'Failed to connect instance'
      });
    }
  }

  // POST /api/evolution-api/:instanceName/disconnect - Disconnect instance
  async disconnectInstance(req: Request, res: Response) {
    try {
      const { instanceName } = req.params;
      const clienteId = req.headers.cliente_id as string;
      await evolutionApiService.disconnectInstance(instanceName, clienteId);
      
      res.json({
        success: true,
        message: 'Instance disconnected successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        message: 'Failed to disconnect instance'
      });
    }
  }

  // GET /api/evolution-api/:instanceName/qrcode - Get QR code for instance
  async getQRCode(req: Request, res: Response) {
    const { instanceName } = req.params;
    const clienteId = req.headers.cliente_id as string;
    
    try {
      const qrData = await evolutionApiService.getQRCode(instanceName, clienteId);
      
      res.json({
        success: true,
        data: qrData,
        message: 'QR code retrieved successfully'
      });
    } catch (error: any) {
      // Check for specific error types and provide friendly messages
      let friendlyMessage = 'Falha ao obter QR code';
      let statusCode = 400;
      
      if (error.message.includes('not found') || error.message.includes('Instance') && error.message.includes('not found')) {
        friendlyMessage = `A instância '${instanceName}' não foi encontrada. Verifique se o nome está correto e se a instância foi criada.`;
        statusCode = 404;
      } else if (error.message.includes('Unauthorized')) {
        friendlyMessage = 'Erro de autenticação com a Evolution API. Verifique as configurações.';
        statusCode = 401;
      } else if (error.message.includes('not connected') || error.message.includes('disconnected')) {
        friendlyMessage = `A instância '${instanceName}' não está conectada. Conecte a instância primeiro para obter o QR code.`;
        statusCode = 400;
      }
      
      res.status(statusCode).json({
        success: false,
        error: error.message,
        message: friendlyMessage
      });
    }
  }

  // GET /api/evolution-api/status/:instanceName - Get connection status
  async getConnectionStatus(req: Request, res: Response) {
    try {
      const { instanceName } = req.params;
      const clienteId = req.headers.cliente_id as string;
      const status = await evolutionApiService.getConnectionStatus(instanceName, clienteId);
      
      return res.json({
        success: true,
        data: status,
        message: 'Connection status retrieved successfully'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get connection status'
      });
    }
  }

  // GET /api/evolution-api/fetch/:instanceId - Fetch instance data from Evolution API
  async fetchInstanceData(req: Request, res: Response) {
    try {
      const { instanceId } = req.params;
      const clienteId = req.headers.cliente_id as string;
      const instanceData = await evolutionApiService.fetchInstanceData(instanceId, clienteId);
      
      if (!instanceData) {
        return res.status(404).json({
          success: false,
          message: 'Instance not found'
        });
      }

      return res.json({
        success: true,
        data: instanceData,
        message: 'Instance data fetched and updated successfully'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to fetch instance data'
      });
    }
  }
}

export const evolutionApiController = new EvolutionApiController();