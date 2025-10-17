import { supabase } from '../lib/supabase';

export interface Perfil {
  id: string;
  nome: string;
  descricao?: string;
  permissoes: Record<string, any>;
  ativo: boolean;
  sistema: boolean;
  embedding?: number[];
  created_at: string;
  updated_at: string;
}

export interface CreatePerfilInput {
  nome: string;
  descricao?: string;
  permissoes: Record<string, any>;
  ativo?: boolean;
}

export interface UpdatePerfilInput {
  nome?: string;
  descricao?: string;
  permissoes?: Record<string, any>;
  ativo?: boolean;
}

export class PerfilService {
  static async getAll(): Promise<Perfil[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar perfis: ${error.message}`);
    }

    return data || [];
  }

  static async getAtivos(): Promise<Perfil[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar perfis ativos: ${error.message}`);
    }

    return data || [];
  }

  static async getById(id: string): Promise<Perfil | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar perfil: ${error.message}`);
    }

    return data;
  }

  static async getByNome(nome: string): Promise<Perfil | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('nome', nome)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar perfil por nome: ${error.message}`);
    }

    return data;
  }

  static async create(input: CreatePerfilInput): Promise<Perfil> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('perfis')
      .insert({
        nome: input.nome,
        descricao: input.descricao,
        permissoes: input.permissoes,
        ativo: input.ativo ?? true,
        sistema: false,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar perfil: ${error.message}`);
    }

    return data;
  }

  static async update(id: string, input: UpdatePerfilInput): Promise<Perfil> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Verificar se o perfil existe e se não é de sistema
    const perfil = await this.getById(id);
    if (!perfil) {
      throw new Error('Perfil não encontrado');
    }

    if (perfil.sistema && input.nome) {
      throw new Error('Não é possível alterar o nome de perfis do sistema');
    }

    const { data, error } = await supabase
      .from('perfis')
      .update({
        ...input,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar perfil: ${error.message}`);
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Verificar se o perfil existe e se não é de sistema
    const perfil = await this.getById(id);
    if (!perfil) {
      throw new Error('Perfil não encontrado');
    }

    if (perfil.sistema) {
      throw new Error('Perfis do sistema não podem ser deletados. Desative-os em vez disso.');
    }

    const { error } = await supabase
      .from('perfis')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar perfil: ${error.message}`);
    }
  }

  static async updatePermissoes(id: string, permissoes: Record<string, any>): Promise<Perfil> {
    return this.update(id, { permissoes });
  }

  static async verificarPermissao(
    perfilId: string,
    recurso: string,
    acao: string
  ): Promise<boolean> {
    const perfil = await this.getById(perfilId);
    if (!perfil || !perfil.ativo) {
      return false;
    }

    // Verificar se tem permissão de admin
    if (perfil.permissoes.admin === true) {
      return true;
    }

    // Verificar permissão específica
    const recursoPermissoes = perfil.permissoes[recurso];
    if (!recursoPermissoes) {
      return false;
    }

    return recursoPermissoes[acao] === true;
  }

  static async getUsuariosPorPerfil(perfilId: string): Promise<any[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuario_perfis')
      .select(`
        *,
        usuario:usuarios(
          id,
          nome,
          email,
          ativo
        )
      `)
      .eq('perfil_id', perfilId)
      .eq('ativo', true);

    if (error) {
      throw new Error(`Erro ao buscar usuários do perfil: ${error.message}`);
    }

    return data || [];
  }
}
