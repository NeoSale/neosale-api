import { supabase } from '../lib/supabase';

export interface Mensagem {
  id?: string;
  nome?: string;
  intervalo_numero: number;
  intervalo_tipo: 'minutos' | 'horas' | 'dias';
  texto_mensagem: string;
  ordem?: number;
  ativo?: boolean;
  embedding?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface CriarMensagemData {
  nome?: string;
  intervalo_numero: number;
  intervalo_tipo: 'minutos' | 'horas' | 'dias';
  texto_mensagem: string;
  ordem?: number;
  ativo?: boolean;
}

export interface AtualizarMensagemData {
  nome?: string;
  intervalo_numero?: number;
  intervalo_tipo?: 'minutos' | 'horas' | 'dias';
  texto_mensagem?: string;
  ordem?: number;
  ativo?: boolean;
}

export const mensagemService = {
  async criar(data: CriarMensagemData): Promise<Mensagem> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }
    
    // Se ordem não foi fornecida, buscar a próxima ordem disponível
    let ordem = data.ordem;
    if (ordem === undefined) {
      const { data: ultimaMensagem } = await supabase
        .from('mensagens')
        .select('ordem')
        .order('ordem', { ascending: false })
        .limit(1)
        .single();
      
      ordem = ultimaMensagem?.ordem ? ultimaMensagem.ordem + 1 : 1;
    }
    
    const { data: mensagem, error } = await supabase
      .from('mensagens')
      .insert({
        nome: data.nome,
        intervalo_numero: data.intervalo_numero,
        intervalo_tipo: data.intervalo_tipo,
        texto_mensagem: data.texto_mensagem,
        ordem: ordem,
        ativo: data.ativo !== undefined ? data.ativo : true
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar mensagem: ${error.message}`);
    }

    return mensagem;
  },

  async listarTodas(): Promise<Mensagem[]> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }
    
    const { data: mensagens, error } = await supabase
      .from('mensagens')
      .select('*')
      .eq('ativo', true)
      .order('ordem', { ascending: true });

    if (error) {
      throw new Error(`Erro ao listar mensagens: ${error.message}`);
    }

    return mensagens || [];
  },

  async listarTodasIncluindoInativas(): Promise<Mensagem[]> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }
    
    const { data: mensagens, error } = await supabase
      .from('mensagens')
      .select('*')
      .order('ativo', { ascending: false })
      .order('ordem', { ascending: true });

    if (error) {
      throw new Error(`Erro ao listar todas as mensagens: ${error.message}`);
    }

    return mensagens || [];
  },

  async ativarDesativar(id: string, ativo: boolean): Promise<Mensagem | null> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }
    
    const { data: mensagem, error } = await supabase
      .from('mensagens')
      .update({ 
        ativo: ativo,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      throw new Error(`Erro ao ${ativo ? 'ativar' : 'desativar'} mensagem: ${error.message}`);
    }

    return mensagem;
  },

  async buscarPorId(id: string): Promise<Mensagem | null> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }
    
    const { data: mensagem, error } = await supabase
      .from('mensagens')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      throw new Error(`Erro ao buscar mensagem: ${error.message}`);
    }

    return mensagem;
  },

  async atualizar(id: string, data: AtualizarMensagemData): Promise<Mensagem | null> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }
    
    const updateData: any = {
      ...data,
      updated_at: new Date().toISOString()
    };

    const { data: mensagem, error } = await supabase
      .from('mensagens')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      throw new Error(`Erro ao atualizar mensagem: ${error.message}`);
    }

    return mensagem;
  },

  async deletar(id: string): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }
    
    // Primeiro verifica se a mensagem existe
    const { data: mensagemExistente } = await supabase
      .from('mensagens')
      .select('id')
      .eq('id', id)
      .single();

    if (!mensagemExistente) {
      return false; // Mensagem não encontrada
    }
    
    // Hard delete - remove a mensagem permanentemente
    const { error } = await supabase
      .from('mensagens')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar mensagem: ${error.message}`);
    }

    return true;
  },

  async buscarPorTexto(texto: string): Promise<Mensagem[]> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }
    
    // Busca simples por texto (pode ser melhorada com busca semântica usando embeddings)
    const { data: mensagens, error } = await supabase
      .from('mensagens')
      .select('*')
      .eq('ativo', true)
      .or(`texto_mensagem.ilike.%${texto}%,nome.ilike.%${texto}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar mensagens por texto: ${error.message}`);
    }

    return mensagens || [];
  },

  async duplicar(id: string): Promise<Mensagem> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }
    
    // Primeiro busca a mensagem original
    const mensagemOriginal = await this.buscarPorId(id);
    
    if (!mensagemOriginal) {
      throw new Error('Mensagem não encontrada');
    }
    
    // Cria uma nova mensagem baseada na original
    const novoNome = mensagemOriginal.nome 
      ? `${mensagemOriginal.nome} (Cópia)` 
      : 'Mensagem (Cópia)';
    
    const dadosDuplicacao: CriarMensagemData = {
      nome: novoNome,
      intervalo_numero: mensagemOriginal.intervalo_numero,
      intervalo_tipo: mensagemOriginal.intervalo_tipo,
      texto_mensagem: mensagemOriginal.texto_mensagem
      // ordem será automaticamente definida pelo método criar
    };
    
    return await this.criar(dadosDuplicacao);
  }
};