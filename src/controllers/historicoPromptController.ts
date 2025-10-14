import { Request, Response } from 'express';
import { HistoricoPromptService } from '../services/historicoPromptService';

export class HistoricoPromptController {
  /**
   * Busca todos os históricos de prompt
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const clienteId = req.headers['cliente_id'] as string;
      
      if (!clienteId) {
        res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        });
        return;
      }
      
      const historicos = await HistoricoPromptService.getAll(clienteId);
      
      res.status(200).json({
        success: true,
        data: historicos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  /**
   * Busca um histórico de prompt por ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const clienteId = req.headers['cliente_id'] as string;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
        return;
      }
      
      if (!clienteId) {
        res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        });
        return;
      }
      
      const historico = await HistoricoPromptService.getById(id, clienteId);
      
      if (!historico) {
        res.status(404).json({
          success: false,
          message: 'Histórico de prompt não encontrado'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: historico
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  /**
   * Busca históricos de prompt por agente
   */
  static async getByAgenteId(req: Request, res: Response): Promise<void> {
    try {
      const { agenteId } = req.params;
      const clienteId = req.headers['cliente_id'] as string;
      
      if (!agenteId) {
        res.status(400).json({
          success: false,
          message: 'ID do agente é obrigatório'
        });
        return;
      }
      
      if (!clienteId) {
        res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        });
        return;
      }
      
      const historicos = await HistoricoPromptService.getByAgenteId(agenteId, clienteId);
      
      res.status(200).json({
        success: true,
        data: historicos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  /**
   * Cria um novo histórico de prompt
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { agente_id, prompt, prompt_agendamento } = req.body;
      const clienteId = req.headers['cliente_id'] as string;
      
      if (!agente_id) {
        res.status(400).json({
          success: false,
          message: 'ID do agente é obrigatório'
        });
        return;
      }
      
      if (!clienteId) {
        res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        });
        return;
      }
      
      const input = {
        agente_id,
        cliente_id: clienteId,
        prompt,
        prompt_agendamento
      };
      
      const historico = await HistoricoPromptService.create(input);
      
      res.status(201).json({
        success: true,
        data: historico
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualiza um histórico de prompt
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { prompt, prompt_agendamento } = req.body;
      const clienteId = req.headers['cliente_id'] as string;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
        return;
      }
      
      if (!clienteId) {
        res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        });
        return;
      }
      
      const input = {
        prompt,
        prompt_agendamento
      };
      
      const historico = await HistoricoPromptService.update(id, input, clienteId);
      
      res.status(200).json({
        success: true,
        data: historico
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  /**
   * Deleta um histórico de prompt
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const clienteId = req.headers['cliente_id'] as string;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
        return;
      }
      
      if (!clienteId) {
        res.status(400).json({
          success: false,
          message: 'Header cliente_id é obrigatório'
        });
        return;
      }
      
      await HistoricoPromptService.delete(id, clienteId);
      
      res.status(200).json({
        success: true,
        message: 'Histórico de prompt deletado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
}