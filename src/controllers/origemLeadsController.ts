import { Request, Response } from 'express'
import { z } from 'zod'
import { OrigemLeadsService } from '../services/origemLeadsService'

// Schema para validação de criação de origem
const createOrigemSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  cliente_id: z.string().uuid('Cliente ID deve ser um UUID válido').optional(),
  embedding: z.any().optional()
})

// Schema para validação de atualização de origem
const updateOrigemSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres').optional(),
  cliente_id: z.string().uuid('Cliente ID deve ser um UUID válido').optional()
})

// Schema para validação de parâmetros UUID
const uuidSchema = z.string().uuid('ID deve ser um UUID válido')

export class OrigemLeadsController {
  // Método utilitário para extrair ID da URL
  private static extractIdFromUrl(url: string): string {
    const parts = url.split('/')
    return parts[parts.length - 1]
  }

  // Método utilitário para tratamento de erros
  private static handleError(res: Response, error: any, defaultMessage: string) {
    console.error('❌ Erro no controller:', error)
    
    if (error.message === 'Origem não encontrada') {
      return res.status(404).json({
        success: false,
        message: 'Origem não encontrada'
      })
    }
    
    if (error.code === '23505') { // Violação de constraint unique
      return res.status(409).json({
        success: false,
        message: 'Já existe uma origem com este nome'
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

  // Listar todas as origens
  static async listarOrigens(req: Request, res: Response) {
    try {
      const clienteId = req.headers.cliente_id as string
      
      const origens = await OrigemLeadsService.listarOrigens(clienteId)
      
      return res.status(200).json({
        success: true,
        data: origens,
        total: origens.length
      })
      
    } catch (error: any) {
      return OrigemLeadsController.handleError(res, error, 'Erro interno do servidor')
    }
  }

  // Buscar origem por ID
  static async buscarOrigemPorId(req: Request, res: Response) {
    try {
      const id = OrigemLeadsController.extractIdFromUrl(req.url)
      const clienteId = req.headers.cliente_id as string
      
      // Validar UUID
      const validatedId = uuidSchema.parse(id)
      
      const origem = await OrigemLeadsService.buscarOrigemPorId(validatedId, clienteId)
      
      if (!origem) {
        return res.status(404).json({
          success: false,
          message: 'Origem não encontrada'
        })
      }
      
      return res.status(200).json({
        success: true,
        data: origem
      })
      
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors
        })
      }
      
      return OrigemLeadsController.handleError(res, error, 'Erro interno do servidor')
    }
  }

  // Criar nova origem
  static async criarOrigem(req: Request, res: Response) {
    try {
      const clienteId = req.headers.cliente_id as string
      
      // Validar dados de entrada
      const validatedData = createOrigemSchema.parse(req.body)
      
      // Se não foi fornecido cliente_id no body, usar o do header
      if (!validatedData.cliente_id && clienteId) {
        validatedData.cliente_id = clienteId
      }
      
      const origem = await OrigemLeadsService.criarOrigem({
        nome: validatedData.nome,
        cliente_id: validatedData.cliente_id || '',
        embedding: validatedData.embedding
      })
      
      return res.status(201).json({
        success: true,
        message: 'Origem criada com sucesso',
        data: origem
      })
      
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors
        })
      }
      
      return OrigemLeadsController.handleError(res, error, 'Erro interno do servidor')
    }
  }

  // Atualizar origem
  static async atualizarOrigem(req: Request, res: Response) {
    try {
      const id = OrigemLeadsController.extractIdFromUrl(req.url)
      const clienteId = req.headers.cliente_id as string
      
      // Validar UUID
      const validatedId = uuidSchema.parse(id)
      
      // Validar dados de entrada
      const validatedData = updateOrigemSchema.parse(req.body)
      
      // Construir objeto apenas com propriedades definidas
      const updateData: any = {}
      if (validatedData.nome !== undefined) updateData.nome = validatedData.nome
      if (validatedData.cliente_id !== undefined) updateData.cliente_id = validatedData.cliente_id
      
      const origem = await OrigemLeadsService.atualizarOrigem(validatedId, updateData, clienteId)
      
      return res.status(200).json({
        success: true,
        message: 'Origem atualizada com sucesso',
        data: origem
      })
      
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors
        })
      }
      
      return OrigemLeadsController.handleError(res, error, 'Erro interno do servidor')
    }
  }

  // Deletar origem
  static async deletarOrigem(req: Request, res: Response) {
    try {
      const id = OrigemLeadsController.extractIdFromUrl(req.url)
      const clienteId = req.headers.cliente_id as string
      
      // Validar UUID
      const validatedId = uuidSchema.parse(id)
      
      const result = await OrigemLeadsService.deletarOrigem(validatedId, clienteId)
      
      return res.status(200).json({
        success: true,
        message: result.message
      })
      
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors
        })
      }
      
      return OrigemLeadsController.handleError(res, error, 'Erro interno do servidor')
    }
  }

  // Buscar origem por nome
  static async buscarOrigemPorNome(req: Request, res: Response) {
    try {
      const { nome } = req.query
      const clienteId = req.headers.cliente_id as string
      
      if (!nome || typeof nome !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Parâmetro nome é obrigatório'
        })
      }
      
      const origem = await OrigemLeadsService.buscarOrigemPorNome(nome, clienteId)
      
      if (!origem) {
        return res.status(404).json({
          success: false,
          message: 'Origem não encontrada'
        })
      }
      
      return res.status(200).json({
        success: true,
        data: origem
      })
      
    } catch (error: any) {
      return OrigemLeadsController.handleError(res, error, 'Erro interno do servidor')
    }
  }
}