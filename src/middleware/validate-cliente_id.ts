import { Request, Response, NextFunction } from 'express';

export function validateClienteId(req: Request, res: Response, next: NextFunction) {
  const clienteId = req.headers['cliente_id'] as string;
  
  if (!clienteId) {
    return res.status(400).json({
      success: false,
      message: 'Header cliente_id é obrigatório'
    });
  }
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(clienteId)) {
    return res.status(400).json({
      success: false,
      message: 'Header cliente_id deve ser um UUID válido'
    });
  }
  
  return next();
}