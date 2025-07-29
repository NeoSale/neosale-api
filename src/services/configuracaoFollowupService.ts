import { supabase } from '../lib/supabase';
import { CreateConfiguracaoFollowupInput, UpdateConfiguracaoFollowupInput } from '../lib/validators';

export interface ConfiguracaoFollowup {
  id: string;
  cliente_id: string;
  horario_inicio: string;
  horario_fim: string;
  qtd_envio_diario: number;
  somente_dias_uteis: boolean;
  created_at: string;
  updated_at: string;
}

export class ConfiguracaoFollowupService {
  static async getAll(clienteId?: string): Promise<ConfiguracaoFollowup[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    let query = supabase
      .from('configuracoes_followup')
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

  static async getById(id: string, clienteId?: string): Promise<ConfiguracaoFollowup | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    let query = supabase
      .from('configuracoes_followup')
      .select('*')
      .eq('id', id);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar configuração de followup: ${error.message}`);
    }

    return data;
  }

  static async create(input: CreateConfiguracaoFollowupInput & { cliente_id: string }): Promise<ConfiguracaoFollowup> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('configuracoes_followup')
      .insert({
        cliente_id: input.cliente_id,
        horario_inicio: input.horario_inicio,
        horario_fim: input.horario_fim,
        qtd_envio_diario: input.qtd_envio_diario,
        somente_dias_uteis: input.somente_dias_uteis,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar configuração de followup: ${error.message}`);
    }

    return data;
  }

  static async update(id: string, input: UpdateConfiguracaoFollowupInput, clienteId?: string): Promise<ConfiguracaoFollowup> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    let query = supabase
      .from('configuracoes_followup')
      .update({
        ...input,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .eq('id', id);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar configuração de followup: ${error.message}`);
    }

    return data;
  }

  static async delete(id: string, clienteId?: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    let query = supabase
      .from('configuracoes_followup')
      .delete()
      .eq('id', id);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { error } = await query;

    if (error) {
      throw new Error(`Erro ao deletar configuração de followup: ${error.message}`);
    }
  }
}