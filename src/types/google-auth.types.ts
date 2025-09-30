import { Request } from 'express'

export interface GoogleAuthRequest extends Request {
  googleAccessToken?: string
  configuracaoId?: string
}