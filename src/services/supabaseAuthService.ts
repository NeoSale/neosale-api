/**
 * Supabase Auth Service
 * 
 * Serviço simplificado para autenticação usando Supabase Auth.
 * Substitui o authService.ts customizado.
 */

import { supabase } from '../lib/supabase';

export interface UserData {
  id: string;
  auth_user_id: string;
  nome: string;
  email: string;
  telefone?: string;
  ativo: boolean;
  email_verificado: boolean;
  cliente_id?: string;
  revendedor_id?: string;
  tipo_acesso_id?: string;
  perfis: Array<{
    perfil_id: string;
    perfil_nome: string;
    permissoes: any;
    cliente_id?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export class SupabaseAuthService {
  /**
   * Obter dados completos do usuário autenticado
   */
  static async getUserData(authUserId: string): Promise<UserData | null> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return null;
      }

      const { data, error } = await supabase
        .rpc('get_user_data', { user_id: authUserId })
        .single();

      if (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        return null;
      }

      return data as UserData;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  }

  /**
   * Verificar se token JWT do Supabase é válido
   */
  static async verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return null;
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return null;
      }

      return {
        userId: user.id,
        email: user.email || ''
      };
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return null;
    }
  }

  /**
   * Atualizar último login do usuário
   */
  static async updateLastLogin(authUserId: string): Promise<void> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }

      await supabase
        .from('usuarios')
        .update({ ultimo_login: new Date().toISOString() })
        .eq('auth_user_id', authUserId);
    } catch (error) {
      console.error('Erro ao atualizar último login:', error);
    }
  }

  /**
   * Verificar se usuário tem permissão específica
   */
  static hasPermission(userData: UserData, recurso: string, acao: string): boolean {
    return userData.perfis.some((perfil) => {
      // Admin tem todas as permissões
      if (perfil.permissoes?.admin === true) return true;

      // Verifica permissão específica
      return perfil.permissoes?.[recurso]?.[acao] === true;
    });
  }

  /**
   * Verificar se usuário é admin
   */
  static isAdmin(userData: UserData): boolean {
    return userData.perfis.some((perfil) => perfil.permissoes?.admin === true);
  }

  /**
   * Criar novo usuário (apenas admin)
   * Usa o Admin API do Supabase
   */
  static async createUser(params: {
    email: string;
    senha: string;
    nome: string;
    telefone?: string;
    perfil_id: string;
    cliente_id?: string;
    revendedor_id?: string;
    tipo_acesso_id?: string;
  }): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase client not initialized' };
      }

      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: params.email,
        password: params.senha,
        email_confirm: true,
        user_metadata: {
          nome: params.nome,
          telefone: params.telefone
        }
      });

      if (authError || !authData.user) {
        return { success: false, error: authError?.message || 'Erro ao criar usuário' };
      }

      // 2. Atualizar dados adicionais na tabela usuarios
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          nome: params.nome,
          telefone: params.telefone,
          cliente_id: params.cliente_id,
          revendedor_id: params.revendedor_id,
          tipo_acesso_id: params.tipo_acesso_id
        })
        .eq('auth_user_id', authData.user.id);

      if (updateError) {
        console.error('Erro ao atualizar dados do usuário:', updateError);
      }

      // 3. Associar perfil
      const { error: perfilError } = await supabase
        .from('usuario_perfis')
        .insert({
          usuario_id: authData.user.id,
          perfil_id: params.perfil_id,
          cliente_id: params.cliente_id
        });

      if (perfilError) {
        console.error('Erro ao associar perfil:', perfilError);
      }

      return { success: true, userId: authData.user.id };
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Atualizar dados do usuário
   */
  static async updateUser(
    authUserId: string,
    updates: {
      nome?: string;
      telefone?: string;
      cliente_id?: string;
      revendedor_id?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase client not initialized' };
      }

      // Atualizar metadata no Supabase Auth se nome ou telefone mudaram
      if (updates.nome || updates.telefone) {
        const { error: authError } = await supabase.auth.admin.updateUserById(
          authUserId,
          {
            user_metadata: {
              nome: updates.nome,
              telefone: updates.telefone
            }
          }
        );

        if (authError) {
          console.error('Erro ao atualizar metadata:', authError);
        }
      }

      // Atualizar tabela usuarios
      const { error: updateError } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('auth_user_id', authUserId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Desativar usuário
   */
  static async deactivateUser(authUserId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase client not initialized' };
      }

      // Marcar como inativo na tabela usuarios
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ ativo: false })
        .eq('auth_user_id', authUserId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Opcional: Banir usuário no Supabase Auth
      // await supabase.auth.admin.updateUserById(authUserId, { ban_duration: 'none' });

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao desativar usuário:', error);
      return { success: false, error: error.message };
    }
  }
}
