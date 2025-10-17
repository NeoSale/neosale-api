import { Request, Response } from 'express';
import { UsuarioService } from '../services/usuarioService';
import { 
  createUsuarioSchema, 
  updateUsuarioSchema,
  updateUsuarioComRelacionamentosSchema,
  createUsuarioRevendedorSchema,
  createUsuarioClienteSchema,
  createUsuarioPermissaoSistemaSchema
} from '../lib/validators';

export class UsuarioController {
  static async getAll(req: Request, res: Response) {
    try {
      const usuarios = await UsuarioService.getAll();
      return res.json({
        success: true,
        data: usuarios,
        total: usuarios.length
      });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
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

      const usuario = await UsuarioService.getById(id);
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      return res.json({
        success: true,
        data: usuario
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email é obrigatório'
        });
      }

      const usuario = await UsuarioService.getByEmail(email);
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      return res.json({
        success: true,
        data: usuario
      });
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }



  static async getAtivos(req: Request, res: Response) {
    try {
      const usuarios = await UsuarioService.getAtivos();
      
      return res.json({
        success: true,
        data: usuarios,
        total: usuarios.length
      });
    } catch (error) {
      console.error('Erro ao buscar usuários ativos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      // Validar dados de entrada
      const validationResult = createUsuarioSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const { email, telefone } = validationResult.data;

      // Verificar se já existe um usuário com o mesmo email
      const existingUsuario = await UsuarioService.getByEmail(email);
      if (existingUsuario) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um usuário com este email'
        });
      }

      // Verificar se já existe um usuário com o mesmo telefone
      if (telefone) {
        const existingUsuarioByTelefone = await UsuarioService.getByTelefone(telefone);
        if (existingUsuarioByTelefone) {
          return res.status(409).json({
            success: false,
            message: 'Já existe um usuário com este telefone'
          });
        }
      }

      const usuario = await UsuarioService.create(validationResult.data);
      
      return res.status(201).json({
        success: true,
        data: usuario,
        message: 'Usuário criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      // Validar dados de entrada
      const validationResult = updateUsuarioSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const updateData = validationResult.data;

      // Verificar se o usuário existe
      const existingUsuario = await UsuarioService.getById(id);
      if (!existingUsuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Se está atualizando o email, verificar se não existe outro usuário com o mesmo email
      if (updateData.email && updateData.email !== existingUsuario.email) {
        const usuarioWithSameEmail = await UsuarioService.getByEmail(updateData.email);
        if (usuarioWithSameEmail) {
          return res.status(409).json({
            success: false,
            message: 'Já existe um usuário com este email'
          });
        }
      }

      const usuario = await UsuarioService.update(id, updateData);
      
      return res.json({
        success: true,
        data: usuario,
        message: 'Usuário atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      // Verificar se o usuário existe
      const existingUsuario = await UsuarioService.getById(id);
      if (!existingUsuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      await UsuarioService.delete(id);
      
      return res.json({
        success: true,
        message: 'Usuário deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Novos endpoints para relacionamentos múltiplos
  static async getUsuarioComRelacionamentos(req: Request, res: Response) {
    try {
      const { id, cliente_id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório'
        });
      }

      const usuario = await UsuarioService.getUsuarioComRelacionamentos(id, cliente_id);
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      return res.json({
        success: true,
        data: usuario
      });
    } catch (error) {
      console.error('Erro ao buscar usuário com relacionamentos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async updateComRelacionamentos(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID é obrigatório'
        });
      }

      // Validar dados de entrada
      const validation = updateUsuarioComRelacionamentosSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validation.error.errors
        });
      }

      // Verificar se o usuário existe
      const existingUsuario = await UsuarioService.getById(id);
      if (!existingUsuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      const usuario = await UsuarioService.updateComRelacionamentos(id, validation.data);
      
      return res.json({
        success: true,
        data: usuario,
        message: 'Usuário e relacionamentos atualizados com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário com relacionamentos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Endpoints para verificar acesso
  static async verificarAcessoRevendedor(req: Request, res: Response) {
    try {
      const { usuarioId, revendedorId } = req.params;
      
      if (!usuarioId || !revendedorId) {
        return res.status(400).json({
          success: false,
          message: 'usuarioId e revendedorId são obrigatórios'
        });
      }

      const temAcesso = await UsuarioService.verificarAcessoRevendedor(usuarioId, revendedorId);
      
      return res.json({
        success: true,
        data: { temAcesso }
      });
    } catch (error) {
      console.error('Erro ao verificar acesso ao revendedor:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async verificarAcessoCliente(req: Request, res: Response) {
    try {
      const { usuarioId, clienteId } = req.params;
      
      if (!usuarioId || !clienteId) {
        return res.status(400).json({
          success: false,
          message: 'usuarioId e clienteId são obrigatórios'
        });
      }

      const temAcesso = await UsuarioService.verificarAcessoCliente(usuarioId, clienteId);
      
      return res.json({
        success: true,
        data: { temAcesso }
      });
    } catch (error) {
      console.error('Erro ao verificar acesso ao cliente:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async verificarPermissaoSistema(req: Request, res: Response) {
    try {
      const { usuarioId, permissao } = req.params;
      
      if (!usuarioId || !permissao) {
        return res.status(400).json({
          success: false,
          message: 'usuarioId e permissao são obrigatórios'
        });
      }

      const temPermissao = await UsuarioService.verificarPermissaoSistema(usuarioId, permissao);
      
      return res.json({
        success: true,
        data: { temPermissao }
      });
    } catch (error) {
      console.error('Erro ao verificar permissão do sistema:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async isAdmin(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;
      
      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: 'usuarioId é obrigatório'
        });
      }

      const isAdmin = await UsuarioService.isAdmin(usuarioId);
      
      return res.json({
        success: true,
        data: { isAdmin }
      });
    } catch (error) {
      console.error('Erro ao verificar se usuário é admin:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Endpoints para gerenciar relacionamentos individuais
  static async adicionarRevendedor(req: Request, res: Response) {
    try {
      // Validar dados de entrada
      const validation = createUsuarioRevendedorSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validation.error.errors
        });
      }

      const relacionamento = await UsuarioService.adicionarRevendedor(validation.data);
      
      return res.status(201).json({
        success: true,
        data: relacionamento,
        message: 'Revendedor adicionado ao usuário com sucesso'
      });
    } catch (error) {
      console.error('Erro ao adicionar revendedor ao usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async adicionarCliente(req: Request, res: Response) {
    try {
      // Validar dados de entrada
      const validation = createUsuarioClienteSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validation.error.errors
        });
      }

      const relacionamento = await UsuarioService.adicionarCliente(validation.data);
      
      return res.status(201).json({
        success: true,
        data: relacionamento,
        message: 'Cliente adicionado ao usuário com sucesso'
      });
    } catch (error) {
      console.error('Erro ao adicionar cliente ao usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async adicionarPermissaoSistema(req: Request, res: Response) {
    try {
      // Validar dados de entrada
      const validation = createUsuarioPermissaoSistemaSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validation.error.errors
        });
      }

      const relacionamento = await UsuarioService.adicionarPermissaoSistema(validation.data);
      
      return res.status(201).json({
        success: true,
        data: relacionamento,
        message: 'Permissão do sistema adicionada ao usuário com sucesso'
      });
    } catch (error) {
      console.error('Erro ao adicionar permissão do sistema ao usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async removerRevendedor(req: Request, res: Response) {
    try {
      const { usuarioId, revendedorId } = req.params;
      
      if (!usuarioId || !revendedorId) {
        return res.status(400).json({
          success: false,
          message: 'usuarioId e revendedorId são obrigatórios'
        });
      }

      await UsuarioService.removerRevendedor(usuarioId, revendedorId);
      
      return res.json({
        success: true,
        message: 'Revendedor removido do usuário com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover revendedor do usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async removerCliente(req: Request, res: Response) {
    try {
      const { usuarioId, clienteId } = req.params;
      
      if (!usuarioId || !clienteId) {
        return res.status(400).json({
          success: false,
          message: 'usuarioId e clienteId são obrigatórios'
        });
      }

      await UsuarioService.removerCliente(usuarioId, clienteId);
      
      return res.json({
        success: true,
        message: 'Cliente removido do usuário com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover cliente do usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async removerPermissaoSistema(req: Request, res: Response) {
    try {
      const { usuarioId, permissao } = req.params;
      
      if (!usuarioId || !permissao) {
        return res.status(400).json({
          success: false,
          message: 'usuarioId e permissao são obrigatórios'
        });
      }

      await UsuarioService.removerPermissaoSistema(usuarioId, permissao);
      
      return res.json({
        success: true,
        message: 'Permissão do sistema removida do usuário com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover permissão do sistema do usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}