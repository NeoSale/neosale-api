const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2'
const LINKEDIN_AUTH_BASE = 'https://www.linkedin.com/oauth/v2'

export interface LinkedInProfile {
  id: string
  localizedFirstName: string
  localizedLastName: string
  profilePicture?: { displayImage: string }
}

export interface LinkedInSearchResult {
  urn: string
  name: string
  title: string
  company: string
  location: string
  profileUrl: string
}

export interface LinkedInTokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
}

interface ApiResult<T> {
  success: boolean
  data?: T
  error?: string
}

export class LinkedInApiService {

  // ========== HTTP Base ==========

  private static async makeRequest<T>(
    accessToken: string,
    method: string,
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<ApiResult<T>> {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${LINKEDIN_API_BASE}${endpoint}`

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202401',
      }

      const options: RequestInit = { method, headers }
      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body)
      }

      const response = await fetch(url, options)

      if (!response.ok) {
        const errorBody = await response.text()
        let errorMessage = `LinkedIn API ${response.status}: ${response.statusText}`

        try {
          const parsed = JSON.parse(errorBody)
          errorMessage = parsed.message || parsed.error_description || errorMessage
        } catch { /* keep default message */ }

        console.error(`[LinkedInApi] ${method} ${endpoint} -> ${response.status}:`, errorMessage)

        return {
          success: false,
          error: errorMessage,
        }
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        return { success: true, data: data as T }
      }

      return { success: true }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error(`[LinkedInApi] ${method} ${endpoint} -> Erro:`, msg)
      return { success: false, error: msg }
    }
  }

  // ========== OAuth 2.0 ==========

  static generateAuthorizationUrl(config: {
    client_id: string
    redirect_uri: string
    scopes: string
    state: string
  }): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.client_id,
      redirect_uri: config.redirect_uri,
      scope: config.scopes,
      state: config.state,
    })

    return `${LINKEDIN_AUTH_BASE}/authorization?${params.toString()}`
  }

  static async exchangeCodeForTokens(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<ApiResult<LinkedInTokenResponse>> {
    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      })

      const response = await fetch(`${LINKEDIN_AUTH_BASE}/accessToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        let errorMessage = `Token exchange falhou: ${response.status}`
        try {
          const parsed = JSON.parse(errorBody)
          errorMessage = parsed.error_description || errorMessage
        } catch { /* keep default */ }
        return { success: false, error: errorMessage }
      }

      const data = (await response.json()) as LinkedInTokenResponse
      return { success: true, data }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao trocar code por tokens'
      return { success: false, error: msg }
    }
  }

  static async refreshAccessToken(
    refreshToken: string,
    clientId: string,
    clientSecret: string
  ): Promise<ApiResult<LinkedInTokenResponse>> {
    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      })

      const response = await fetch(`${LINKEDIN_AUTH_BASE}/accessToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        let errorMessage = `Token refresh falhou: ${response.status}`
        try {
          const parsed = JSON.parse(errorBody)
          errorMessage = parsed.error_description || errorMessage
        } catch { /* keep default */ }
        return { success: false, error: errorMessage }
      }

      const data = (await response.json()) as LinkedInTokenResponse
      return { success: true, data }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao refresh token'
      return { success: false, error: msg }
    }
  }

  // ========== Profile ==========

  static async getProfile(accessToken: string): Promise<ApiResult<LinkedInProfile>> {
    return this.makeRequest<LinkedInProfile>(accessToken, 'GET', '/me')
  }

  static async getEmail(accessToken: string): Promise<ApiResult<string>> {
    const result = await this.makeRequest<{ elements: Array<{ 'handle~': { emailAddress: string } }> }>(
      accessToken,
      'GET',
      '/emailAddress?q=members&projection=(elements*(handle~))'
    )

    if (!result.success || !result.data) {
      return { success: false, error: result.error || 'Erro ao buscar email' }
    }

    const email = result.data.elements?.[0]?.['handle~']?.emailAddress
    return email
      ? { success: true, data: email }
      : { success: false, error: 'Email nao encontrado' }
  }

  // ========== Search ==========

  static async searchPeople(
    accessToken: string,
    params: {
      keywords?: string
      industry?: string
      location?: string
      title?: string
      start?: number
      count?: number
    }
  ): Promise<ApiResult<{ results: LinkedInSearchResult[]; total: number }>> {
    try {
      const queryParts: string[] = []
      if (params.keywords) queryParts.push(`keywords=${encodeURIComponent(params.keywords)}`)
      if (params.start !== undefined) queryParts.push(`start=${params.start}`)
      if (params.count !== undefined) queryParts.push(`count=${params.count}`)

      const endpoint = `/search/blended?${queryParts.join('&')}`
      const result = await this.makeRequest<Record<string, unknown>>(accessToken, 'GET', endpoint)

      if (!result.success) {
        // Graceful degradation: search API may not be available
        if (result.error?.includes('403') || result.error?.includes('Forbidden')) {
          console.warn('[LinkedInApi] Search API nao disponivel (sem permissao). Use Sales Navigator ou importe manualmente.')
          return { success: true, data: { results: [], total: 0 } }
        }
        return { success: false, error: result.error || 'Erro na busca' }
      }

      // Parse LinkedIn search response into our format
      const elements = (result.data as Record<string, unknown>)?.elements as Array<Record<string, unknown>> || []
      const results: LinkedInSearchResult[] = elements.map((el: Record<string, unknown>) => ({
        urn: (el.objectUrn || el.targetUrn || '') as string,
        name: ((el.title as Record<string, unknown>)?.text || '') as string,
        title: ((el.headline as Record<string, unknown>)?.text || '') as string,
        company: '',
        location: '',
        profileUrl: (el.navigationUrl || '') as string,
      }))

      return {
        success: true,
        data: {
          results,
          total: ((result.data as Record<string, unknown>)?.paging as Record<string, unknown>)?.total as number || results.length,
        },
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro na busca'
      return { success: false, error: msg }
    }
  }

  // ========== Invitations ==========

  static async sendInvitation(
    accessToken: string,
    profileUrn: string,
    message?: string
  ): Promise<ApiResult<{ invitationId?: string }>> {
    const body: Record<string, unknown> = {
      invitee: {
        'com.linkedin.voyager.growth.invitation.InviteeProfile': {
          profileId: profileUrn.replace('urn:li:person:', ''),
        },
      },
    }

    if (message) {
      body.message = message
    }

    return this.makeRequest(accessToken, 'POST', '/invitations', body)
  }

  // ========== Messaging ==========

  static async sendMessage(
    accessToken: string,
    recipientUrn: string,
    messageText: string
  ): Promise<ApiResult<void>> {
    const body = {
      recipients: [recipientUrn],
      subject: 'Mensagem',
      body: messageText,
    }

    return this.makeRequest(accessToken, 'POST', '/messaging/conversations', body)
  }

  // ========== Connection Status ==========

  static async getConnectionStatus(
    accessToken: string,
    profileUrn: string
  ): Promise<ApiResult<'CONNECTED' | 'PENDING' | 'NOT_CONNECTED'>> {
    const result = await this.makeRequest<{ elements: Array<{ status: string }> }>(
      accessToken,
      'GET',
      `/connections?q=viewer&projection=(elements*(to~))`
    )

    if (!result.success) {
      return { success: false, error: result.error || 'Erro ao verificar conexao' }
    }

    // Simplified check — full implementation would query specific profile
    return { success: true, data: 'NOT_CONNECTED' }
  }
}
