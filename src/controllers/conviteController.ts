import { Request, Response } from 'express';
import { ConviteService } from '../services/conviteService';

export class ConviteController {
  static async getAll(req: Request, res: Response) {
    try {
      // @ts-ignore - req.user é adicionado pelo middleware de autenticação
      const usuarioId = req.user?.id;
      
      const convites = await ConviteService.getAll(usuarioId);
      
      return res.json({
        success: true,
        data: convites,
        total: convites.length
      });
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
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

      const convite = await ConviteService.getById(id);

      if (!convite) {
        return res.status(404).json({
          success: false,
          message: 'Convite não encontrado'
        });
      }

      return res.json({
        success: true,
        data: convite
      });
    } catch (error) {
      console.error('Erro ao buscar convite:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async validarToken(req: Request, res: Response) {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token é obrigatório'
        });
      }

      const resultado = await ConviteService.validarToken(token);

      if (!resultado.valido) {
        return res.status(400).json({
          success: false,
          message: resultado.mensagem,
          data: resultado.convite
        });
      }

      return res.json({
        success: true,
        data: resultado.convite,
        message: 'Convite válido'
      });
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { email, telefone, nome, perfil_id, tipo_acesso_id, cliente_id, revendedor_id, mensagem_personalizada, dias_expiracao, convidado_por } = req.body;

      // @ts-ignore - req.user é adicionado pelo middleware de autenticação
      const convidadoPor = req.user?.id || convidado_por;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email é obrigatório'
        });
      }

      if (!convidadoPor) {
        return res.status(400).json({
          success: false,
          message: 'Campo "convidado_por" é obrigatório (UUID do usuário que está convidando)'
        });
      }

      const convite = await ConviteService.create({
        email,
        telefone,
        nome,
        perfil_id,
        tipo_acesso_id,
        cliente_id,
        revendedor_id,
        convidado_por: convidadoPor,
        mensagem_personalizada,
        dias_expiracao
      });

      // Gerar link do convite
      const link = ConviteService.gerarLinkConvite(convite.token);

      return res.status(201).json({
        success: true,
        data: {
          ...convite,
          link
        },
        message: 'Convite criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar convite:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async aceitar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { usuario_criado_id } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      if (!usuario_criado_id) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário criado é obrigatório'
        });
      }

      const convite = await ConviteService.aceitar(id, usuario_criado_id);

      return res.json({
        success: true,
        data: convite,
        message: 'Convite aceito com sucesso'
      });
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async cancelar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      const convite = await ConviteService.getById(id);
      if (!convite) {
        return res.status(404).json({
          success: false,
          message: 'Convite não encontrado'
        });
      }

      await ConviteService.cancelar(id);

      return res.json({
        success: true,
        message: 'Convite cancelado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao cancelar convite:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async reenviar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      const convite = await ConviteService.getById(id);
      if (!convite) {
        return res.status(404).json({
          success: false,
          message: 'Convite não encontrado'
        });
      }

      if (convite.status !== 'pendente') {
        return res.status(400).json({
          success: false,
          message: 'Apenas convites pendentes podem ser reenviados'
        });
      }

      // Gerar link do convite
      const link = ConviteService.gerarLinkConvite(convite.token);

      // TODO: Implementar envio de email e WhatsApp aqui
      // await EmailService.enviarConvite(convite, link);
      // await WhatsAppService.enviarConvite(convite, link);

      return res.json({
        success: true,
        data: {
          ...convite,
          link
        },
        message: 'Convite reenviado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao reenviar convite:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async limparExpirados(req: Request, res: Response) {
    try {
      const count = await ConviteService.limparExpirados();

      return res.json({
        success: true,
        data: { count },
        message: `${count} convite(s) expirado(s) limpo(s)`
      });
    } catch (error) {
      console.error('Erro ao limpar convites expirados:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}
