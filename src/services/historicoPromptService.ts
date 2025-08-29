import { supabase } from '../lib/supabase';

export interface HistoricoPrompt {
  id: string;
  agente_id: string;
  cliente_id: string;
  prompt?: string;
  prompt_agendamento?: string;
  created_at: string;
  updated_at: string;
  agente?: {
    id: string;
    nome: string;
    cliente_id: string;
  };
}

export interface CreateHistoricoPromptInput {
  agente_id: string;
  cliente_id: string;
  prompt?: string;
  prompt_agendamento?: string;
}

export interface UpdateHistoricoPromptInput {
  prompt?: string;
  prompt_agendamento?: string;
}

export class HistoricoPromptService {
  /**
   * Busca todos os históricos de prompt de um cliente
   */
  static async getAll(clienteId: string): Promise<HistoricoPrompt[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('historico_prompt')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar histórico de prompts: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Busca histórico de prompt por ID
   */
  static async getById(id: string, clienteId: string): Promise<HistoricoPrompt | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('historico_prompt')
      .select('*')
      .eq('id', id)
      .eq('cliente_id', clienteId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar histórico de prompt: ${error.message}`);
    }

    return data;
  }

  /**
   * Busca históricos de prompt por agente
   */
  static async getByAgenteId(agenteId: string, clienteId: string): Promise<HistoricoPrompt[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('historico_prompt')
      .select('*')
      .eq('agente_id', agenteId)
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar histórico de prompts do agente: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Cria um novo histórico de prompt
   */
  static async create(input: CreateHistoricoPromptInput): Promise<HistoricoPrompt> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Verificar se o agente pertence ao cliente
    const { data: agente } = await supabase
      .from('agentes')
      .select('id')
      .eq('id', input.agente_id)
      .eq('cliente_id', input.cliente_id)
      .single();

    if (!agente) {
      throw new Error('Agente não encontrado ou não pertence ao cliente');
    }

    const { data, error } = await supabase
      .from('historico_prompt')
      .insert({
        agente_id: input.agente_id,
        cliente_id: input.cliente_id,
        prompt: input.prompt,
        prompt_agendamento: input.prompt_agendamento,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar histórico de prompt: ${error.message}`);
    }

    return data;
  }

  /**
   * Atualiza um histórico de prompt
   */
  static async update(id: string, input: UpdateHistoricoPromptInput, clienteId: string): Promise<HistoricoPrompt> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Verificar se o registro existe e pertence ao cliente
    const existing = await this.getById(id, clienteId);
    if (!existing) {
      throw new Error('Histórico de prompt não encontrado ou não pertence ao cliente');
    }

    const { data, error } = await supabase
      .from('historico_prompt')
      .update({
        prompt: input.prompt,
        prompt_agendamento: input.prompt_agendamento,
      })
      .eq('id', id)
      .eq('cliente_id', clienteId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar histórico de prompt: ${error.message}`);
    }

    return data;
  }

  /**
   * Deleta um histórico de prompt
   */
  static async delete(id: string, clienteId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Verificar se o registro existe e pertence ao cliente
    const existing = await this.getById(id, clienteId);
    if (!existing) {
      throw new Error('Histórico de prompt não encontrado ou não pertence ao cliente');
    }

    const { error } = await supabase
      .from('historico_prompt')
      .delete()
      .eq('id', id)
      .eq('cliente_id', clienteId);

    if (error) {
      throw new Error(`Erro ao deletar histórico de prompt: ${error.message}`);
    }
  }
}