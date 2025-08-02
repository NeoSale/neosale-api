import { supabase } from '../lib/supabase';
import { CreateConfiguracoesInput, UpdateConfiguracoesInput } from '../lib/validators';

export interface Configuracoes {
  cliente_id: string;
  horario_inicio: string;
  horario_fim: string;
  qtd_envio_diario: number;
  somente_dias_uteis: boolean;
  apiKeyOpenAI?: string;
  PromptSDR?: string;
  PromptCalendar?: string;
  UsaCalendar?: string;
  created_at: string;
  updated_at: string;
}

export class ConfiguracoesService {
  static async getAll(clienteId?: string): Promise<Configuracoes[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    let query = supabase
      .from('configuracoes')
      .select('*');

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar configurações de followup: ${error.message}`);
    }

    return data || [];
  }

  static async getById(clienteId: string): Promise<Configuracoes | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const query = supabase
      .from('configuracoes')
      .select('*')
      .eq('cliente_id', clienteId);

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      throw new Error(`Erro ao buscar configuração: ${error.message}`);
    }

    return data;
  }

  static async create(input: CreateConfiguracoesInput, clienteId: string): Promise<Configuracoes> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Verificar se já existe uma configuração para este cliente
    const { data: existingConfig } = await supabase
      .from('configuracoes')
      .select('cliente_id')
      .eq('cliente_id', clienteId)
      .single();

    if (existingConfig) {
      throw new Error('Já existe uma configuração para este cliente');
    }

    const { data, error } = await supabase
      .from('configuracoes')
      .insert({
        cliente_id: clienteId,
        horario_inicio: input.horario_inicio,
        horario_fim: input.horario_fim,
        qtd_envio_diario: input.qtd_envio_diario,
        somente_dias_uteis: input.somente_dias_uteis,
        apiKeyOpenAI: input.apiKeyOpenAI,
        PromptSDR: input.PromptSDR,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar configuração de followup: ${error.message}`);
    }

    return data;
  }

  static async update(clienteId: string, input: UpdateConfiguracoesInput): Promise<Configuracoes> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('configuracoes')
      .update({
        ...input,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .eq('cliente_id', clienteId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar configuração de followup: ${error.message}`);
    }

    return data;
  }

  static async delete(clienteId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('configuracoes')
      .delete()
      .eq('cliente_id', clienteId);
    
    if (error) {
      throw new Error(`Erro ao deletar configuração de followup: ${error.message}`);
    }
  }
}