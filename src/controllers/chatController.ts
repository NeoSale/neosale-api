import { Request, Response } from 'express';
import ChatService from '../services/chatService';
import { createChatSendTextSchema } from '../lib/validators';
import { z } from 'zod';

// Schemas de validação
const createChatSchema = z.object({
  lead_id: z.string().uuid('Lead ID deve ser um UUID válido'),
  tipo: z.enum(['human', 'ai'], { message: 'Tipo deve ser human ou ai' }),
  mensagem: z.string().min(1, 'Mensagem é obrigatória'),
  source: z.string().min(1, 'Source é obrigatório'),
  status: z.enum(['sucesso', 'erro']).default('sucesso'),
  erro: z.string().optional()
});

const updateChatSchema = z.object({
  tipo: z.enum(['human', 'ai']).optional(),
  mensagem: z.string().min(1).optional(),
  source: z.string().optional(),
  status: z.enum(['sucesso', 'erro']).optional(),
  erro: z.string().optional()
}).transform((data) => {
  // Remove undefined values to match service interface
  const result: any = {};
  if (data.tipo !== undefined) result.tipo = data.tipo;
  if (data.mensagem !== undefined) result.mensagem = data.mensagem;
  if (data.source !== undefined) result.source = data.source;
  if (data.status !== undefined) result.status = data.status;
  if (data.erro !== undefined) result.erro = data.erro;
  return result;
});

const uuidParamSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido')
});

export class ChatController {
  // Método auxiliar para tratar erros
  private static handleError(res: Response, error: any) {
    console.error('❌ Erro no ChatController:', error);
    
    if (error.message?.includes('não encontrado')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message?.includes('UUID válido') || error.message?.includes('obrigatório')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }

  // POST /api/chat - Criar nova mensagem de chat
  static async create(req: Request, res: Response) {
    try {
      const validatedData = createChatSchema.parse(req.body);
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'Cliente ID é obrigatório no cabeçalho'
        });
      }
      
      const chatData = {
        ...validatedData,
        cliente_id
      };
      
      const chat = await ChatService.create(chatData);
      
      return res.status(201).json({
        success: true,
        message: 'Mensagem de chat criada com sucesso',
        data: chat
      });
    } catch (error) {
      return ChatController.handleError(res, error);
    }
  }

  // GET /api/chat - Listar todas as mensagens com paginação
  static async getAll(req: Request, res: Response) {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'Cliente ID é obrigatório no cabeçalho'
        });
      }
      
      const result = await ChatService.getAll(cliente_id);
      
      return res.status(200).json({
        success: true,
        message: 'Mensagens de chat obtidas com sucesso',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      return ChatController.handleError(res, error);
    }
  }

  // GET /api/chat/:id - Buscar mensagem por ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = uuidParamSchema.parse(req.params);
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'Cliente ID é obrigatório no cabeçalho'
        });
      }
      
      const chat = await ChatService.getById(id, cliente_id);
      
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Mensagem de chat não encontrada'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Mensagem de chat obtida com sucesso',
        data: chat
      });
    } catch (error) {
      return ChatController.handleError(res, error);
    }
  }

  // GET /api/chat/lead/:leadId - Buscar mensagens por lead
  static async getByLeadId(req: Request, res: Response) {
    try {
      const { leadId } = z.object({ leadId: z.string().uuid() }).parse(req.params);
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'Cliente ID é obrigatório no cabeçalho'
        });
      }
      
      const result = await ChatService.getByLeadId(leadId, cliente_id);
      
      return res.status(200).json({
        success: true,
        message: 'Mensagens do lead obtidas com sucesso',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      return ChatController.handleError(res, error);
    }
  }

  // POST /api/chat/sendText - Criar nova mensagem de chat com integração
  static async createChatSendText(req: Request, res: Response) {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'Cliente ID é obrigatório no cabeçalho'
        });
      }

      // Adiciona o cliente_id do cabeçalho ao corpo da requisição antes da validação
      const chatData = {
        ...req.body,
        cliente_id
      };
      
      const validatedData = createChatSendTextSchema.parse(chatData);

      const chat = await ChatService.createChatSendText(validatedData);
      
      return res.status(201).json({
        success: true,
        message: 'Mensagem de chat criada com sucesso',
        data: chat
      });
    } catch (error) {
      return ChatController.handleError(res, error);
    }
  }

  // GET /api/chat/stats/today - Count messages sent today
  static async getTodayCount(req: Request, res: Response) {
    try {
      const cliente_id = req.headers['cliente_id'] as string;

      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'Cliente ID é obrigatório no cabeçalho'
        });
      }

      const stats = await ChatService.getTodayCount(cliente_id);

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      return ChatController.handleError(res, error);
    }
  }

  // PUT /api/chat/:id - Atualizar mensagem
  static async update(req: Request, res: Response) {
    try {
      const { id } = uuidParamSchema.parse(req.params);
      const validatedData = updateChatSchema.parse(req.body);
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'Cliente ID é obrigatório no cabeçalho'
        });
      }
      
      const chat = await ChatService.update(id, validatedData, cliente_id);
      
      return res.status(200).json({
        success: true,
        message: 'Mensagem de chat atualizada com sucesso',
        data: chat
      });
    } catch (error) {
      return ChatController.handleError(res, error);
    }
  }

  // DELETE /api/chat/:id - Deletar mensagem
  static async delete(req: Request, res: Response) {
    try {
      const { id } = uuidParamSchema.parse(req.params);
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'Cliente ID é obrigatório no cabeçalho'
        });
      }
      
      await ChatService.delete(id, cliente_id);
      
      return res.status(200).json({
        success: true,
        message: 'Mensagem de chat deletada com sucesso'
      });
    } catch (error) {
      return ChatController.handleError(res, error);
    }
  }

  // DELETE /api/chat/lead/:leadId - Deletar todas as mensagens de um lead
  static async deleteByLeadId(req: Request, res: Response) {
    try {
      const { leadId } = z.object({ leadId: z.string().uuid() }).parse(req.params);
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'Cliente ID é obrigatório no cabeçalho'
        });
      }
      
      await ChatService.deleteByLeadId(leadId, cliente_id);
      
      return res.status(200).json({
        success: true,
        message: 'Todas as mensagens do lead foram deletadas com sucesso'
      });
    } catch (error) {
      return ChatController.handleError(res, error);
    }
  }
}

export default ChatController;