import { supabase } from '../lib/supabase';
import { CreateRevendedorInput, UpdateRevendedorInput } from '../lib/validators';

export interface Revendedor {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export class RevendedorService {
  static async getAll(clienteId?: string): Promise<Revendedor[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    let query = supabase
      .from('revendedores')
      .select('*')
      .order('nome', { ascending: true });

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar revendedores: ${error.message}`);
    }

    return data || [];
  }

  static async getById(id: string, clienteId?: string): Promise<Revendedor | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    let query = supabase
      .from('revendedores')
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
      throw new Error(`Erro ao buscar revendedor: ${error.message}`);
    }

    return data;
  }

  static async getByEmail(email: string, clienteId?: string): Promise<Revendedor | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    let query = supabase
      .from('revendedores')
      .select('*')
      .eq('email', email);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar revendedor por email: ${error.message}`);
    }

    return data;
  }

  static async getByStatus(status: string, clienteId?: string): Promise<Revendedor[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    let query = supabase
      .from('revendedores')
      .select('*')
      .eq('status', status)
      .order('nome', { ascending: true });

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar revendedores por status: ${error.message}`);
    }

    return data || [];
  }

  static async create(input: CreateRevendedorInput): Promise<Revendedor> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('revendedores')
      .insert({
        nome: input.nome,
        email: input.email,
        telefone: input.telefone,
        status: input.status ?? 'ativo',
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar revendedor: ${error.message}`);
    }

    return data;
  }

  static async update(id: string, input: UpdateRevendedorInput): Promise<Revendedor> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('revendedores')
      .update({
        ...input,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar revendedor: ${error.message}`);
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('revendedores')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar revendedor: ${error.message}`);
    }
  }
}