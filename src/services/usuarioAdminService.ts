import { supabase } from '../lib/supabase';
import { generateUsuarioAdminEmbedding } from '../lib/embedding';
import type { CreateUsuarioAdminInput, UpdateUsuarioAdminInput } from '../lib/validators';

export interface UsuarioAdmin {
  id: string;
  usuario_id: string;
  nivel_admin: 'super_admin' | 'admin' | 'moderador';
  permissoes_especiais: string[];
  ativo: boolean;
  embedding: number[];
  created_at: string;
  updated_at: string;
}

export class UsuarioAdminService {
  /**
   * Buscar todos os usuários admin
   */
  static async getAll(): Promise<UsuarioAdmin[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuario_admin')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar usuários admin: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Buscar usuário admin por ID
   */
  static async getById(id: string): Promise<UsuarioAdmin | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuario_admin')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar usuário admin: ${error.message}`);
    }

    return data;
  }

  /**
   * Buscar usuário admin por usuario_id
   */
  static async getByUsuarioId(usuarioId: string): Promise<UsuarioAdmin | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuario_admin')
      .select('*')
      .eq('usuario_id', usuarioId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar usuário admin por usuario_id: ${error.message}`);
    }

    return data;
  }

  /**
   * Buscar usuários admin ativos
   */
  static async getAtivos(): Promise<UsuarioAdmin[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuario_admin')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar usuários admin ativos: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Buscar usuários admin por nível
   */
  static async getByNivel(nivel: 'super_admin' | 'admin' | 'moderador'): Promise<UsuarioAdmin[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuario_admin')
      .select('*')
      .eq('nivel_admin', nivel)
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar usuários admin por nível: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Criar usuário admin
   */
  static async create(input: CreateUsuarioAdminInput): Promise<UsuarioAdmin> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Verificar se já existe um usuário admin para este usuario_id
    const existing = await this.getByUsuarioId(input.usuario_id);
    if (existing) {
      throw new Error('Já existe um registro de admin para este usuário');
    }

    // Gerar embedding se não fornecido
    const embedding = input.embedding || generateUsuarioAdminEmbedding({
      usuario_id: input.usuario_id,
      nivel_admin: input.nivel_admin,
      permissoes_especiais: input.permissoes_especiais || [],
      ativo: input.ativo ?? true
    });

    const { data, error } = await supabase
      .from('usuario_admin')
      .insert({
        ...input,
        embedding
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar usuário admin: ${error.message}`);
    }

    return data;
  }

  /**
   * Atualizar usuário admin
   */
  static async update(id: string, input: UpdateUsuarioAdminInput): Promise<UsuarioAdmin> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Buscar usuário admin existente
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Usuário admin não encontrado');
    }

    // Gerar novo embedding se algum campo relevante foi alterado
    let embedding = input.embedding;
    if (!embedding && (input.nivel_admin || input.permissoes_especiais !== undefined || input.ativo !== undefined)) {
      embedding = generateUsuarioAdminEmbedding({
        usuario_id: existing.usuario_id,
        nivel_admin: input.nivel_admin || existing.nivel_admin,
        permissoes_especiais: input.permissoes_especiais ?? existing.permissoes_especiais,
        ativo: input.ativo ?? existing.ativo
      });
    }

    const updateData = {
      ...input,
      ...(embedding && { embedding })
    };

    const { data, error } = await supabase
      .from('usuario_admin')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar usuário admin: ${error.message}`);
    }

    return data;
  }

  /**
   * Deletar usuário admin
   */
  static async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('usuario_admin')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar usuário admin: ${error.message}`);
    }
  }

  /**
   * Verificar se usuário é admin
   */
  static async isAdmin(usuarioId: string): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .rpc('verificar_usuario_admin', { p_usuario_id: usuarioId });

    if (error) {
      throw new Error(`Erro ao verificar se usuário é admin: ${error.message}`);
    }

    return data || false;
  }

  /**
   * Obter nível de admin do usuário
   */
  static async getNivelAdmin(usuarioId: string): Promise<string | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .rpc('obter_nivel_admin_usuario', { p_usuario_id: usuarioId });

    if (error) {
      throw new Error(`Erro ao obter nível de admin: ${error.message}`);
    }

    return data;
  }

  /**
   * Obter permissões especiais do usuário
   */
  static async getPermissoesEspeciais(usuarioId: string): Promise<string[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .rpc('obter_permissoes_especiais_usuario', { p_usuario_id: usuarioId });

    if (error) {
      throw new Error(`Erro ao obter permissões especiais: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Buscar usuários admin com informações completas
   */
  static async getUsuariosAdminCompleto(): Promise<any[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('vw_usuarios_completo')
      .select('*')
      .not('nivel_admin', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar usuários admin completo: ${error.message}`);
    }

    return data || [];
  }
}