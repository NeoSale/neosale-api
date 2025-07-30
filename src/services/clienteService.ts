import { supabase } from '../lib/supabase';
import { CreateClienteInput, UpdateClienteInput } from '../lib/validators';

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  status: string;
  revendedor_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ClienteWithRevendedor extends Cliente {
  revendedor?: {
    id: string;
    nome: string;
    email: string;
  };
}

export class ClienteService {
  static async getAllClientes(): Promise<ClienteWithRevendedor[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        revendedor:revendedores(
          id,
          nome,
          email
        )
      `)
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar todos os clientes: ${error.message}`);
    }

    return data || [];
  }

  static async getAll(clienteId?: string): Promise<ClienteWithRevendedor[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    let query = supabase
      .from('clientes')
      .select(`
        *,
        revendedor:revendedores(
          id,
          nome,
          email
        )
      `);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query.order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar clientes: ${error.message}`);
    }

    return data || [];
  }

  static async getById(id: string, clienteId?: string): Promise<ClienteWithRevendedor | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    let query = supabase
      .from('clientes')
      .select(`
        *,
        revendedor:revendedores(
          id,
          nome,
          email
        )
      `)
      .eq('id', id);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar cliente: ${error.message}`);
    }

    return data;
  }

  static async getByEmail(email: string, clienteId?: string): Promise<ClienteWithRevendedor | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    let query = supabase
      .from('clientes')
      .select(`
        *,
        revendedor:revendedores(
          id,
          nome,
          email
        )
      `)
      .eq('email', email);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar cliente por email: ${error.message}`);
    }

    return data;
  }

  static async getByRevendedor(revendedorId: string): Promise<ClienteWithRevendedor[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        revendedor:revendedores(
          id,
          nome,
          email
        )
      `)
      .eq('revendedor_id', revendedorId)
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar clientes por revendedor: ${error.message}`);
    }

    return data || [];
  }

  static async getByStatus(status: string, clienteId?: string): Promise<ClienteWithRevendedor[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    let query = supabase
      .from('clientes')
      .select(`
        *,
        revendedor:revendedores(
          id,
          nome,
          email
        )
      `)
      .eq('status', status);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query.order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar clientes por status: ${error.message}`);
    }

    return data || [];
  }

  static async create(input: CreateClienteInput): Promise<ClienteWithRevendedor> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert({
        nome: input.nome,
        email: input.email,
        telefone: input.telefone,
        status: input.status ?? 'ativo',
        revendedor_id: input.revendedor_id,
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        revendedor:revendedores(
          id,
          nome,
          email
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar cliente: ${error.message}`);
    }

    return data;
  }

  static async update(id: string, input: UpdateClienteInput): Promise<ClienteWithRevendedor> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('clientes')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        revendedor:revendedores(
          id,
          nome,
          email
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar cliente: ${error.message}`);
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar cliente: ${error.message}`);
    }
  }
}