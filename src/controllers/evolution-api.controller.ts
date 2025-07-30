import { Request, Response } from 'express';
import evolutionApiService from '../services/evolution-api.service';
import { CreateEvolutionApiRequest } from '../models/evolution-api.model';

export class EvolutionApiController {
  async getAllInstances(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string;
      
      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        });
      }

      const instances = await evolutionApiService.getAllInstances(clienteId);
      
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
      const instanceData: CreateEvolutionApiRequest = req.body;
      const clienteId = req.headers['cliente_id'] as string;

      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        });
      }

      const newInstance = await evolutionApiService.createInstance(instanceData, clienteId);
      
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

      await evolutionApiService.deleteInstance(id, clienteId);
      
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

      const result = await evolutionApiService.getQRCode(clientName, clienteId);
      
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
      const { ClienteId } = req.query;

      if (!ClienteId) {
        return res.status(400).json({ error: 'ClienteId is required' });
      }

      const result = await evolutionApiService.connectInstance(id, ClienteId as string);
      return res.json(result);
    } catch (error) {
      console.error('Error connecting instance:', error);
      return res.status(500).json({ error: 'Failed to connect instance' });
    }
  }








}

export const evolutionApiController = new EvolutionApiController();