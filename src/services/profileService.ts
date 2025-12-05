import { supabase } from '../lib/supabase';

export type UserRole = 'super_admin' | 'admin' | 'member' | 'viewer';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  cliente_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileInput {
  id: string;
  email: string;
  full_name?: string | undefined;
  avatar_url?: string | undefined;
  role?: UserRole | undefined;
  cliente_id?: string | undefined;
}

export interface UpdateProfileInput {
  email?: string | undefined;
  full_name?: string | undefined;
  avatar_url?: string | null | undefined;
  role?: UserRole | undefined;
  cliente_id?: string | null | undefined;
}

export class ProfileService {
  /**
   * Get all profiles (optionally filtered by cliente_id)
   */
  static async getAll(clienteId?: string): Promise<Profile[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });

    console.log(data);

    if (error) {
      throw new Error(`Erro ao buscar profiles: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get profile by ID
   */
  static async getById(id: string): Promise<Profile | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Get profile by email
   */
  static async getByEmail(email: string): Promise<Profile | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar profile por email: ${error.message}`);
    }

    return data;
  }

  /**
   * Get profiles by role
   */
  static async getByRole(role: UserRole): Promise<Profile[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar profiles por role: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create a new profile
   */
  static async create(input: CreateProfileInput): Promise<Profile> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: input.id,
        email: input.email,
        full_name: input.full_name,
        avatar_url: input.avatar_url,
        role: input.role || 'viewer',
        cliente_id: input.cliente_id
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a profile
   */
  static async update(id: string, input: UpdateProfileInput): Promise<Profile> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a profile
   */
  static async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar profile: ${error.message}`);
    }
  }

  /**
   * Check if user is admin or super_admin
   */
  static async isAdmin(id: string): Promise<boolean> {
    const profile = await this.getById(id);
    return profile?.role === 'admin' || profile?.role === 'super_admin';
  }

  /**
   * Update user role
   */
  static async updateRole(id: string, role: UserRole): Promise<Profile> {
    return this.update(id, { role });
  }
}
