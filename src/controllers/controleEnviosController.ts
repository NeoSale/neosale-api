import { Request, Response } from 'express'
import { ControleEnviosService } from '../services/controleEnviosService'
import { ZodError } from 'zod'
import { createError } from '../middleware/errorHandler'

export class ControleEnviosController {
  // Utilitário para tratamento de erros
  private static handleError(res: Response, error: any) {
    console.error('❌ Erro no controller:', error)
    
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      })
    }
    
    if (error.code === 'PGRST301') {
      return res.status(404).json({
        success: false,
        error: 'Registro não encontrado'
      })
    }
    
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    })
  }
  
  // GET /api/controle-envios - Buscar todos os registros
  static async getAllControleEnvios(req: Request, res: Response) {
    try {
      console.log('📋 GET /api/controle-envios - Buscando todos os registros')
      
      const controleEnvios = await ControleEnviosService.getAllControleEnvios()
      
      return res.json({
        success: true,
        data: controleEnvios,
        total: controleEnvios.length,
        message: 'Registros de controle de envios encontrados com sucesso'
      })
    } catch (error) {
      return ControleEnviosController.handleError(res, error)
    }
  }
  
  // GET /api/controle-envios/:data - Buscar por data específica
  static async getControleEnvioByDate(req: Request, res: Response) {
    try {
      const { data } = req.params
      
      console.log('📋 GET /api/controle-envios/:data - Buscando por data:', data)
      
      // Validar formato da data (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(data)) {
        return res.status(400).json({
          success: false,
          error: 'Formato de data inválido. Use YYYY-MM-DD'
        })
      }
      
      // Validar se é uma data válida
      const dataObj = new Date(data + 'T00:00:00.000Z')
      if (isNaN(dataObj.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Data inválida'
        })
      }
      
      const controleEnvio = await ControleEnviosService.getControleEnvioByDate(data)
      
      return res.json({
        success: true,
        data: controleEnvio,
        message: 'Controle de envio encontrado com sucesso'
      })
    } catch (error) {
      return ControleEnviosController.handleError(res, error)
    }
  }
  
  // GET /api/controle-envios/:data/status - Verificar se pode enviar mensagem
  static async getStatusEnvio(req: Request, res: Response) {
    try {
      const { data } = req.params
      
      console.log('📋 GET /api/controle-envios/:data/status - Verificando status para data:', data)
      
      // Validar formato da data (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(data)) {
        return res.status(400).json({
          success: false,
          error: 'Formato de data inválido. Use YYYY-MM-DD'
        })
      }
      
      const status = await ControleEnviosService.podeEnviarMensagem(data)
      
      return res.json({
        success: true,
        data: status,
        message: 'Status de envio verificado com sucesso'
      })
    } catch (error) {
      return ControleEnviosController.handleError(res, error)
    }
  }
  
  // POST /api/controle-envios/:data/incrementar - Incrementar quantidade enviada
  static async incrementarQuantidade(req: Request, res: Response) {
    try {
      const { data } = req.params
      const { incremento = 1 } = req.body
      
      console.log('📋 POST /api/controle-envios/:data/incrementar - Data:', data, 'Incremento:', incremento)
      
      // Validar formato da data
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(data)) {
        return res.status(400).json({
          success: false,
          error: 'Formato de data inválido. Use YYYY-MM-DD'
        })
      }
      
      // Validar incremento
      if (typeof incremento !== 'number' || incremento < 1) {
        return res.status(400).json({
          success: false,
          error: 'Incremento deve ser um número positivo'
        })
      }
      
      const controleAtualizado = await ControleEnviosService.incrementarQuantidadeEnviada(data, incremento)
      
      return res.json({
        success: true,
        data: controleAtualizado,
        message: 'Quantidade enviada incrementada com sucesso'
      })
    } catch (error) {
      return ControleEnviosController.handleError(res, error)
    }
  }
  
  // GET /api/controle-envios/hoje - Buscar controle de hoje
  static async getControleEnvioHoje(req: Request, res: Response) {
    try {
      // Obter data atual no fuso horário do Brasil (formato pt-BR)
      const agora = new Date()
      const brasilTime = agora.toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo", year: 'numeric', month: '2-digit', day: '2-digit'})
      const hoje = brasilTime.split('/').reverse().join('-') // YYYY-MM-DD
      
      console.log('📋 GET /api/controle-envios/hoje - Buscando controle para hoje (Brasil):', hoje)
      
      const controleEnvio = await ControleEnviosService.getControleEnvioByDate(hoje)
      
      return res.json({
        success: true,
        data: controleEnvio,
        message: 'Controle de envio de hoje encontrado com sucesso'
      })
    } catch (error) {
      return ControleEnviosController.handleError(res, error)
    }
  }

  // PUT /api/controle-envios/hoje/quantidade - Alterar quantidade enviada de hoje
  static async alterarQuantidadeEnviadaHoje(req: Request, res: Response) {
    try {
      const { quantidade } = req.body
      
      console.log('📋 PUT /api/controle-envios/hoje/quantidade - Alterando quantidade para:', quantidade)
      
      // Validar quantidade
      if (typeof quantidade !== 'number' || quantidade < 0) {
        return res.status(400).json({
          success: false,
          error: 'A quantidade deve ser um número não negativo'
        })
      }
      
      // Obter data atual no fuso horário do Brasil
      const agora = new Date()
      const brasilTime = agora.toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo", year: 'numeric', month: '2-digit', day: '2-digit'})
      const hoje = brasilTime.split('/').reverse().join('-') // YYYY-MM-DD
      
      const controleAtualizado = await ControleEnviosService.alterarQuantidadeEnviada(hoje, quantidade)
      
      return res.json({
        success: true,
        data: controleAtualizado,
        message: 'Quantidade enviada de hoje alterada com sucesso'
      })
    } catch (error) {
      return ControleEnviosController.handleError(res, error)
    }
  }

  // PUT /api/controle-envios/limite-diario - Alterar limite diário de hoje
  static async alterarLimiteDiario(req: Request, res: Response) {
    try {
      const { limite } = req.body
      
      console.log('📋 PUT /api/controle-envios/limite-diario - Alterando limite para:', limite)
      
      // Validar limite
      if (typeof limite !== 'number' || limite < 0) {
        return res.status(400).json({
          success: false,
          error: 'O limite deve ser um número não negativo'
        })
      }
      
      const controleAtualizado = await ControleEnviosService.alterarLimiteDiario(limite)
      
      return res.json({
        success: true,
        data: controleAtualizado,
        message: 'Limite diário alterado com sucesso'
      })
    } catch (error) {
      return ControleEnviosController.handleError(res, error)
    }
  }
}