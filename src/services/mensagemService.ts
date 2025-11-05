import { supabase } from '../lib/supabase';
import { generateMensagemEmbedding } from '../lib/embedding';

export interface Mensagem {
  id?: string;
  nome?: string;
  intervalo_numero: number;
  intervalo_tipo: 'minutos' | 'horas' | 'dias';
  texto_mensagem: string;
  ordem?: number;
  ativo?: boolean;
  deletado?: boolean;
  embedding?: number[];
  cliente_id?: string;
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
  embedding?: number[];
  cliente_id?: string;
}

export interface AtualizarMensagemData {
  nome?: string;
  intervalo_numero?: number;
  intervalo_tipo?: 'minutos' | 'horas' | 'dias';
  texto_mensagem?: string;
  ordem?: number;
  ativo?: boolean;
  embedding?: number[];
  cliente_id?: string;
}

export const mensagemService = {
  async criar(data: CriarMensagemData): Promise<Mensagem> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }
    
    // Se ordem não foi fornecida, buscar a próxima ordem disponível por cliente
    let ordem = data.ordem;
    if (ordem === undefined) {
      const { data: ultimaMensagem } = await supabase
        .from('mensagens')
        .select('ordem')
        .eq('cliente_id', data.cliente_id)
        .order('ordem', { ascending: false })
        .limit(1)
        .single();
      
      ordem = ultimaMensagem?.ordem ? ultimaMensagem.ordem + 1 : 1;
    }
    
    // Gerar embedding para a mensagem
    const embedding = data.embedding || await generateMensagemEmbedding(data);
    
    const { data: mensagem, error } = await supabase
      .from('mensagens')
      .insert({
        nome: data.nome,
        intervalo_numero: data.intervalo_numero,
        intervalo_tipo: data.intervalo_tipo,
        texto_mensagem: data.texto_mensagem,
        ordem: ordem,
        ativo: data.ativo !== undefined ? data.ativo : true,
        deletado: false,
        cliente_id: data.cliente_id || null,
        embedding: embedding
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar mensagem: ${error.message}`);
    }

    return mensagem;
  },

  async listarTodas(clienteId?: string): Promise<Mensagem[]> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }
    
    let query = supabase
      .from('mensagens')
      .select('*')
      .eq('ativo', true)
      .eq('deletado', false)
    
    if (clienteId) {
      query = query.eq('cliente_id', clienteId)
    }
    
    const { data: mensagens, error } = await query.order('ordem', { ascending: true });

    if (error) {
      throw new Error(`Erro ao listar mensagens: ${error.message}`);
    }

    return mensagens || [];
  },

  async listarTodasIncluindoInativas(clienteId?: string): Promise<Mensagem[]> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }
    
    let query = supabase
      .from('mensagens')
      .select('*')
      .eq('deletado', false)
    
    if (clienteId) {
      query = query.eq('cliente_id', clienteId)
    }
    
    const { data: mensagens, error } = await query
      .order('ativo', { ascending: false })
      .order('ordem', { ascending: true });

    if (error) {
      throw new Error(`Erro ao listar todas as mensagens: ${error.message}`);
    }

    return mensagens || [];
  },

  async ativarDesativar(id: string, ativo: boolean, clienteId: string): Promise<Mensagem | null> {
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
      .eq('cliente_id', clienteId)
      .eq('deletado', false)
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

  async buscarPorId(id: string, clienteId?: string): Promise<Mensagem | null> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }
    
    let query = supabase
      .from('mensagens')
      .select('*')
      .eq('id', id)
      .eq('deletado', false);
    
    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }
    
    const { data: mensagem, error } = await query.single();

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
    
    // Buscar dados atuais da mensagem
    const { data: mensagemAtual } = await supabase
      .from('mensagens')
      .select('*')
      .eq('id', id)
      .eq('cliente_id', data.cliente_id)
      .eq('deletado', false)
      .single();
    
    if (!mensagemAtual) {
      return null; // Mensagem não encontrada
    }
    
    const updateData: any = {
      ...data,
      updated_at: new Date().toISOString()
    };
    
    // Se a ordem está sendo alterada, reorganizar outras mensagens do mesmo cliente
    if (data.ordem !== undefined && data.ordem !== mensagemAtual.ordem) {
      const ordemAntiga = mensagemAtual.ordem;
      const novaOrdem = data.ordem;
      
      if (novaOrdem > ordemAntiga) {
        // Movendo para baixo: decrementar ordem das mensagens entre a posição antiga e nova
        await supabase
          .from('mensagens')
          .update({ 
            ordem: supabase.rpc('decrement_ordem'),
            updated_at: new Date().toISOString()
          })
          .eq('cliente_id', data.cliente_id)
          .gt('ordem', ordemAntiga)
          .lte('ordem', novaOrdem)
          .neq('id', id);
      } else {
        // Movendo para cima: incrementar ordem das mensagens entre a nova posição e antiga
        await supabase
          .from('mensagens')
          .update({ 
            ordem: supabase.rpc('increment_ordem'),
            updated_at: new Date().toISOString()
          })
          .eq('cliente_id', data.cliente_id)
          .gte('ordem', novaOrdem)
          .lt('ordem', ordemAntiga)
          .neq('id', id);
      }
    }
    
    // Gerar embedding se houver mudanças no conteúdo
    if (data.texto_mensagem || data.nome) {
      const dadosCompletos = { ...mensagemAtual, ...data };
      updateData.embedding = await generateMensagemEmbedding(dadosCompletos);
    }

    const { data: mensagem, error } = await supabase
      .from('mensagens')
      .update(updateData)
      .eq('id', id)
      .eq('cliente_id', data.cliente_id)
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

  async deletar(id: string, clienteId: string): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }
    
    // Primeiro verifica se a mensagem existe e não está deletada
    const { data: mensagemExistente } = await supabase
      .from('mensagens')
      .select('id, deletado')
      .eq('id', id)
      .eq('cliente_id', clienteId)
      .eq('deletado', false)
      .single();

    if (!mensagemExistente) {
      return false; // Mensagem não encontrada ou já deletada
    }
    
    // Soft delete - marca a mensagem como deletada
    const { error } = await supabase
      .from('mensagens')
      .update({
        deletado: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('cliente_id', clienteId);

    if (error) {
      throw new Error(`Erro ao deletar mensagem: ${error.message}`);
    }

    return true;
  },

  async buscarPorTexto(texto: string, clienteId?: string): Promise<Mensagem[]> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }
    
    // Busca simples por texto (pode ser melhorada com busca semântica usando embeddings)
    let query = supabase
      .from('mensagens')
      .select('*')
      .eq('ativo', true)
      .eq('deletado', false)
      .or(`texto_mensagem.ilike.%${texto}%,nome.ilike.%${texto}%`);
    
    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }
    
    const { data: mensagens, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar mensagens por texto: ${error.message}`);
    }

    return mensagens || [];
  },

  async duplicar(id: string, clienteId: string): Promise<Mensagem> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }
    
    // Primeiro busca a mensagem original
    const mensagemOriginal = await this.buscarPorId(id, clienteId);
    
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
      texto_mensagem: mensagemOriginal.texto_mensagem,
      cliente_id: clienteId
      // ordem será automaticamente definida pelo método criar
    };
    
    return await this.criar(dadosDuplicacao);
  }
};