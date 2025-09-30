import { Request, Response, NextFunction } from 'express'
import { GoogleCalendarService } from '../services/googleCalendarService'

/**
 * Middleware para verificar e renovar automaticamente tokens do Google Calendar
 */
export const verificarTokenGoogle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clienteId = req.headers['cliente-id'] as string
    const configuracaoId = req.body.configuracao_id || req.query.configuracao_id || req.params.configuracao_id

    if (!configuracaoId) {
      res.status(400).json({
        error: 'configuracao_id é obrigatório'
      })
      return
    }

    if (!clienteId) {
      res.status(400).json({
        error: 'cliente-id é obrigatório no header'
      })
      return
    }

    // Verificar e renovar token se necessário
    const accessToken = await GoogleCalendarService.verificarERenovarToken(
      configuracaoId as string,
      clienteId
    )

    // Adicionar token à requisição
    ;(req as any).googleAccessToken = accessToken
    ;(req as any).configuracaoId = configuracaoId as string

    next()
  } catch (error) {
    console.error('Erro no middleware de autenticação Google:', error)
    res.status(401).json({
      error: 'Token de acesso inválido ou expirado',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      action: 'Reautorize a aplicação através do endpoint /auth/authorize'
    })
  }
}

/**
 * Middleware para gerar automaticamente access token em configurações
 */
export const gerarTokenAutomatico = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clienteId = req.headers['cliente-id'] as string
    
    if (!clienteId) {
      res.status(400).json({
        error: 'cliente-id é obrigatório no header'
      })
      return
    }

    // Para POST (criação), continuar normalmente
    if (req.method === 'POST') {
      next()
      return
    }

    // Para PUT (atualização), verificar se precisa gerar token
    const configuracaoId = req.params.id
    
    if (!configuracaoId) {
      res.status(400).json({
        error: 'ID da configuração é obrigatório'
      })
      return
    }

    // Verificar se a configuração existe
    const configuracao = await GoogleCalendarService.buscarConfiguracaoPorId(configuracaoId, clienteId)
    
    if (!configuracao) {
      res.status(404).json({
        error: 'Configuração não encontrada'
      })
      return
    }

    // Se tem client_id e client_secret mas não tem access_token, gerar automaticamente
    if (configuracao.client_id && configuracao.client_secret && !configuracao.access_token) {
      try {
        const resultado = await GoogleCalendarService.gerarAccessTokenAutomatico(configuracaoId, clienteId)
        
        if (resultado.url_autorizacao) {
          // Retornar URL de autorização para o usuário
          res.status(200).json({
            success: true,
            message: 'Configuração atualizada. Autorização necessária para gerar access token.',
            data: {
              configuracao: resultado.configuracao,
              url_autorizacao: resultado.url_autorizacao,
              action: 'Acesse a URL de autorização para completar a configuração'
            }
          })
          return
        }
      } catch (error) {
        console.error('Erro ao gerar token automático:', error)
        // Continuar com a atualização normal mesmo se falhar
      }
    }

    next()
  } catch (error) {
    console.error('Erro no middleware de geração automática:', error)
    // Em caso de erro, continuar com o fluxo normal
    next()
  }
}