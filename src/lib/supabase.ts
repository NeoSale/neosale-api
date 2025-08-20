import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import https from 'https'

// Carregar variáveis de ambiente
dotenv.config()

// Configurar agente HTTPS para ignorar certificados SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

// Configurar fetch global para usar o agente HTTPS
if (typeof global !== 'undefined' && !global.fetch) {
  const { fetch } = require('undici')
  global.fetch = (url: any, options: any = {}) => {
    if (typeof url === 'string' && url.startsWith('https:')) {
      options.agent = httpsAgent
    }
    return fetch(url, options)
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Criar cliente Supabase apenas se as credenciais estiverem configuradas
export const supabase = (!supabaseUrl || !supabaseAnonKey) 
  ? null 
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })