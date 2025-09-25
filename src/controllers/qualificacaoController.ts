import { Request, Response } from 'express'
import { z } from 'zod'
import { QualificacaoService } from '../services/qualificacaoService'

// Schema para validação de criação de qualificação
const createQualificacaoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  tipo_agente: z.array(z.string()).min(1, 'Pelo menos um tipo de agente é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  embedding: z.any().optional()
})

// Schema para validação de atualização de qualificação
const updateQualificacaoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres').optional(),
  tipo_agente: z.array(z.string()).min(1, 'Pelo menos um tipo de agente é obrigatório').optional(),
  descricao: z.string().min(1, 'Descrição é obrigatória').optional()
})

// Schema para validação de parâmetros UUID
const uuidSchema = z.string().uuid('ID deve ser um UUID válido')

export class QualificacaoController {
  // Método utilitário para extrair ID da URL
  private static extractIdFromUrl(url: string): string {
    const parts = url.split('/')
    return parts[parts.length - 1]
  }

  // Método utilitário para tratamento de erros
  private static handleError(res: Response, error: any, defaultMessage: string) {
    console.error('❌ Erro no controller:', error)
    
    if (error.message === 'Qualificação não encontrada') {
      return res.status(404).json({
        success: false,
        message: 'Qualificação não encontrada'
      })
    }
    
    if (error.code === '23505') { // Violação de constraint unique
      return res.status(409).json({
        success: false,
        message: 'Já existe uma qualificação com este nome'
      })
    }
    
    if (error.code === '23503') { // Violação de foreign key
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos'
      })
    }
    
    return res.status(500).json({
      success: false,
      message: defaultMessage,
      error: error.message
    })
  }

  // Listar qualificações
  static async listarQualificacoes(req: Request, res: Response) {
    try {
      const qualificacoes = await QualificacaoService.listarQualificacoes()
      
      return res.status(200).json({
        success: true,
        message: 'Qualificações listadas com sucesso',
        data: qualificacoes
      })
      
    } catch (error: any) {
      return QualificacaoController.handleError(res, error, 'Erro interno do servidor')
    }
  }

  // Buscar qualificação por ID
  static async buscarQualificacaoPorId(req: Request, res: Response) {
    try {
      const id = QualificacaoController.extractIdFromUrl(req.url)
      
      // Validar UUID
      const validatedId = uuidSchema.parse(id)
      
      const qualificacao = await QualificacaoService.buscarQualificacaoPorId(validatedId)
      
      if (!qualificacao) {
        return res.status(404).json({
          success: false,
          message: 'Qualificação não encontrada'
        })
      }
      
      return res.status(200).json({
        success: true,
        data: qualificacao
      })
      
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors
        })
      }
      
      return QualificacaoController.handleError(res, error, 'Erro interno do servidor')
    }
  }

  // Criar nova qualificação
  static async criarQualificacao(req: Request, res: Response) {
    try {
      // Validar dados de entrada
      const validatedData = createQualificacaoSchema.parse(req.body)
      
      const qualificacao = await QualificacaoService.criarQualificacao({
        nome: validatedData.nome,
        tipo_agente: validatedData.tipo_agente,
        descricao: validatedData.descricao,
        embedding: validatedData.embedding
      })
      
      return res.status(201).json({
        success: true,
        message: 'Qualificação criada com sucesso',
        data: qualificacao
      })
      
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors
        })
      }
      
      return QualificacaoController.handleError(res, error, 'Erro interno do servidor')
    }
  }

  // Atualizar qualificação
  static async atualizarQualificacao(req: Request, res: Response) {
    try {
      const id = QualificacaoController.extractIdFromUrl(req.url)
      
      // Validar UUID
      const validatedId = uuidSchema.parse(id)
      
      // Validar dados de entrada
      const validatedData = updateQualificacaoSchema.parse(req.body)
      
      // Construir objeto apenas com propriedades definidas
      const updateData: any = {}
      if (validatedData.nome !== undefined) updateData.nome = validatedData.nome
      if (validatedData.tipo_agente !== undefined) updateData.tipo_agente = validatedData.tipo_agente
      if (validatedData.descricao !== undefined) updateData.descricao = validatedData.descricao
      
      const qualificacao = await QualificacaoService.atualizarQualificacao(validatedId, updateData)
      
      return res.status(200).json({
        success: true,
        message: 'Qualificação atualizada com sucesso',
        data: qualificacao
      })
      
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors
        })
      }
      
      return QualificacaoController.handleError(res, error, 'Erro interno do servidor')
    }
  }

  // Deletar qualificação
  static async deletarQualificacao(req: Request, res: Response) {
    try {
      const id = QualificacaoController.extractIdFromUrl(req.url)
      
      // Validar UUID
      const validatedId = uuidSchema.parse(id)
      
      await QualificacaoService.deletarQualificacao(validatedId)
      
      return res.status(200).json({
        success: true,
        message: 'Qualificação deletada com sucesso'
      })
      
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors
        })
      }
      
      return QualificacaoController.handleError(res, error, 'Erro interno do servidor')
    }
  }
}