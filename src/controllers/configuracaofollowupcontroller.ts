import { Request, Response } from 'express'
import { ConfiguracaoFollowupService } from '../services/configuracaofollowupservice'
import { createConfiguracaoFollowupSchema, updateConfiguracaoFollowupSchema, idParamSchema } from '../lib/validators'
import { z } from 'zod'

export class ConfiguracaoFollowupController {
  static async getAll(req: Request, res: Response) {
    try {
      const cliente_id = req.headers['cliente_id'] as string;
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no cabeçalho da requisição'
        });
      }
      
      // Validar se cliente_id é um UUID válido
      try {
        z.string().uuid().parse(cliente_id);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'cliente_id deve ser um UUID válido'
        });
      }
      
      const configuracao = await ConfiguracaoFollowupService.getByClienteId(cliente_id)
      
      if (!configuracao) {
        return res.status(404).json({
          success: false,
          message: 'Configuração de follow-up não encontrada para este cliente'
        })
      }
      
      return res.json({
        success: true,
        data: configuracao,
        message: 'Configuração de follow-up recuperada com sucesso'
      })
    } catch (error) {
      console.error('Erro ao buscar configuração de follow-up:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params)
      
      const configuracao = await ConfiguracaoFollowupService.getById(id)
      
      if (!configuracao) {
        return res.status(404).json({
          success: false,
          message: 'Configuração de follow-up não encontrada'
        })
      }

      return res.json({
        success: true,
        data: configuracao,
        message: 'Configuração de follow-up recuperada com sucesso'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados de entrada inválidos',
          errors: error.errors
        })
      }

      console.error('Erro ao buscar configuração de follow-up por ID:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }



  static async create(req: Request, res: Response) {
    try {
      const validatedData = createConfiguracaoFollowupSchema.parse(req.body)
      
      const novaConfiguracao = await ConfiguracaoFollowupService.create(validatedData)
      
      return res.status(201).json({
        success: true,
        data: novaConfiguracao,
        message: 'Configuração de follow-up criada com sucesso'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados de entrada inválidos',
          errors: error.errors
        })
      }

      console.error('Erro ao criar configuração de follow-up:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params)
      const validatedData = updateConfiguracaoFollowupSchema.parse(req.body)
      
      const configuracaoAtualizada = await ConfiguracaoFollowupService.update(id, validatedData)
      
      return res.json({
        success: true,
        data: configuracaoAtualizada,
        message: 'Configuração de follow-up atualizada com sucesso'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados de entrada inválidos',
          errors: error.errors
        })
      }

      console.error('Erro ao atualizar configuração de follow-up:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }


  static async getByAtivo(req: Request, res: Response) {
    try {
      const { ativo } = req.query;
      
      if (ativo === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetro ativo é obrigatório'
        });
      }
      
      // Converter string para boolean
      const ativoBoolean = ativo === 'true';
      
      const configuracoes = await ConfiguracaoFollowupService.getByAtivo(ativoBoolean);
      
      return res.json({
        success: true,
        data: configuracoes,
        message: `Configurações de follow-up ${ativoBoolean ? 'ativas' : 'inativas'} recuperadas com sucesso`
      });
    } catch (error) {
      console.error('Erro ao buscar configurações por status ativo:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async updateById(req: Request, res: Response) {
    try {
      const { id } = idParamSchema.parse(req.params)
      const validatedData = updateConfiguracaoFollowupSchema.parse(req.body)
      const cliente_id = req.headers['cliente_id'] as string
      
      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no cabeçalho da requisição'
        })
      }
      
      // Validar se cliente_id é um UUID válido
      try {
        z.string().uuid().parse(cliente_id)
      } catch {
        return res.status(400).json({
          success: false,
          message: 'cliente_id deve ser um UUID válido'
        })
      }
      
      // Remove cliente_id from update data since it's passed as a separate parameter
      const { cliente_id: _, ...updateData } = validatedData
      
      const configuracaoAtualizada = await ConfiguracaoFollowupService.updateById(id, cliente_id, updateData)
      
      return res.json({
        success: true,
        data: configuracaoAtualizada,
        message: 'Configuração de follow-up atualizada com sucesso'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados de entrada inválidos',
          errors: error.errors
        })
      }
      
      console.error('Erro ao atualizar configuração de follow-up:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }
}