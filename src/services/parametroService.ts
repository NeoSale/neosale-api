import { supabase } from '../lib/supabase';
import { CreateParametroInput, UpdateParametroInput } from '../lib/validators';

export interface Parametro {
  id: string;
  chave: string;
  valor: string;
  created_at: string;
  updated_at: string;
}

export class ParametroService {
  static async getAll(): Promise<Parametro[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client não está inicializado');
      }

      const { data, error } = await supabase
        .from('parametros')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar parâmetros:', error);
        throw new Error(`Erro ao buscar parâmetros: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço getAll:', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<Parametro | null> {
    try {
      if (!supabase) {
        throw new Error('Supabase client não está inicializado');
      }

      const { data, error } = await supabase
        .from('parametros')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Não encontrado
        }
        console.error('Erro ao buscar parâmetro por ID:', error);
        throw new Error(`Erro ao buscar parâmetro: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço getById:', error);
      throw error;
    }
  }

  static async getByChave(chave: string): Promise<Parametro | null> {
    try {
      if (!supabase) {
        throw new Error('Supabase client não está inicializado');
      }

      const { data, error } = await supabase
        .from('parametros')
        .select('*')
        .eq('chave', chave)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Não encontrado
        }
        console.error('Erro ao buscar parâmetro por chave:', error);
        throw new Error(`Erro ao buscar parâmetro por chave: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço getByChave:', error);
      throw error;
    }
  }

  static async create(parametroData: CreateParametroInput): Promise<Parametro> {
    try {
      if (!supabase) {
        throw new Error('Supabase client não está inicializado');
      }

      const { data, error } = await supabase
        .from('parametros')
        .insert([parametroData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar parâmetro:', error);
        throw new Error(`Erro ao criar parâmetro: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço create:', error);
      throw error;
    }
  }

  static async update(id: string, updateData: UpdateParametroInput): Promise<Parametro | null> {
    try {
      if (!supabase) {
        throw new Error('Supabase client não está inicializado');
      }

      const { data, error } = await supabase
        .from('parametros')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Não encontrado
        }
        console.error('Erro ao atualizar parâmetro:', error);
        throw new Error(`Erro ao atualizar parâmetro: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço update:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      if (!supabase) {
        throw new Error('Supabase client não está inicializado');
      }

      const { error } = await supabase
        .from('parametros')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar parâmetro:', error);
        throw new Error(`Erro ao deletar parâmetro: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro no serviço delete:', error);
      throw error;
    }
  }
}