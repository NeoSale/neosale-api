import { supabase } from '../lib/supabase';
import { randomUUID } from 'node:crypto';

// Interface para convites
export interface Convite {
  id: string;
  email: string;
  telefone?: string;
  nome?: string;
  token: string;
  perfil_id?: string;
  tipo_acesso_id?: string;
  cliente_id?: string;
  revendedor_id?: string;
  convidado_por: string;
  status: 'pendente' | 'aceito' | 'expirado' | 'cancelado';
  expira_em: string;
  aceito_em?: string;
  usuario_criado_id?: string;
  mensagem_personalizada?: string;
  enviado_email: boolean;
  enviado_whatsapp: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateConviteInput {
  email: string;
  telefone?: string;
  nome?: string;
  perfil_id?: string;
  tipo_acesso_id?: string;
  cliente_id?: string;
  revendedor_id?: string;
  convidado_por: string;
  mensagem_personalizada?: string;
  dias_expiracao?: number;
}

export class ConviteService {
  static async getAll(convidadoPor?: string): Promise<Convite[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    let query = supabase
      .from('convites')
      .select('*')
      .order('created_at', { ascending: false });

    if (convidadoPor) {
      query = query.eq('convidado_por', convidadoPor);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar convites: ${error.message}`);
    }

    return data || [];
  }

  static async getById(id: string): Promise<Convite | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('convites')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar convite: ${error.message}`);
    }

    return data;
  }

  static async getByToken(token: string): Promise<Convite | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('convites')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar convite por token: ${error.message}`);
    }

    return data;
  }

  static async create(input: CreateConviteInput): Promise<Convite> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Gerar token único
    const token = randomUUID();

    // Calcular data de expiração (padrão: 7 dias)
    const diasExpiracao = input.dias_expiracao || 7;
    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + diasExpiracao);

    const { data, error } = await supabase
      .from('convites')
      .insert({
        email: input.email,
        telefone: input.telefone,
        nome: input.nome,
        token,
        perfil_id: input.perfil_id,
        tipo_acesso_id: input.tipo_acesso_id,
        cliente_id: input.cliente_id,
        revendedor_id: input.revendedor_id,
        convidado_por: input.convidado_por,
        mensagem_personalizada: input.mensagem_personalizada,
        status: 'pendente',
        expira_em: expiraEm.toISOString(),
        enviado_email: false,
        enviado_whatsapp: false,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar convite: ${error.message}`);
    }

    return data;
  }

  static async validarToken(token: string): Promise<{
    valido: boolean;
    convite?: Convite;
    mensagem?: string;
  }> {
    const convite = await this.getByToken(token);

    if (!convite) {
      return {
        valido: false,
        mensagem: 'Convite não encontrado'
      };
    }

    if (convite.status !== 'pendente') {
      return {
        valido: false,
        convite,
        mensagem: `Convite já foi ${convite.status}`
      };
    }

    const agora = new Date();
    const expiraEm = new Date(convite.expira_em);

    if (agora > expiraEm) {
      // Marcar como expirado
      await this.marcarComoExpirado(convite.id);
      return {
        valido: false,
        convite,
        mensagem: 'Convite expirado'
      };
    }

    return {
      valido: true,
      convite
    };
  }

  static async aceitar(id: string, usuarioCriadoId: string): Promise<Convite> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('convites')
      .update({
        status: 'aceito',
        aceito_em: new Date().toISOString(),
        usuario_criado_id: usuarioCriadoId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao aceitar convite: ${error.message}`);
    }

    return data;
  }

  static async cancelar(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('convites')
      .update({
        status: 'cancelado',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao cancelar convite: ${error.message}`);
    }
  }

  static async marcarComoExpirado(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('convites')
      .update({
        status: 'expirado',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao marcar convite como expirado: ${error.message}`);
    }
  }

  static async marcarEmailEnviado(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('convites')
      .update({
        enviado_email: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao marcar email como enviado: ${error.message}`);
    }
  }

  static async marcarWhatsAppEnviado(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('convites')
      .update({
        enviado_whatsapp: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao marcar WhatsApp como enviado: ${error.message}`);
    }
  }

  static async limparExpirados(): Promise<number> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase.rpc('limpar_convites_expirados');

    if (error) {
      throw new Error(`Erro ao limpar convites expirados: ${error.message}`);
    }

    return data || 0;
  }

  static gerarLinkConvite(token: string, frontendUrl?: string): string {
    const baseUrl = frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3001';
    return `${baseUrl}/convite/${token}`;
  }
}
