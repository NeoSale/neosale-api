import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

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
  email?: string
  empresa?: string
  cargo?: string
  origem_id: string
  status_agendamento: boolean
  agendado_em?: string
  followup_id: string
  etapa_funil_id?: string
  status_negociacao_id?: string
  qualificacao_id?: string
  deletado: boolean
  created_at: string
}

export interface Followup {
  id: string
  id_mensagem: string // UUID da mensagem da tabela mensagens
  id_lead: string // UUID do lead que recebeu a mensagem
  status: 'sucesso' | 'erro'
  erro?: string // mensagem de erro quando status = 'erro'
  mensagem_enviada: string // texto da mensagem enviada
  embedding?: number[] // embedding para LLM
  created_at?: string
  updated_at?: string
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