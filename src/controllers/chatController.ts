import { Request, Response } from 'express';
import ChatService from '../services/chatService';
import { createChatHistorySchema, updateChatHistorySchema, sessionIdParamSchema, idParamSchema, paginationSchema } from '../lib/validators';

export class ChatController {
  // Método auxiliar para extrair ID da URL
  private static extractIdFromUrl(req: Request): number {
    return parseInt(req.params.id);
  }

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
  static async createChatHistory(req: Request, res: Response) {
    try {
      const validatedData = createChatHistorySchema.parse(req.body);
      const chatHistory = await ChatService.createChatHistory(validatedData as { session_id: string; message: any });
      
      return res.status(201).json({
        success: true,
        message: 'Mensagem de chat criada com sucesso',
        data: chatHistory
      });
    } catch (error) {
      return ChatController.handleError(res, error);
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

      const result = await ChatService.getAllChatHistoriesByClienteId(cliente_id, page, limit);
      
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
      return ChatController.handleError(res, error);
    }
  }

  // GET /api/chat/session/:session_id - Buscar mensagens por session_id
  static async getChatHistoriesBySessionId(req: Request, res: Response) {
    try {
      const { session_id } = sessionIdParamSchema.parse(req.params);
      const { page, limit } = paginationSchema.parse(req.query);
      
      const result = await ChatService.getChatHistoriesBySessionId(session_id, page, limit);
      
      return res.status(200).json({
        success: true,
        message: 'Mensagens de chat encontradas',
        data: result.data,
        pagination: {
          total: result.total || 0,
          page: result.page || 1,
          limit: result.limit || 50,
          totalPages: Math.ceil((result.total || 0) / (result.limit || 50))
        }
      });
    } catch (error) {
      return ChatController.handleError(res, error);
    }
  }

  // GET /api/chat/:id - Buscar mensagem por ID
  static async getChatHistoryById(req: Request, res: Response) {
    try {
      const id = ChatController.extractIdFromUrl(req);
      idParamSchema.parse({ id: id.toString() });
      
      const chatHistory = await ChatService.getChatHistoryById(id);
      
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
      return ChatController.handleError(res, error);
    }
  }

  // PUT /api/chat/:id - Atualizar mensagem de chat
  static async updateChatHistory(req: Request, res: Response) {
    try {
      const id = ChatController.extractIdFromUrl(req);
      idParamSchema.parse({ id: id.toString() });
      
      const validatedData = updateChatHistorySchema.parse(req.body);
      const chatHistory = await ChatService.updateChatHistory(id, validatedData);
      
      return res.status(200).json({
        success: true,
        message: 'Mensagem de chat atualizada com sucesso',
        data: chatHistory
      });
    } catch (error) {
      return ChatController.handleError(res, error);
    }
  }

  // DELETE /api/chat/:id - Deletar mensagem de chat
  static async deleteChatHistory(req: Request, res: Response) {
    try {
      const id = ChatController.extractIdFromUrl(req);
      idParamSchema.parse({ id: id.toString() });
      
      await ChatService.deleteChatHistory(id);
      
      return res.status(200).json({
        success: true,
        message: 'Mensagem de chat deletada com sucesso'
      });
    } catch (error) {
      return ChatController.handleError(res, error);
    }
  }

  // DELETE /api/chat/session/:session_id - Deletar todas as mensagens de uma sessão
  static async deleteChatHistoriesBySessionId(req: Request, res: Response) {
    try {
      const { session_id } = sessionIdParamSchema.parse(req.params);
      
      await ChatService.deleteChatHistoriesBySessionId(session_id);
      
      return res.status(200).json({
        success: true,
        message: 'Todas as mensagens da sessão foram deletadas com sucesso'
      });
    } catch (error) {
      return ChatController.handleError(res, error);
    }
  }
}

export const chatController = new ChatController();