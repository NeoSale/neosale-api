import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface LoginInput {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    ativo: boolean;
  };
}

export interface TokenPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  /**
   * Realizar login do usuário
   */
  static async login(input: LoginInput): Promise<LoginResponse> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Buscar usuário por email
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, senha, ativo')
      .eq('email', input.email)
      .single();

    if (error || !usuario) {
      throw new Error('Email ou senha inválidos');
    }

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      throw new Error('Usuário inativo. Entre em contato com o administrador.');
    }

    // Verificar se a senha existe
    if (!usuario.senha) {
      throw new Error('Usuário sem senha cadastrada. Use o sistema de convites.');
    }

    // Verificar senha (senha já vem criptografada do frontend)
    // Comparar hash com hash armazenado
    const senhaValida = await bcrypt.compare(input.senha, usuario.senha);

    if (!senhaValida) {
      // Registrar tentativa de login falha
      await this.registrarLogAutenticacao(usuario.id, 'login_falha', 'Senha incorreta');
      throw new Error('Email ou senha inválidos');
    }

    // Gerar token JWT
    // @ts-ignore - Ignorar erro de tipagem do jsonwebtoken
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Salvar sessão
    await this.criarSessao(usuario.id, token);

    // Registrar login bem-sucedido
    await this.registrarLogAutenticacao(usuario.id, 'login_sucesso', 'Login realizado com sucesso');

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        ativo: usuario.ativo
      }
    };
  }

  /**
   * Realizar logout do usuário
   */
  static async logout(token: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Invalidar sessão
    const { error } = await supabase
      .from('sessoes')
      .update({
        ativo: false,
        updated_at: new Date().toISOString()
      })
      .eq('token', token);

    if (error) {
      throw new Error(`Erro ao fazer logout: ${error.message}`);
    }

    // Registrar logout
    try {
      const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
      await this.registrarLogAutenticacao(payload.id, 'logout', 'Logout realizado');
    } catch (err) {
      // Token inválido, mas logout foi feito
    }
  }

  /**
   * Verificar se token é válido
   */
  static async verificarToken(token: string): Promise<TokenPayload> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    try {
      // Verificar JWT
      const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;

      // Verificar se sessão está ativa
      const { data: sessao, error } = await supabase
        .from('sessoes')
        .select('ativo')
        .eq('token', token)
        .eq('ativo', true)
        .single();

      if (error || !sessao) {
        throw new Error('Sessão inválida ou expirada');
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token inválido');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expirado');
      }
      throw error;
    }
  }

  /**
   * Buscar dados do usuário autenticado
   */
  static async getUsuarioAutenticado(usuarioId: string) {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nome,
        email,
        telefone,
        ativo,
        provedor_id,
        tipo_acesso_id,
        revendedor_id,
        cliente_id,
        created_at
      `)
      .eq('id', usuarioId)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }

    return usuario;
  }

  /**
   * Criar sessão
   */
  private static async criarSessao(usuarioId: string, token: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Calcular data de expiração (7 dias)
    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + 7);

    const { error } = await supabase
      .from('sessoes')
      .insert({
        usuario_id: usuarioId,
        token,
        expira_em: expiraEm.toISOString(),
        ativo: true,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao criar sessão:', error);
      // Não lançar erro, apenas logar
    }
  }

  /**
   * Registrar log de autenticação
   */
  private static async registrarLogAutenticacao(
    usuarioId: string,
    evento: string,
    detalhes?: string
  ): Promise<void> {
    if (!supabase) {
      return;
    }

    const { error } = await supabase
      .from('logs_autenticacao')
      .insert({
        usuario_id: usuarioId,
        evento,
        detalhes,
        ip_address: '0.0.0.0', // TODO: Capturar IP real
        user_agent: 'API',
        sucesso: evento.includes('sucesso'),
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao registrar log:', error);
      // Não lançar erro, apenas logar
    }
  }

  /**
   * Refresh token (renovar token)
   */
  static async refreshToken(oldToken: string): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Verificar token antigo
    const payload = await this.verificarToken(oldToken);

    // Gerar novo token
    // @ts-ignore - Ignorar erro de tipagem do jsonwebtoken
    const newToken = jwt.sign(
      {
        id: payload.id,
        email: payload.email
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Invalidar token antigo
    await supabase
      .from('sessoes')
      .update({ ativo: false })
      .eq('token', oldToken);

    // Criar nova sessão
    await this.criarSessao(payload.id, newToken);

    return newToken;
  }
}
