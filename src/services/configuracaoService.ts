import { supabase } from '../lib/supabase';
import { CreateConfiguracaoInput, UpdateConfiguracaoInput } from '../lib/validators';

export interface Configuracao {
  id: string;
  chave: string;
  valor: string;
  created_at: string;
  updated_at: string;
}

export class ConfiguracaoService {
  static async getAll(): Promise<Configuracao[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('configuracoes')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar configurações: ${error.message}`);
    }

    return data || [];
  }

  static async getById(id: string): Promise<Configuracao | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar configuração: ${error.message}`);
    }

    return data;
  }

  static async getByChave(chave: string): Promise<Configuracao | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('chave', chave)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar configuração por chave: ${error.message}`);
    }

    return data;
  }

  static async create(input: CreateConfiguracaoInput): Promise<Configuracao> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('configuracoes')
      .insert({
        chave: input.chave,
        valor: input.valor,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar configuração: ${error.message}`);
    }

    return data;
  }

  static async update(id: string, input: UpdateConfiguracaoInput): Promise<Configuracao> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('configuracoes')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar configuração: ${error.message}`);
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('configuracoes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar configuração: ${error.message}`);
    }
  }
}