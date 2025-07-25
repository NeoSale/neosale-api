import { supabase } from '../lib/supabase';
import { CreateUsuarioInput, UpdateUsuarioInput } from '../lib/validators';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  provedor_id: string;
  tipo_acesso_id: string;
  revendedor_id?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsuarioWithRelations extends Usuario {
  provedor?: {
    id: string;
    nome: string;
    descricao?: string;
  };
  tipo_acesso?: {
    id: string;
    nome: string;
    descricao?: string;
  };
  revendedor?: {
    id: string;
    nome: string;
    email: string;
  };
}

export class UsuarioService {
  static async getAll(): Promise<UsuarioWithRelations[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        provedor:provedores(
          id,
          nome,
          descricao
        ),
        tipo_acesso:tipos_acesso(
          id,
          nome,
          descricao
        ),
        revendedor:revendedores(
          id,
          nome,
          email
        )
      `)
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar usuários: ${error.message}`);
    }

    return data || [];
  }

  static async getById(id: string): Promise<UsuarioWithRelations | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        provedor:provedores(
          id,
          nome,
          descricao
        ),
        tipo_acesso:tipos_acesso(
          id,
          nome,
          descricao
        ),
        revendedor:revendedores(
          id,
          nome,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }

    return data;
  }

  static async getByEmail(email: string): Promise<UsuarioWithRelations | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        provedor:provedores(
          id,
          nome,
          descricao
        ),
        tipo_acesso:tipos_acesso(
          id,
          nome,
          descricao
        ),
        revendedor:revendedores(
          id,
          nome,
          email
        )
      `)
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar usuário por email: ${error.message}`);
    }

    return data;
  }

  static async getByTipoAcesso(tipoAcessoId: string): Promise<UsuarioWithRelations[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        provedor:provedores(
          id,
          nome,
          descricao
        ),
        tipo_acesso:tipos_acesso(
          id,
          nome,
          descricao
        ),
        revendedor:revendedores(
          id,
          nome,
          email
        )
      `)
      .eq('tipo_acesso_id', tipoAcessoId)
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar usuários por tipo de acesso: ${error.message}`);
    }

    return data || [];
  }

  static async getByRevendedor(revendedorId: string): Promise<UsuarioWithRelations[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        provedor:provedores(
          id,
          nome,
          descricao
        ),
        tipo_acesso:tipos_acesso(
          id,
          nome,
          descricao
        ),
        revendedor:revendedores(
          id,
          nome,
          email
        )
      `)
      .eq('revendedor_id', revendedorId)
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar usuários por revendedor: ${error.message}`);
    }

    return data || [];
  }

  static async getAtivos(): Promise<UsuarioWithRelations[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        provedor:provedores(
          id,
          nome,
          descricao
        ),
        tipo_acesso:tipos_acesso(
          id,
          nome,
          descricao
        ),
        revendedor:revendedores(
          id,
          nome,
          email
        )
      `)
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar usuários ativos: ${error.message}`);
    }

    return data || [];
  }

  static async create(input: CreateUsuarioInput): Promise<UsuarioWithRelations> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        nome: input.nome,
        email: input.email,
        telefone: input.telefone,
        provedor_id: input.provedor_id,
        tipo_acesso_id: input.tipo_acesso_id,
        revendedor_id: input.revendedor_id,
        ativo: input.ativo ?? true,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .select(`
        *,
        provedor:provedores(
          id,
          nome,
          descricao
        ),
        tipo_acesso:tipos_acesso(
          id,
          nome,
          descricao
        ),
        revendedor:revendedores(
          id,
          nome,
          email
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }

    return data;
  }

  static async update(id: string, input: UpdateUsuarioInput): Promise<UsuarioWithRelations> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update({
        ...input,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .eq('id', id)
      .select(`
        *,
        provedor:provedores(
          id,
          nome,
          descricao
        ),
        tipo_acesso:tipos_acesso(
          id,
          nome,
          descricao
        ),
        revendedor:revendedores(
          id,
          nome,
          email
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar usuário: ${error.message}`);
    }
  }
}