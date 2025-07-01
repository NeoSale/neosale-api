import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl.includes('your-project') || 
    supabaseAnonKey.includes('your_supabase')) {
  console.warn('⚠️  Supabase Configuration Warning:');
  console.warn('Supabase credentials not configured. Database operations will not work.');
  console.warn('To configure Supabase:');
  console.warn('1. Go to https://supabase.com/dashboard');
  console.warn('2. Select your project (or create one)');
  console.warn('3. Go to Settings > API');
  console.warn('4. Copy the URL and anon key to your .env file');
  console.warn('5. Replace the placeholder values with real ones');
  console.warn('');
}

// Criar cliente Supabase apenas se as credenciais estiverem configuradas
export const supabase = (!supabaseUrl || !supabaseAnonKey || 
  supabaseUrl.includes('your-project') || 
  supabaseAnonKey.includes('your_supabase')) 
  ? null 
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

// Database types
export interface Lead {
  id: string
  nome: string
  telefone: string
  email: string
  empresa?: string
  cargo?: string
  origem_id: string
  status_agendamento: boolean
  agendado_em?: string
  mensagem_status_id: string
  etapa_funil_id?: string
  status_negociacao_id?: string
  created_at: string
}

export interface MensagemStatus {
  id: string
  mensagem_1_enviada: boolean
  mensagem_1_data?: string
  mensagem_2_enviada: boolean
  mensagem_2_data?: string
  mensagem_3_enviada: boolean
  mensagem_3_data?: string
}

export interface OrigemLead {
  id: string
  nome: string
}

export interface EtapaFunil {
  id: string
  nome: string
}

export interface StatusNegociacao {
  id: string
  nome: string
}