import { supabase } from '../lib/supabase';
import { CreateTipoAgenteInput, UpdateTipoAgenteInput } from '../lib/validators';

export interface TipoAgente {
  id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export class TipoAgenteService {
  static async getAll(): Promise<TipoAgente[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('tipo_agentes')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar tipos de agente: ${error.message}`);
    }

    return data || [];
  }

  static async getById(id: string): Promise<TipoAgente | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('tipo_agentes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar tipo de agente: ${error.message}`);
    }

    return data;
  }

  static async getByNome(nome: string): Promise<TipoAgente | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('tipo_agentes')
      .select('*')
      .eq('nome', nome)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar tipo de agente por nome: ${error.message}`);
    }

    return data;
  }

  static async create(input: CreateTipoAgenteInput): Promise<TipoAgente> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Verificar se já existe um tipo de agente com o mesmo nome
    const existingTipoAgente = await this.getByNome(input.nome);
    if (existingTipoAgente) {
      throw new Error(`Já existe um tipo de agente com o nome: ${input.nome}`);
    }

    const { data, error } = await supabase
      .from('tipo_agentes')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar tipo de agente: ${error.message}`);
    }

    return data;
  }

  static async update(id: string, input: UpdateTipoAgenteInput): Promise<TipoAgente> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Verificar se o tipo de agente existe
    const existingTipoAgente = await this.getById(id);
    if (!existingTipoAgente) {
      throw new Error('Tipo de agente não encontrado');
    }

    // Se o nome está sendo alterado, verificar se não existe outro com o mesmo nome
    if (input.nome && input.nome !== existingTipoAgente.nome) {
      const tipoAgenteWithSameName = await this.getByNome(input.nome);
      if (tipoAgenteWithSameName) {
        throw new Error(`Já existe um tipo de agente com o nome: ${input.nome}`);
      }
    }

    const { data, error } = await supabase
      .from('tipo_agentes')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar tipo de agente: ${error.message}`);
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Verificar se o tipo de agente existe
    const existingTipoAgente = await this.getById(id);
    if (!existingTipoAgente) {
      throw new Error('Tipo de agente não encontrado');
    }

    const { error } = await supabase
      .from('tipo_agentes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar tipo de agente: ${error.message}`);
    }
  }

  static async getAtivos(): Promise<TipoAgente[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('tipo_agentes')
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar tipos de agente ativos: ${error.message}`);
    }

    return data || [];
  }
}