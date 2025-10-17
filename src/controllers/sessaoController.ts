import { Request, Response } from 'express';
import { SessaoService } from '../services/sessaoService';

export class SessaoController {
  static async getMinhasSessoes(req: Request, res: Response) {
    try {
      // @ts-ignore - req.user é adicionado pelo middleware de autenticação
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      const sessoes = await SessaoService.getByUsuario(usuarioId);

      return res.json({
        success: true,
        data: sessoes,
        total: sessoes.length
      });
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      const sessao = await SessaoService.getById(id);

      if (!sessao) {
        return res.status(404).json({
          success: false,
          message: 'Sessão não encontrada'
        });
      }

      // @ts-ignore - req.user é adicionado pelo middleware de autenticação
      const usuarioId = req.user?.id;

      // Verificar se a sessão pertence ao usuário autenticado
      if (sessao.usuario_id !== usuarioId) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      return res.json({
        success: true,
        data: sessao
      });
    } catch (error) {
      console.error('Erro ao buscar sessão:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async encerrar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      const sessao = await SessaoService.getById(id);

      if (!sessao) {
        return res.status(404).json({
          success: false,
          message: 'Sessão não encontrada'
        });
      }

      // @ts-ignore - req.user é adicionado pelo middleware de autenticação
      const usuarioId = req.user?.id;

      // Verificar se a sessão pertence ao usuário autenticado
      if (sessao.usuario_id !== usuarioId) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      await SessaoService.encerrar(id);

      return res.json({
        success: true,
        message: 'Sessão encerrada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async encerrarTodas(req: Request, res: Response) {
    try {
      // @ts-ignore - req.user é adicionado pelo middleware de autenticação
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      await SessaoService.encerrarTodasDoUsuario(usuarioId);

      return res.json({
        success: true,
        message: 'Todas as sessões foram encerradas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao encerrar todas as sessões:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async limparExpiradas(req: Request, res: Response) {
    try {
      const count = await SessaoService.limparExpiradas();

      return res.json({
        success: true,
        data: { count },
        message: `${count} sessão(ões) expirada(s) limpa(s)`
      });
    } catch (error) {
      console.error('Erro ao limpar sessões expiradas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}
