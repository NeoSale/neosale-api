import { Request, Response } from 'express'
import { LeadDistribuicaoService } from '../services/leadDistribuicaoService'

/**
 * @swagger
 * tags:
 *   name: Lead Atribuições
 *   description: Gerenciamento de atribuições de leads para vendedores
 */
export class LeadAtribuicaoController {
  private static handleError(res: Response, error: any) {
    console.error('❌ Erro no controller:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor',
      error: 'INTERNAL_ERROR'
    })
  }

  /**
   * @swagger
   * /api/leads/atribuicoes:
   *   get:
   *     summary: Listar todas as atribuições de leads
   *     description: Retorna todas as atribuições de leads para vendedores (apenas gerente/admin)
   *     tags: [Lead Atribuições]
   *     parameters:
   *       - in: header
   *         name: cliente_id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [ativo, concluido, transferido, cancelado]
   *       - in: query
   *         name: vendedor_id
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: data_inicio
   *         schema:
   *           type: string
   *           format: date
   *       - in: query
   *         name: data_fim
   *         schema:
   *           type: string
   *           format: date
   *     responses:
   *       200:
   *         description: Lista de atribuições
   */
  static async listarAtribuicoes(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string

      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no header',
          error: 'VALIDATION_ERROR'
        })
      }

      const { status, vendedor_id, data_inicio, data_fim } = req.query

      const atribuicoes = await LeadDistribuicaoService.listarTodasAtribuicoes(
        clienteId,
        {
          status: status as string,
          vendedorId: vendedor_id as string,
          dataInicio: data_inicio as string,
          dataFim: data_fim as string
        }
      )

      return res.status(200).json({
        success: true,
        message: 'Atribuições listadas com sucesso',
        data: atribuicoes
      })
    } catch (error) {
      return LeadAtribuicaoController.handleError(res, error)
    }
  }

  /**
   * @swagger
   * /api/leads/atribuicoes/vendedor/{vendedorId}:
   *   get:
   *     summary: Listar atribuições de um vendedor
   *     description: Retorna os leads atribuídos a um vendedor específico
   *     tags: [Lead Atribuições]
   *     parameters:
   *       - in: path
   *         name: vendedorId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: header
   *         name: cliente_id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [ativo, concluido, transferido]
   *     responses:
   *       200:
   *         description: Lista de atribuições do vendedor
   */
  static async listarAtribuicoesVendedor(req: Request, res: Response) {
    try {
      const { vendedorId } = req.params
      const clienteId = req.headers['cliente_id'] as string
      const { status } = req.query

      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no header',
          error: 'VALIDATION_ERROR'
        })
      }

      if (!vendedorId) {
        return res.status(400).json({
          success: false,
          message: 'vendedorId é obrigatório',
          error: 'VALIDATION_ERROR'
        })
      }

      const atribuicoes = await LeadDistribuicaoService.listarAtribuicoesVendedor(
        vendedorId,
        clienteId,
        status as string
      )

      return res.status(200).json({
        success: true,
        message: 'Atribuições do vendedor listadas com sucesso',
        data: atribuicoes
      })
    } catch (error) {
      return LeadAtribuicaoController.handleError(res, error)
    }
  }

  /**
   * @swagger
   * /api/leads/{leadId}/atribuir:
   *   post:
   *     summary: Atribuir lead a um vendedor manualmente
   *     description: Atribui um lead a um vendedor específico (gerente/admin)
   *     tags: [Lead Atribuições]
   *     parameters:
   *       - in: path
   *         name: leadId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: header
   *         name: cliente_id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - vendedor_id
   *             properties:
   *               vendedor_id:
   *                 type: string
   *                 format: uuid
   *               atribuido_por:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       200:
   *         description: Lead atribuído com sucesso
   *       400:
   *         description: Dados inválidos ou lead já atribuído
   */
  static async atribuirLead(req: Request, res: Response) {
    try {
      const { leadId } = req.params
      const clienteId = req.headers['cliente_id'] as string
      const { vendedor_id, atribuido_por } = req.body

      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no header',
          error: 'VALIDATION_ERROR'
        })
      }

      if (!leadId || !vendedor_id) {
        return res.status(400).json({
          success: false,
          message: 'leadId e vendedor_id são obrigatórios',
          error: 'VALIDATION_ERROR'
        })
      }

      const atribuicao = await LeadDistribuicaoService.atribuirLead(
        leadId,
        vendedor_id,
        clienteId,
        atribuido_por
      )

      if (!atribuicao) {
        return res.status(400).json({
          success: false,
          message: 'Lead já possui atribuição ativa',
          error: 'ALREADY_ASSIGNED'
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Lead atribuído com sucesso',
        data: atribuicao
      })
    } catch (error) {
      return LeadAtribuicaoController.handleError(res, error)
    }
  }

  /**
   * @swagger
   * /api/leads/{leadId}/transferir:
   *   put:
   *     summary: Transferir lead para outro vendedor
   *     description: Transfere um lead de um vendedor para outro (gerente/admin)
   *     tags: [Lead Atribuições]
   *     parameters:
   *       - in: path
   *         name: leadId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: header
   *         name: cliente_id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - novo_vendedor_id
   *               - transferido_por
   *             properties:
   *               novo_vendedor_id:
   *                 type: string
   *                 format: uuid
   *               transferido_por:
   *                 type: string
   *                 format: uuid
   *               motivo:
   *                 type: string
   *     responses:
   *       200:
   *         description: Lead transferido com sucesso
   */
  static async transferirLead(req: Request, res: Response) {
    try {
      const { leadId } = req.params
      const clienteId = req.headers['cliente_id'] as string
      const { novo_vendedor_id, transferido_por, motivo } = req.body

      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no header',
          error: 'VALIDATION_ERROR'
        })
      }

      if (!leadId || !novo_vendedor_id || !transferido_por) {
        return res.status(400).json({
          success: false,
          message: 'leadId, novo_vendedor_id e transferido_por são obrigatórios',
          error: 'VALIDATION_ERROR'
        })
      }

      const atribuicao = await LeadDistribuicaoService.transferirLead(
        leadId,
        novo_vendedor_id,
        clienteId,
        transferido_por,
        motivo
      )

      return res.status(200).json({
        success: true,
        message: 'Lead transferido com sucesso',
        data: atribuicao
      })
    } catch (error) {
      return LeadAtribuicaoController.handleError(res, error)
    }
  }

  /**
   * @swagger
   * /api/leads/{leadId}/concluir:
   *   put:
   *     summary: Concluir atribuição de lead
   *     description: Marca a atribuição como concluída (venda fechada ou perdida)
   *     tags: [Lead Atribuições]
   *     parameters:
   *       - in: path
   *         name: leadId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: header
   *         name: cliente_id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               sucesso:
   *                 type: boolean
   *                 default: true
   *     responses:
   *       200:
   *         description: Atribuição concluída
   */
  static async concluirAtribuicao(req: Request, res: Response) {
    try {
      const { leadId } = req.params
      const clienteId = req.headers['cliente_id'] as string
      const { sucesso = true } = req.body

      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no header',
          error: 'VALIDATION_ERROR'
        })
      }

      const resultado = await LeadDistribuicaoService.concluirAtribuicao(
        leadId,
        clienteId,
        sucesso
      )

      if (!resultado) {
        return res.status(404).json({
          success: false,
          message: 'Nenhuma atribuição ativa encontrada para este lead',
          error: 'NOT_FOUND'
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Atribuição concluída com sucesso'
      })
    } catch (error) {
      return LeadAtribuicaoController.handleError(res, error)
    }
  }

  /**
   * @swagger
   * /api/vendedores/carga:
   *   get:
   *     summary: Dashboard de carga por vendedor
   *     description: Retorna a carga de leads ativos por vendedor
   *     tags: [Lead Atribuições]
   *     parameters:
   *       - in: header
   *         name: cliente_id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Dashboard de carga
   */
  static async dashboardCarga(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string

      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no header',
          error: 'VALIDATION_ERROR'
        })
      }

      const dashboard = await LeadDistribuicaoService.dashboardCargaVendedores(clienteId)

      return res.status(200).json({
        success: true,
        message: 'Dashboard carregado com sucesso',
        data: dashboard
      })
    } catch (error) {
      return LeadAtribuicaoController.handleError(res, error)
    }
  }

  /**
   * @swagger
   * /api/leads/fila/processar:
   *   post:
   *     summary: Processar fila de espera
   *     description: Processa leads na fila de espera e distribui para vendedores disponíveis
   *     tags: [Lead Atribuições]
   *     parameters:
   *       - in: header
   *         name: cliente_id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Fila processada
   */
  static async processarFila(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string

      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no header',
          error: 'VALIDATION_ERROR'
        })
      }

      const processados = await LeadDistribuicaoService.processarFilaEspera(clienteId)

      return res.status(200).json({
        success: true,
        message: `${processados} leads processados da fila`,
        data: { processados }
      })
    } catch (error) {
      return LeadAtribuicaoController.handleError(res, error)
    }
  }

  /**
   * @swagger
   * /api/leads/{leadId}/distribuir:
   *   post:
   *     summary: Distribuir lead automaticamente
   *     description: Distribui um lead para o próximo vendedor disponível (round-robin)
   *     tags: [Lead Atribuições]
   *     parameters:
   *       - in: path
   *         name: leadId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: header
   *         name: cliente_id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Lead distribuído
   */
  static async distribuirLead(req: Request, res: Response) {
    try {
      const { leadId } = req.params
      const clienteId = req.headers['cliente_id'] as string

      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no header',
          error: 'VALIDATION_ERROR'
        })
      }

      if (!leadId) {
        return res.status(400).json({
          success: false,
          message: 'leadId é obrigatório',
          error: 'VALIDATION_ERROR'
        })
      }

      const resultado = await LeadDistribuicaoService.distribuirLeadDecidido({
        id: leadId,
        nome: '',
        telefone: '',
        cliente_id: clienteId
      })

      if (!resultado.sucesso) {
        return res.status(400).json({
          success: false,
          message: 'Não foi possível distribuir o lead',
          error: 'DISTRIBUTION_FAILED'
        })
      }

      if (resultado.naFila) {
        return res.status(200).json({
          success: true,
          message: 'Lead adicionado à fila de espera (sem vendedor disponível)',
          data: { na_fila: true }
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Lead distribuído com sucesso',
        data: {
          vendedor: resultado.vendedor,
          atribuicao: resultado.atribuicao
        }
      })
    } catch (error) {
      return LeadAtribuicaoController.handleError(res, error)
    }
  }
}
