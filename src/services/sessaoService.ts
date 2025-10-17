import { supabase } from '../lib/supabase';

export interface Sessao {
  id: string;
  usuario_id: string;
  token: string;
  refresh_token?: string;
  ip_address?: string;
  user_agent?: string;
  dispositivo?: string;
  navegador?: string;
  sistema_operacional?: string;
  expira_em: string;
  refresh_expira_em?: string;
  ativo: boolean;
  ultimo_acesso: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSessaoInput {
  usuario_id: string;
  token: string;
  refresh_token?: string;
  ip_address?: string;
  user_agent?: string;
  dispositivo?: string;
  navegador?: string;
  sistema_operacional?: string;
  expira_em: Date;
  refresh_expira_em?: Date;
}

export class SessaoService {
  static async getByUsuario(usuarioId: string): Promise<Sessao[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('sessoes')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar sessões: ${error.message}`);
    }

    return data || [];
  }

  static async getById(id: string): Promise<Sessao | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('sessoes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar sessão: ${error.message}`);
    }

    return data;
  }

  static async getByToken(token: string): Promise<Sessao | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('sessoes')
      .select('*')
      .eq('token', token)
      .eq('ativo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar sessão por token: ${error.message}`);
    }

    return data;
  }

  static async getByRefreshToken(refreshToken: string): Promise<Sessao | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('sessoes')
      .select('*')
      .eq('refresh_token', refreshToken)
      .eq('ativo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar sessão por refresh token: ${error.message}`);
    }

    return data;
  }

  static async create(input: CreateSessaoInput): Promise<Sessao> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('sessoes')
      .insert({
        usuario_id: input.usuario_id,
        token: input.token,
        refresh_token: input.refresh_token,
        ip_address: input.ip_address,
        user_agent: input.user_agent,
        dispositivo: input.dispositivo,
        navegador: input.navegador,
        sistema_operacional: input.sistema_operacional,
        expira_em: input.expira_em.toISOString(),
        refresh_expira_em: input.refresh_expira_em?.toISOString(),
        ativo: true,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar sessão: ${error.message}`);
    }

    return data;
  }

  static async atualizarUltimoAcesso(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('sessoes')
      .update({
        ultimo_acesso: new Date().toISOString(),
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao atualizar último acesso: ${error.message}`);
    }
  }

  static async encerrar(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('sessoes')
      .update({
        ativo: false,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao encerrar sessão: ${error.message}`);
    }
  }

  static async encerrarPorToken(token: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('sessoes')
      .update({
        ativo: false,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .eq('token', token);

    if (error) {
      throw new Error(`Erro ao encerrar sessão por token: ${error.message}`);
    }
  }

  static async encerrarTodasDoUsuario(usuarioId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('sessoes')
      .update({
        ativo: false,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .eq('usuario_id', usuarioId)
      .eq('ativo', true);

    if (error) {
      throw new Error(`Erro ao encerrar todas as sessões: ${error.message}`);
    }
  }

  static async validarSessao(token: string): Promise<{
    valida: boolean;
    sessao?: Sessao;
    mensagem?: string;
  }> {
    const sessao = await this.getByToken(token);

    if (!sessao) {
      return {
        valida: false,
        mensagem: 'Sessão não encontrada'
      };
    }

    if (!sessao.ativo) {
      return {
        valida: false,
        sessao,
        mensagem: 'Sessão inativa'
      };
    }

    const agora = new Date();
    const expiraEm = new Date(sessao.expira_em);

    if (agora > expiraEm) {
      // Encerrar sessão expirada
      await this.encerrar(sessao.id);
      return {
        valida: false,
        sessao,
        mensagem: 'Sessão expirada'
      };
    }

    // Atualizar último acesso
    await this.atualizarUltimoAcesso(sessao.id);

    return {
      valida: true,
      sessao
    };
  }

  static async limparExpiradas(): Promise<number> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase.rpc('limpar_sessoes_expiradas');

    if (error) {
      throw new Error(`Erro ao limpar sessões expiradas: ${error.message}`);
    }

    return data || 0;
  }

  static async renovarToken(
    refreshToken: string,
    novoToken: string,
    novaExpiracao: Date
  ): Promise<Sessao> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const sessao = await this.getByRefreshToken(refreshToken);
    if (!sessao) {
      throw new Error('Sessão não encontrada');
    }

    // Verificar se refresh token está expirado
    if (sessao.refresh_expira_em) {
      const agora = new Date();
      const refreshExpiraEm = new Date(sessao.refresh_expira_em);
      if (agora > refreshExpiraEm) {
        await this.encerrar(sessao.id);
        throw new Error('Refresh token expirado');
      }
    }

    const { data, error } = await supabase
      .from('sessoes')
      .update({
        token: novoToken,
        expira_em: novaExpiracao.toISOString(),
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .eq('id', sessao.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao renovar token: ${error.message}`);
    }

    return data;
  }
}
