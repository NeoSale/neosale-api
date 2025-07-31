import { supabase } from '../lib/supabase';
import { CreateParametroInput, UpdateParametroInput } from '../lib/validators';

export interface Parametro {
  id: string;
  chave: string;
  valor: string;
  created_at: string;
  updated_at: string;
}

export class ParametroService {
  static async getAll(clienteId?: string): Promise<Parametro[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    let query = supabase
      .from('parametros')
      .select('*')
      .order('created_at', { ascending: true });

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar parâmetros: ${error.message}`);
    }

    return data || [];
  }

  static async getById(id: string): Promise<Parametro | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('parametros')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar parâmetro: ${error.message}`);
    }

    return data;
  }

  static async getByChave(chave: string): Promise<Parametro | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('parametros')
      .select('*')
      .eq('chave', chave)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar parâmetro por chave: ${error.message}`);
    }

    return data;
  }

  static async create(input: CreateParametroInput): Promise<Parametro> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('parametros')
      .insert({
        chave: input.chave,
        valor: input.valor,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar parâmetro: ${error.message}`);
    }

    return data;
  }

  static async update(id: string, input: UpdateParametroInput): Promise<Parametro> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('parametros')
      .update({
        ...input,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar parâmetro: ${error.message}`);
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('parametros')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar parâmetro: ${error.message}`);
    }
  }
}