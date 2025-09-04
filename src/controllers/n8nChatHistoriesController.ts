import { Request, Response } from 'express';
import N8nChatHistoriesService from '../services/n8nChatHistoriesService';
import { createChatHistorySchema, updateChatHistorySchema, sessionIdParamSchema, idParamSchema, paginationSchema, UpdateChatHistoryInput } from '../lib/validators';

export class N8nChatHistoriesController {
  // Método auxiliar para extrair ID da URL
  private static extractIdFromUrl(req: Request): number {
    return parseInt(req.params.id);
  }

  // Método auxiliar para tratar erros
  private static handleError(res: Response, error: any) {
    console.error('❌ Erro no N8nChatHistoriesController:', error);
    
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

  // POST /api/chat - Criar nova mensagem de chat (apenas gravar na tabela)
  static async createSimpleChatHistory(req: Request, res: Response) {
    try {
      const validatedData = createChatHistorySchema.parse(req.body);
      const chatHistory = await N8nChatHistoriesService.createChatHistory(validatedData as { session_id: string; message: any });
      
      return res.status(201).json({
        success: true,
        message: 'Mensagem de chat criada com sucesso',
        data: chatHistory
      });
    } catch (error) {
      return N8nChatHistoriesController.handleError(res, error);
    }
  }

  // POST /api/chat/sendText - Criar nova mensagem de chat com integração
  static async createChatHistory(req: Request, res: Response) {
    try {
      const validatedData = createChatHistorySchema.parse(req.body);
      const chatHistory = await N8nChatHistoriesService.createChatHistory(validatedData as { session_id: string; message: any });
      
      return res.status(201).json({
        success: true,
        message: 'Mensagem de chat criada com sucesso',
        data: chatHistory
      });
    } catch (error) {
      return N8nChatHistoriesController.handleError(res, error);
    }
  }

  // GET /api/chat/cliente/:cliente_id - Buscar todos os registros da tabela n8n_chat_histories pelo cliente_id
  static async getChatHistoriesByClienteId(req: Request, res: Response) {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      const { page, limit } = paginationSchema.parse(req.query);
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no header'
        });
      }

      const result = await N8nChatHistoriesService.getAllChatHistoriesByClienteId(cliente_id, page, limit);
      
      return res.status(200).json({
        success: true,
        message: 'Todos os registros de chat encontrados',
        data: result.data,
        pagination: {
          total: result.total || 0,
          page: result.page || 1,
          limit: result.limit || 50,
          totalPages: Math.ceil((result.total || 0) / (result.limit || 50))
        }
      });
    } catch (error) {
      return N8nChatHistoriesController.handleError(res, error);
    }
  }

  // GET /api/chat/session/:session_id - Buscar mensagens por session_id
  static async getChatHistoriesBySessionId(req: Request, res: Response) {
    try {
      const { session_id } = sessionIdParamSchema.parse(req.params);
      const { page, limit } = paginationSchema.parse(req.query);
      
      const result = await N8nChatHistoriesService.getChatHistoriesBySessionId(session_id, page, limit);
      
      return res.status(200).json({
        success: true,
        message: 'Mensagens de chat encontradas',
        data: result.data,
        pagination: {
          total: result.total || 0,
          page: page,
          limit: limit,
          totalPages: Math.ceil((result.total || 0) / limit)
        }
      });
    } catch (error) {
      return N8nChatHistoriesController.handleError(res, error);
    }
  }

  // GET /api/chat/:id - Buscar mensagem por ID
  static async getChatHistoryById(req: Request, res: Response) {
    try {
      const id = N8nChatHistoriesController.extractIdFromUrl(req);
      // A validação do ID numérico já é feita na rota com numericIdParamSchema
      
      const chatHistory = await N8nChatHistoriesService.getChatHistoryById(id);
      
      if (!chatHistory) {
        return res.status(404).json({
          success: false,
          message: 'Mensagem de chat não encontrada'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Mensagem de chat encontrada',
        data: chatHistory
      });
    } catch (error) {
      return N8nChatHistoriesController.handleError(res, error);
    }
  }

  // PUT /api/chat/:id - Atualizar mensagem de chat
  static async updateChatHistory(req: Request, res: Response) {
    try {
      const id = N8nChatHistoriesController.extractIdFromUrl(req);
      // A validação do ID numérico já é feita na rota com numericIdParamSchema
      
      const validatedData = updateChatHistorySchema.parse(req.body) as UpdateChatHistoryInput;
      const chatHistory = await N8nChatHistoriesService.updateChatHistory(id, validatedData);
      
      return res.status(200).json({
        success: true,
        message: 'Mensagem de chat atualizada com sucesso',
        data: chatHistory
      });
    } catch (error) {
      return N8nChatHistoriesController.handleError(res, error);
    }
  }

  // DELETE /api/chat/:id - Deletar mensagem de chat
  static async deleteChatHistory(req: Request, res: Response) {
    try {
      const id = N8nChatHistoriesController.extractIdFromUrl(req);
      // A validação do ID numérico já é feita na rota com numericIdParamSchema
      
      await N8nChatHistoriesService.deleteChatHistory(id);
      
      return res.status(200).json({
        success: true,
        message: 'Mensagem de chat deletada com sucesso'
      });
    } catch (error) {
      return N8nChatHistoriesController.handleError(res, error);
    }
  }

  // DELETE /api/chat/session/:session_id - Deletar todas as mensagens de uma sessão
  static async deleteChatHistoriesBySessionId(req: Request, res: Response) {
    try {
      const { session_id } = sessionIdParamSchema.parse(req.params);
      
      await N8nChatHistoriesService.deleteChatHistoriesBySessionId(session_id);
      
      return res.status(200).json({
        success: true,
        message: 'Todas as mensagens da sessão foram deletadas com sucesso'
      });
    } catch (error) {
      return N8nChatHistoriesController.handleError(res, error);
    }
  }

  // GET /api/chat/ultima_mensagem/:session_id - Buscar última mensagem por session_id
  static async getMessagesBySessionIDType(req: Request, res: Response) {
    try {
      const { session_id: sessionId } = sessionIdParamSchema.parse(req.params);
      const { message_type } = req.query;
      
      const result = await N8nChatHistoriesService.getMessagesBySessionIDType(sessionId, message_type as string);
      
      return res.status(200).json({
         success: true,
         message: 'Última mensagem encontrada com sucesso',
         data: result.data,
         total: result.total
       });
    } catch (error) {
      return N8nChatHistoriesController.handleError(res, error);
    }
  }

  // POST /api/chat/:session_id/mark-error - Marcar última mensagem como erro
  static async markLastMessageAsError(req: Request, res: Response) {
    try {
      const { session_id: sessionId } = sessionIdParamSchema.parse(req.params);
      const { message_type, error_message } = req.body;
      
      // Validar o tipo de mensagem
      if (!message_type || !['ai', 'human'].includes(message_type.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de mensagem é obrigatório e deve ser "ai" ou "human"'
        });
      }
      
      const updatedMessage = await N8nChatHistoriesService.markLastMessageAsError(
        sessionId, 
        message_type.toLowerCase() as 'ai' | 'human', 
        error_message
      );
      
      return res.status(200).json({
        success: true,
        message: `Última mensagem do tipo '${message_type}' marcada como erro com sucesso`,
        data: updatedMessage
      });
    } catch (error) {
      return N8nChatHistoriesController.handleError(res, error);
    }
  }
}

export const chatController = new N8nChatHistoriesController();