import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export interface ApiError extends Error {
  statusCode?: number
  details?: any
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Erro capturado:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query
  })

  // Erro de validação Zod
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: error.errors
    })
  }

  // Erro customizado com status code
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      details: error.details
    })
  }

  // Erro interno do servidor
  return res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  })
}

// Função para criar erros customizados
export const createError = (message: string, statusCode: number, details?: any): ApiError => {
  const error = new Error(message) as ApiError
  error.statusCode = statusCode
  error.details = details
  return error
}