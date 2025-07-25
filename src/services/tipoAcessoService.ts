import { supabase } from '../lib/supabase';
import { CreateTipoAcessoInput, UpdateTipoAcessoInput } from '../lib/validators';

export interface TipoAcesso {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export class TipoAcessoService {
  static async getAll(): Promise<TipoAcesso[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('tipos_acesso')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar tipos de acesso: ${error.message}`);
    }

    return data || [];
  }

  static async getById(id: string): Promise<TipoAcesso | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('tipos_acesso')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar tipo de acesso: ${error.message}`);
    }

    return data;
  }

  static async getByNome(nome: string): Promise<TipoAcesso | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('tipos_acesso')
      .select('*')
      .eq('nome', nome)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar tipo de acesso por nome: ${error.message}`);
    }

    return data;
  }

  static async create(input: CreateTipoAcessoInput): Promise<TipoAcesso> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('tipos_acesso')
      .insert({
        nome: input.nome,
        descricao: input.descricao,
        ativo: input.ativo ?? true,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar tipo de acesso: ${error.message}`);
    }

    return data;
  }

  static async update(id: string, input: UpdateTipoAcessoInput): Promise<TipoAcesso> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('tipos_acesso')
      .update({
        ...input,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar tipo de acesso: ${error.message}`);
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('tipos_acesso')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar tipo de acesso: ${error.message}`);
    }
  }
}