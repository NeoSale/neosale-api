import { Request, Response } from 'express'
import { z } from 'zod'
import { QualificacaoService } from '../services/qualificacaoService'

// Schema para validação de criação de qualificação
const createQualificacaoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  cliente_id: z.string().uuid('Cliente ID deve ser um UUID válido').optional(),
  embedding: z.any().optional()
})

// Schema para validação de atualização de qualificação
const updateQualificacaoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres').optional(),
  cliente_id: z.string().uuid('Cliente ID deve ser um UUID válido').optional()
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
        message: 'Já existe uma qualificação com este nome para este cliente'
      })
    }
    
    if (error.code === '23503') { // Violação de foreign key
      return res.status(400).json({
        success: false,
        message: 'Cliente ID inválido'
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
      const clienteId = req.headers.cliente_id as string
      
      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id é obrigatório no header'
        })
      }
      
      const qualificacoes = await QualificacaoService.listarQualificacoes(clienteId)
      
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
      const clienteId = req.headers.cliente_id as string
      
      // Validar UUID
      const validatedId = uuidSchema.parse(id)
      
      const qualificacao = await QualificacaoService.buscarQualificacaoPorId(validatedId, clienteId)
      
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
      const clienteId = req.headers.cliente_id as string
      
      // Validar dados de entrada
      const validatedData = createQualificacaoSchema.parse(req.body)
      
      // Se não foi fornecido cliente_id no body, usar o do header
      if (!validatedData.cliente_id && clienteId) {
        validatedData.cliente_id = clienteId
      }
      
      const qualificacao = await QualificacaoService.criarQualificacao({
        nome: validatedData.nome,
        cliente_id: validatedData.cliente_id || '',
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
      const clienteId = req.headers.cliente_id as string
      
      // Validar UUID
      const validatedId = uuidSchema.parse(id)
      
      // Validar dados de entrada
      const validatedData = updateQualificacaoSchema.parse(req.body)
      
      // Construir objeto apenas com propriedades definidas
      const updateData: any = {}
      if (validatedData.nome !== undefined) updateData.nome = validatedData.nome
      if (validatedData.cliente_id !== undefined) updateData.cliente_id = validatedData.cliente_id
      
      const qualificacao = await QualificacaoService.atualizarQualificacao(validatedId, updateData, clienteId)
      
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
      const clienteId = req.headers.cliente_id as string
      
      // Validar UUID
      const validatedId = uuidSchema.parse(id)
      
      await QualificacaoService.deletarQualificacao(validatedId, clienteId)
      
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