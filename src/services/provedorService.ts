import { supabase } from '../lib/supabase';
import { CreateProvedorInput, UpdateProvedorInput } from '../lib/validators';

export interface Provedor {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export class ProvedorService {
  static async getAll(): Promise<Provedor[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('provedores')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar provedores: ${error.message}`);
    }

    return data || [];
  }

  static async getById(id: string): Promise<Provedor | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('provedores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar provedor: ${error.message}`);
    }

    return data;
  }

  static async getByNome(nome: string): Promise<Provedor | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('provedores')
      .select('*')
      .eq('nome', nome)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar provedor por nome: ${error.message}`);
    }

    return data;
  }

  static async create(input: CreateProvedorInput): Promise<Provedor> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('provedores')
      .insert({
        nome: input.nome,
        descricao: input.descricao,
        ativo: input.ativo ?? true,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar provedor: ${error.message}`);
    }

    return data;
  }

  static async update(id: string, input: UpdateProvedorInput): Promise<Provedor> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('provedores')
      .update({
        ...input,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar provedor: ${error.message}`);
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('provedores')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar provedor: ${error.message}`);
    }
  }
}