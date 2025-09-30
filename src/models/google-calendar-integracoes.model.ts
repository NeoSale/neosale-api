export interface GoogleCalendarIntegracao {
  id?: string;
  cliente_id: string;
  nome: string;
  client_id: string;
  client_secret: string;
  redirect_uri?: string;
  scope?: string;
  access_token?: string;
  refresh_token?: string;
  token_expiry?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateGoogleCalendarIntegracaoData {
  cliente_id: string;
  nome: string;
  client_id: string;
  client_secret: string;
  redirect_uri?: string | undefined;
  scope?: string | undefined;
  access_token?: string | undefined;
  refresh_token?: string | undefined;
  token_expiry?: string | undefined;
  ativo?: boolean | undefined;
}

export interface UpdateGoogleCalendarIntegracaoData {
  nome?: string | undefined;
  client_id?: string | undefined;
  client_secret?: string | undefined;
  redirect_uri?: string | undefined;
  scope?: string | undefined;
  access_token?: string | undefined;
  refresh_token?: string | undefined;
  token_expiry?: string | undefined;
  ativo?: boolean | undefined;
}

export interface GoogleOAuthTokens {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_expiry?: string;
  token_type?: string;
  scope?: string;
}

export interface UpdateGoogleOAuthTokens {
  access_token?: string;
  refresh_token?: string;
  token_expiry?: string;
}

export interface GoogleCalendarAuth {
  client_id?: string;
  client_secret?: string;
  redirect_uri?: string;
  scope?: string;
  auth_url?: string;
}

export interface GoogleAuthRequest {
  accessToken?: string
  configuracaoId?: string
}