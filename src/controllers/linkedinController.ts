import { Request, Response } from 'express'
import { LinkedInConfigService } from '../services/linkedinConfigService'
import { LinkedInApiService } from '../services/linkedinApiService'

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_HNT_URL || 'http://localhost:3004'

export class LinkedInController {

  // ========== CONFIG CRUD ==========

  static async getConfig(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'cliente_id e obrigatorio', data: null })
      }

      const result = await LinkedInConfigService.getByClienteId(clienteId)
      const statusCode = result.success ? 200 : 500
      return res.status(statusCode).json(result)
    } catch (error) {
      console.error('Erro em LinkedInController.getConfig:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }

  static async createConfig(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'cliente_id e obrigatorio', data: null })
      }

      const { client_id, client_secret, redirect_uri, scopes, daily_search_limit, daily_invite_limit, search_keywords, target_industries, target_locations } = req.body

      if (!client_id || !client_secret || !redirect_uri) {
        return res.status(400).json({
          success: false,
          message: 'Campos obrigatorios: client_id, client_secret, redirect_uri',
          data: null,
        })
      }

      const result = await LinkedInConfigService.create(clienteId, {
        client_id, client_secret, redirect_uri, scopes,
        daily_search_limit, daily_invite_limit,
        search_keywords, target_industries, target_locations,
      })

      const statusCode = result.success ? 201 : 400
      return res.status(statusCode).json(result)
    } catch (error) {
      console.error('Erro em LinkedInController.createConfig:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }

  static async updateConfig(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'cliente_id e obrigatorio', data: null })
      }

      const updates = req.body
      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: 'Nenhum campo para atualizar', data: null })
      }

      const result = await LinkedInConfigService.update(clienteId, updates)
      const statusCode = result.success ? 200 : 404
      return res.status(statusCode).json(result)
    } catch (error) {
      console.error('Erro em LinkedInController.updateConfig:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }

  static async deleteConfig(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'cliente_id e obrigatorio', data: null })
      }

      const result = await LinkedInConfigService.delete(clienteId)
      const statusCode = result.success ? 200 : 404
      return res.status(statusCode).json(result)
    } catch (error) {
      console.error('Erro em LinkedInController.deleteConfig:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }

  // ========== OAuth 2.0 ==========

  static async authorize(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'cliente_id e obrigatorio', data: null })
      }

      const configResult = await LinkedInConfigService.getByClienteId(clienteId)
      if (!configResult.success || !configResult.data) {
        return res.status(404).json({
          success: false,
          message: 'Configure as credenciais do LinkedIn primeiro',
          data: null,
        })
      }

      const config = configResult.data
      const authorizationUrl = LinkedInApiService.generateAuthorizationUrl({
        client_id: config.client_id,
        redirect_uri: config.redirect_uri,
        scopes: config.scopes,
        state: clienteId,
      })

      return res.status(200).json({
        success: true,
        message: 'URL de autorizacao gerada',
        data: { authorization_url: authorizationUrl },
      })
    } catch (error) {
      console.error('Erro em LinkedInController.authorize:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }

  static async callback(req: Request, res: Response) {
    try {
      const { code, state, error: oauthError } = req.query

      if (oauthError) {
        console.error('[LinkedIn OAuth] Erro:', oauthError)
        return res.redirect(`${FRONTEND_URL}/settings?linkedin=error&message=${encodeURIComponent(oauthError as string)}`)
      }

      if (!code || !state) {
        return res.redirect(`${FRONTEND_URL}/settings?linkedin=error&message=Parametros+invalidos`)
      }

      const clienteId = state as string
      const configResult = await LinkedInConfigService.getByClienteId(clienteId)

      if (!configResult.success || !configResult.data) {
        return res.redirect(`${FRONTEND_URL}/settings?linkedin=error&message=Configuracao+nao+encontrada`)
      }

      const config = configResult.data

      // Exchange code for tokens
      const tokenResult = await LinkedInApiService.exchangeCodeForTokens(
        code as string,
        config.client_id,
        config.client_secret,
        config.redirect_uri
      )

      if (!tokenResult.success || !tokenResult.data) {
        return res.redirect(`${FRONTEND_URL}/settings?linkedin=error&message=${encodeURIComponent(tokenResult.error || 'Falha ao obter tokens')}`)
      }

      const tokens = tokenResult.data
      const expiryDate = new Date(Date.now() + tokens.expires_in * 1000)

      // Fetch LinkedIn profile
      let linkedinUserId: string | undefined
      let linkedinUserName: string | undefined

      const profileResult = await LinkedInApiService.getProfile(tokens.access_token)
      if (profileResult.success && profileResult.data) {
        linkedinUserId = profileResult.data.id
        linkedinUserName = `${profileResult.data.localizedFirstName} ${profileResult.data.localizedLastName}`
      }

      // Save tokens
      const tokenUpdate: Parameters<typeof LinkedInConfigService.updateTokens>[1] = {
        access_token: tokens.access_token,
        token_expiry: expiryDate.toISOString(),
      }
      if (tokens.refresh_token) tokenUpdate.refresh_token = tokens.refresh_token
      if (linkedinUserId) tokenUpdate.linkedin_user_id = linkedinUserId
      if (linkedinUserName) tokenUpdate.linkedin_user_name = linkedinUserName

      await LinkedInConfigService.updateTokens(clienteId, tokenUpdate)

      return res.redirect(`${FRONTEND_URL}/settings?linkedin=connected`)
    } catch (error) {
      console.error('Erro em LinkedInController.callback:', error)
      return res.redirect(`${FRONTEND_URL}/settings?linkedin=error&message=Erro+interno`)
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'cliente_id e obrigatorio', data: null })
      }

      const token = await LinkedInConfigService.getValidToken(clienteId)

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Nao foi possivel renovar o token. Reconecte o LinkedIn.',
          data: null,
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Token renovado com sucesso',
        data: { valid: true },
      })
    } catch (error) {
      console.error('Erro em LinkedInController.refreshToken:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }

  // ========== Status & Profile ==========

  static async getStatus(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'cliente_id e obrigatorio', data: null })
      }

      const configResult = await LinkedInConfigService.getByClienteId(clienteId)

      if (!configResult.success || !configResult.data) {
        return res.status(200).json({
          success: true,
          message: 'LinkedIn nao configurado',
          data: { configured: false, connected: false },
        })
      }

      const config = configResult.data
      const hasToken = !!config.access_token
      const tokenExpired = config.token_expiry ? new Date(config.token_expiry) <= new Date() : false

      return res.status(200).json({
        success: true,
        message: 'Status do LinkedIn',
        data: {
          configured: true,
          connected: hasToken && !tokenExpired,
          token_expired: hasToken && tokenExpired,
          linkedin_user_name: config.linkedin_user_name,
          linkedin_user_id: config.linkedin_user_id,
          last_error: config.last_error,
          ativo: config.ativo,
        },
      })
    } catch (error) {
      console.error('Erro em LinkedInController.getStatus:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const clienteId = req.headers['cliente_id'] as string
      if (!clienteId) {
        return res.status(400).json({ success: false, message: 'cliente_id e obrigatorio', data: null })
      }

      const token = await LinkedInConfigService.getValidToken(clienteId)
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'LinkedIn nao conectado ou token expirado',
          data: null,
        })
      }

      const profileResult = await LinkedInApiService.getProfile(token)
      if (!profileResult.success) {
        return res.status(400).json({
          success: false,
          message: profileResult.error || 'Erro ao buscar perfil',
          data: null,
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Perfil LinkedIn',
        data: profileResult.data,
      })
    } catch (error) {
      console.error('Erro em LinkedInController.getProfile:', error)
      return res.status(500).json({ success: false, message: 'Erro interno do servidor', data: null })
    }
  }
}
