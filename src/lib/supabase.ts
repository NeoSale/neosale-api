import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl.includes('your-project') || 
    supabaseAnonKey.includes('your_supabase')) {
  console.error('❌ Supabase Configuration Error:');
  console.error('Please configure real Supabase credentials in your .env file');
  console.error('Current values:');
  console.error(`  SUPABASE_URL: ${supabaseUrl || 'undefined'}`);
  console.error(`  SUPABASE_ANON_KEY: ${supabaseAnonKey ? '[SET]' : 'undefined'}`);
  console.error('');
  console.error('To fix this:');
  console.error('1. Go to https://supabase.com/dashboard');
  console.error('2. Select your project (or create one)');
  console.error('3. Go to Settings > API');
  console.error('4. Copy the URL and anon key to your .env file');
  console.error('5. Replace the placeholder values with real ones');
  throw new Error('Missing or invalid Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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