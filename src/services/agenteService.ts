import { supabase } from '../lib/supabase';
import { CreateAgenteInput, UpdateAgenteInput } from '../lib/validators';
import { ParametroService } from './parametroService';
import evolutionApiService from './evolution-api.service';

export interface Agente {
  id: string;
  nome: string;
  cliente_id: string;
  tipo_agente_id: string;
  prompt?: string;
  agendamento: boolean;
  prompt_agendamento?: string;
  prompt_seguranca?: string;
  ativo: boolean;
  deletado: boolean;
  embedding?: number[];
  created_at: string;
  updated_at: string;
  tipo_agente?: {
    id: string;
    nome: string;
    ativo: boolean;
  };
  instancias_evolution_api?: {
    id: string;
    instance_name: string;
    status?: string;
    followup: boolean;
    qtd_envios_diarios: number;
    profileName?: string;
    profilePictureUrl?: string;
    owner?: string;
  }[];
}

export class AgenteService {
  /**
   * Busca todos os agentes de um cliente
   */
  static async getAll(clienteId: string): Promise<Agente[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('agentes')
      .select(`
        *,
        tipo_agente:tipo_agentes(
          id,
          nome,
          ativo
        )
      `)
      .eq('cliente_id', clienteId)
      .eq('deletado', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar agentes: ${error.message}`);
    }

    const agentes = data || [];

    // Para cada agente, buscar as instâncias da evolution_api associadas com dados completos
    const agentesComInstancias = await Promise.all(
      agentes.map(async (agente) => {
        if (!supabase) {
          return {
            ...agente,
            instancias_evolution_api: []
          };
        }

        const { data: instanciasLocais, error: instanciasError } = await supabase
          .from('evolution_api')
          .select('id, instance_name, followup, qtd_envios_diarios')
          .eq('cliente_id', clienteId)
          .eq('id_agente', agente.id);

        if (instanciasError) {
          console.error(`Erro ao buscar instâncias para agente ${agente.id}:`, instanciasError);
          return {
            ...agente,
            instancias_evolution_api: []
          };
        }

        // Se há instâncias, buscar dados completos da Evolution API
        let instanciasCompletas: any[] = [];
        if (instanciasLocais && instanciasLocais.length > 0) {
          try {
            const instanceIds = instanciasLocais.map(inst => inst.id);
            const dadosEvolutionApi = await evolutionApiService.fetchInstancesFromEvolutionApi(instanceIds);
            
            // Mapear para incluir apenas os campos solicitados
            instanciasCompletas = dadosEvolutionApi.map(inst => ({
              instanceId: inst.instanceId,
              instanceName: inst.instanceName,
              followup: inst.followup,
              qtd_envios_diarios: inst.qtd_envios_diarios,
              profileName: inst.profileName,
              profilePictureUrl: inst.profilePictureUrl,
              status: inst.status,
              owner: inst.owner
            }));
          } catch (error) {
            console.error(`Erro ao buscar dados da Evolution API para agente ${agente.id}:`, error);
            // Em caso de erro, retornar apenas dados locais
            instanciasCompletas = instanciasLocais || [];
          }
        }

        return {
          ...agente,
          instancias_evolution_api: instanciasCompletas
        };
      })
    );

    return agentesComInstancias;
  }

  /**
   * Busca um agente por ID
   */
  static async getById(id: string, clienteId: string): Promise<Agente | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('agentes')
      .select(`
        *,
        tipo_agente:tipo_agentes(
          id,
          nome,
          ativo
        )
      `)
      .eq('id', id)
      .eq('cliente_id', clienteId)
      .eq('deletado', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar agente: ${error.message}`);
    }

    return data;
  }

  /**
   * Busca um agente por nome
   */
  static async getByNome(nome: string, clienteId: string): Promise<Agente | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('agentes')
      .select(`
        *,
        tipo_agente:tipo_agentes(
          id,
          nome,
          ativo
        )
      `)
      .eq('nome', nome)
      .eq('cliente_id', clienteId)
      .eq('deletado', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar agente: ${error.message}`);
    }

    return data;
  }

  /**
   * Busca agentes ativos de um cliente
   */
  static async getAtivos(clienteId: string): Promise<Agente[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('agentes')
      .select(`
        *,
        tipo_agente:tipo_agentes(
          id,
          nome,
          ativo
        )
      `)
      .eq('cliente_id', clienteId)
      .eq('ativo', true)
      .eq('deletado', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar agentes ativos: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Busca agentes por tipo de agente
   */
  static async getByTipoAgente(tipoAgenteId: string, clienteId: string): Promise<Agente[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('agentes')
      .select(`
        *,
        tipo_agente:tipo_agentes(
          id,
          nome,
          ativo
        )
      `)
      .eq('cliente_id', clienteId)
      .eq('tipo_agente_id', tipoAgenteId)
      .eq('deletado', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar agentes por tipo: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Busca agentes com agendamento ativo
   */
  static async getComAgendamento(clienteId: string): Promise<Agente[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('agentes')
      .select(`
        *,
        tipo_agente:tipo_agentes(
          id,
          nome,
          ativo
        )
      `)
      .eq('cliente_id', clienteId)
      .eq('agendamento', true)
      .eq('ativo', true)
      .eq('deletado', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar agentes com agendamento: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Cria um novo agente
   */
  static async create(agenteData: CreateAgenteInput & { cliente_id: string }): Promise<Agente> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Verifica se já existe um agente com o mesmo nome para este cliente
    const agenteExistente = await this.getByNome(agenteData.nome, agenteData.cliente_id);
    if (agenteExistente) {
      throw new Error(`Agente com nome '${agenteData.nome}' já existe`);
    }

    // Verifica se o tipo de agente existe
    const { data: tipoAgente, error: tipoError } = await supabase
      .from('tipo_agentes')
      .select('id, nome, ativo')
      .eq('id', agenteData.tipo_agente_id)
      .single();

    if (tipoError || !tipoAgente) {
      throw new Error('Tipo de agente não encontrado');
    }

    if (!tipoAgente.ativo) {
      throw new Error('Não é possível criar agente com tipo de agente inativo');
    }

    // Busca o valor do parâmetro prompt_agendamento_base se não foi fornecido prompt_agendamento
    if (!agenteData.prompt_agendamento) {
      try {
        const parametroBase = await ParametroService.getByChave('prompt_agendamento_base');
        if (parametroBase && parametroBase.valor) {
          agenteData.prompt_agendamento = parametroBase.valor;
        }
      } catch (error) {
        console.warn('Erro ao buscar parâmetro prompt_agendamento_base:', error);
        // Continua sem definir o prompt_agendamento se houver erro
      }
    }

    // Busca o valor do parâmetro prompt_sistema_protecao_agentes se não foi fornecido prompt_seguranca
    if (!agenteData.prompt_seguranca) {
      try {
        const parametroSeguranca = await ParametroService.getByChave('prompt_sistema_protecao_agentes');
        if (parametroSeguranca && parametroSeguranca.valor) {
          agenteData.prompt_seguranca = parametroSeguranca.valor;
        }
      } catch (error) {
        console.warn('Erro ao buscar parâmetro prompt_sistema_protecao_agentes:', error);
        // Continua sem definir o prompt_seguranca se houver erro
      }
    }

    const { data, error } = await supabase
      .from('agentes')
      .insert([agenteData])
      .select(`
        *,
        tipo_agente:tipo_agentes(
          id,
          nome,
          ativo
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar agente: ${error.message}`);
    }

    return data;
  }

  /**
   * Atualiza um agente (marca como deletado e cria novo registro)
   */
  static async update(id: string, clienteId: string, agenteData: UpdateAgenteInput): Promise<Agente | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Verifica se o agente existe
    const agenteExistente = await this.getById(id, clienteId);
    if (!agenteExistente) {
      return null;
    }

    // Se está atualizando o nome, verifica se não existe outro agente com o mesmo nome
    if (agenteData.nome && agenteData.nome !== agenteExistente.nome) {
      const agenteComMesmoNome = await this.getByNome(agenteData.nome, clienteId);
      if (agenteComMesmoNome && agenteComMesmoNome.id !== id) {
        throw new Error(`Agente com nome '${agenteData.nome}' já existe`);
      }
    }

    // Se está atualizando o tipo de agente, verifica se existe e está ativo
    if (agenteData.tipo_agente_id) {
      const { data: tipoAgente, error: tipoError } = await supabase
        .from('tipo_agentes')
        .select('id, nome, ativo')
        .eq('id', agenteData.tipo_agente_id)
        .single();

      if (tipoError || !tipoAgente) {
        throw new Error('Tipo de agente não encontrado');
      }

      if (!tipoAgente.ativo) {
        throw new Error('Não é possível atualizar agente com tipo de agente inativo');
      }
    }

    // Marca o registro atual como deletado
    const { error: deleteError } = await supabase
      .from('agentes')
      .update({ 
        deletado: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('cliente_id', clienteId)
      .eq('deletado', false);

    if (deleteError) {
      throw new Error(`Erro ao marcar agente como deletado: ${deleteError.message}`);
    }

    // Cria um novo registro com os dados atualizados
    const novoAgenteData = {
      nome: agenteData.nome || agenteExistente.nome,
      cliente_id: clienteId,
      tipo_agente_id: agenteData.tipo_agente_id || agenteExistente.tipo_agente_id,
      prompt: agenteData.prompt !== undefined ? agenteData.prompt : agenteExistente.prompt,
      agendamento: agenteData.agendamento !== undefined ? agenteData.agendamento : agenteExistente.agendamento,
      prompt_agendamento: agenteData.prompt_agendamento !== undefined ? agenteData.prompt_agendamento : agenteExistente.prompt_agendamento,
      prompt_seguranca: agenteData.prompt_seguranca !== undefined ? agenteData.prompt_seguranca : agenteExistente.prompt_seguranca,
      ativo: agenteData.ativo !== undefined ? agenteData.ativo : agenteExistente.ativo,
      embedding: agenteExistente.embedding
    };

    return await this.create(novoAgenteData);
  }

  /**
   * Deleta um agente (soft delete)
   */
  static async delete(id: string, clienteId: string): Promise<Agente | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Verifica se o agente existe antes de deletar
    const agenteExistente = await this.getById(id, clienteId);
    if (!agenteExistente) {
      return null;
    }

    const { data, error } = await supabase
      .from('agentes')
      .update({ 
        deletado: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('cliente_id', clienteId)
      .eq('deletado', false)
      .select(`
        *,
        tipo_agente:tipo_agentes(
          id,
          nome,
          ativo
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao deletar agente: ${error.message}`);
    }

    return data;
  }
}