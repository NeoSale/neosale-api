import { Request, Response } from 'express';
import evolutionApiServiceV2 from '../services/evolution-api-v2.service';
import { CreateEvolutionApiRequestV2 } from '../models/evolution-api-v2.model';

export class EvolutionApiV2Controller {
  async getAllInstances(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string;
      
      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        });
      }

      const instances = await evolutionApiServiceV2.getAllInstances(clienteId);
      
      return res.json({
        success: true,
        data: instances,
        message: 'Evolution API instances retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error in getAllInstances:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  async getInstanceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const clienteId = req.headers['cliente_id'] as string;
      
      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        });
      }

      const instance = await evolutionApiServiceV2.getInstanceById(id, clienteId);
      
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
      console.error('Error in getInstanceById:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  async getInstanceByName(req: Request, res: Response) {
    try {
      const { instanceName } = req.params;
      const clienteId = req.headers['cliente_id'] as string;
      
      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        });
      }

      const instance = await evolutionApiServiceV2.getInstanceByName(instanceName, clienteId);
      
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
      console.error('Error in getInstanceByName:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  async createInstance(req: Request, res: Response) {
    try {
      console.log('createInstance', req.body);
      const instanceData: CreateEvolutionApiRequestV2 = req.body;
      const clienteId = req.headers['cliente_id'] as string;

      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        });
      }

      const newInstance = await evolutionApiServiceV2.createInstance(instanceData, clienteId);
      
      return res.status(201).json({
        success: true,
        data: newInstance,
        message: 'Evolution API instance created successfully'
      });
    } catch (error: any) {
      console.error('Error in createInstance:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }



  async deleteInstance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const clienteId = req.headers['cliente_id'] as string;
      
      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        });
      }

      await evolutionApiServiceV2.deleteInstance(id, clienteId);
      
      return res.json({
        success: true,
        message: 'Evolution API instance deleted successfully'
      });
    } catch (error: any) {
      console.error('Error in deleteInstance:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  async getQRCode(req: Request, res: Response) {
    try {
      const { clientName } = req.params;
      const clienteId = req.headers['cliente_id'] as string;
      
      if (!clienteId) {
        return res.status(400).json({
          error: 'cliente_id header is required'
        });
      }

      const result = await evolutionApiServiceV2.getQRCode(clientName, clienteId);
      
      return res.json({
        pairingCode: result.pairingCode || null,
        code: result.code || '',
        base64: result.base64 || '',
        count: result.count || 1
      });
    } catch (error: any) {
      console.error('Error in getQRCode:', error);
      return res.status(500).json({
        error: error.message || 'Failed to get QR code'
      });
    }
  }

  async connectInstance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const clienteId = req.headers['cliente_id'] as string;
      
      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        });
      }

      const result = await evolutionApiServiceV2.connectInstance(id, clienteId);
      
      return res.json({
        success: true,
        data: result,
        message: 'Instance connection initiated successfully'
      });
    } catch (error: any) {
      console.error('Error in connectInstance:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  async disconnectInstance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const clienteId = req.headers['cliente_id'] as string;
      
      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        });
      }

      await evolutionApiServiceV2.disconnectInstance(id, clienteId);
      
      return res.json({
        success: true,
        message: 'Instance disconnected successfully'
      });
    } catch (error: any) {
      console.error('Error in disconnectInstance:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  async restartInstance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const clienteId = req.headers['cliente_id'] as string;
      
      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        });
      }

      await evolutionApiServiceV2.restartInstance(id, clienteId);
      
      return res.json({
        success: true,
        message: 'Instance restarted successfully'
      });
    } catch (error: any) {
      console.error('Error in restartInstance:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  async updateInstance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const clienteId = req.headers['cliente_id'] as string;
      
      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        });
      }

      const updateData = req.body;
      const updatedInstance = await evolutionApiServiceV2.updateInstance(id, updateData, clienteId);
      
      return res.json({
        success: true,
        data: updatedInstance,
        message: 'Instance updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating instance:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  async getClienteIdByInstanceName(req: Request, res: Response) {
    try {
      const { instanceName } = req.params;
      
      const clienteData = await evolutionApiServiceV2.getClienteDataByInstanceName(instanceName);
      
      if (!clienteData) {
        return res.status(404).json({
          success: false,
          message: 'Instance not found'
        });
      }

      return res.json({
        success: true,
        data: {
          cliente_id: clienteData.cliente_id,
          nome: clienteData.nome,
          nickname: clienteData.nickname
        },
        message: 'Cliente data retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error in getClienteIdByInstanceName:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  async getBase64FromMediaMessage(req: Request, res: Response) {
    try {
      const { instance_name } = req.params;
      const { message } = req.body;
      const apikey = req.headers['apikey'] as string;
      
      if (!instance_name) {
        return res.status(400).json({
          success: false,
          message: 'instance_name é obrigatório'
        });
      }

      if (!message?.key?.id) {
        return res.status(400).json({
          success: false,
          message: 'message.key.id é obrigatório'
        });
      }

      if (!apikey) {
        return res.status(400).json({
          success: false,
          message: 'Header apikey é obrigatório'
        });
      }

      const mediaData = await evolutionApiServiceV2.getBase64FromMediaMessage(instance_name, message.key.id, apikey);
      
      return res.json({
        success: true,
        data: mediaData,
        message: 'Media base64 retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error in getBase64FromMediaMessage:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  async sendText(req: Request, res: Response) {
    try {
      const { instancename } = req.params;
      const { number, text } = req.body;
      const apikey = req.headers['apikey'] as string;
      
      if (!apikey) {
        return res.status(400).json({
          success: false,
          message: 'Header apikey é obrigatório'
        });
      }

      if (!number || !text) {
        return res.status(400).json({
          success: false,
          message: 'Campos number e text são obrigatórios'
        });
      }

      const result = await evolutionApiServiceV2.sendText(
        instancename,
        number,
        text,
        apikey
      );

      // Atualizar o campo instance_name nos leads que correspondem ao número
      await evolutionApiServiceV2.updateLeadInstanceName(instancename, number);
      
      return res.json({
        success: true,
        data: result,
        message: 'Text message sent successfully'
      });
    } catch (error: any) {
      console.error('Error in sendText:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  async fetchProfilePictureUrl(req: Request, res: Response) {
    try {
      const { instance_name } = req.params;
      const { number } = req.body;
      const apikey = req.headers['apikey'] as string;
      
      if (!apikey) {
        return res.status(400).json({
          success: false,
          message: 'Header apikey é obrigatório'
        });
      }

      if (!number) {
        return res.status(400).json({
          success: false,
          message: 'Campo number é obrigatório'
        });
      }

      const result = await evolutionApiServiceV2.fetchProfilePictureUrl(
        instance_name,
        number,
        apikey
      );
      
      return res.json({
        success: true,
        data: result,
        message: 'Profile picture URL fetched successfully'
      });
    } catch (error: any) {
      console.error('Error in fetchProfilePictureUrl:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  async sendPresence(req: Request, res: Response) {
    try {
      const { instance } = req.params;
      const { number, presence, delay } = req.body;
      const apikey = req.headers['apikey'] as string;

      // Validação mais detalhada para ajudar na depuração
      if (!instance) {
        return res.status(400).json({
          success: false,
          message: 'instance is required'
        });
      }

      if (!number) {
        return res.status(400).json({
          success: false,
          message: 'number is required'
        });
      }

      if (!presence) {
        return res.status(400).json({
          success: false,
          message: 'presence is required'
        });
      }

      if (!delay) {
        return res.status(400).json({
          success: false,
          message: 'delay is required'
        });
      }
      
      const result = await evolutionApiServiceV2.sendPresence(
        instance,
        number,
        presence,
        delay || 0,
        apikey
      );

      return res.json({
        success: true,
        data: result,
        message: 'Presence sent successfully'
      });
    } catch (error: any) {
      console.error('Error in sendPresence:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  async findContacts(req: Request, res: Response) {
    try {
      const { instanceName } = req.params;
      const { where } = req.body;
      const apikey = req.headers['apikey'] as string;

      if (!instanceName) {
        return res.status(400).json({
          success: false,
          message: 'instanceName is required'
        });
      }

      if (!where) {
        return res.status(400).json({
          success: false,
          message: 'where filter is required in the request body'
        });
      }

      const contacts = await evolutionApiServiceV2.findContacts(
        instanceName,
        where,
        apikey
      );

      return res.json(contacts);
    } catch (error: any) {
      console.error('Error in findContacts:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
}

export const evolutionApiV2Controller = new EvolutionApiV2Controller();