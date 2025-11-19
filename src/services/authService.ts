import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { EmailService } from './emailService';

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

  /**
   * Solicitar reset de senha
   * Gera token e envia email
   */
  static async forgotPassword(email: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Buscar usuário por email
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, ativo')
      .eq('email', email)
      .single();

    // Por segurança, não revelar se o email existe ou não
    // Sempre retornar sucesso
    if (error || !usuario) {
      console.log(`Tentativa de reset para email não cadastrado: ${email}`);
      return;
    }

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      console.log(`Tentativa de reset para usuário inativo: ${email}`);
      return;
    }

    // Gerar token único
    const token = randomUUID();

    // Calcular data de expiração (1 hora)
    const expiraEm = new Date();
    expiraEm.setHours(expiraEm.getHours() + 1);

    // Salvar token no banco
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        usuario_id: usuario.id,
        token,
        expira_em: expiraEm.toISOString(),
        usado: false,
        updated_at: new Date().toISOString()
      });

    if (tokenError) {
      console.error('Erro ao criar token de reset:', tokenError);
      throw new Error('Erro ao processar solicitação de reset de senha');
    }

    // Enviar email
    try {
      await EmailService.enviarEmailResetSenha(usuario.email, usuario.nome, token);
      console.log(`✅ Email de reset enviado para: ${usuario.email}`);
    } catch (emailError) {
      console.error('Erro ao enviar email de reset:', emailError);
      // Não lançar erro, pois o token já foi criado
    }

    // Registrar log
    await this.registrarLogAutenticacao(
      usuario.id,
      'reset_senha_solicitado',
      'Solicitação de reset de senha'
    );
  }

  /**
   * Validar token de reset
   */
  static async validarTokenReset(token: string): Promise<{
    valido: boolean;
    usuario_id?: string;
    mensagem?: string;
  }> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Buscar token
    const { data: tokenData, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !tokenData) {
      return {
        valido: false,
        mensagem: 'Token inválido ou expirado'
      };
    }

    // Verificar se já foi usado
    if (tokenData.usado) {
      return {
        valido: false,
        mensagem: 'Token já foi utilizado'
      };
    }

    // Verificar expiração
    const agora = new Date();
    const expiraEm = new Date(tokenData.expira_em);

    if (agora > expiraEm) {
      return {
        valido: false,
        mensagem: 'Token expirado'
      };
    }

    return {
      valido: true,
      usuario_id: tokenData.usuario_id
    };
  }

  /**
   * Redefinir senha
   */
  static async resetPassword(token: string, novaSenha: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Validar token
    const validacao = await this.validarTokenReset(token);

    if (!validacao.valido) {
      throw new Error(validacao.mensagem || 'Token inválido');
    }

    // Hash da nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha do usuário
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({
        senha: senhaHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', validacao.usuario_id);

    if (updateError) {
      throw new Error('Erro ao atualizar senha');
    }

    // Marcar token como usado
    await supabase
      .from('password_reset_tokens')
      .update({
        usado: true,
        usado_em: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('token', token);

    // Invalidar todas as sessões do usuário
    await supabase
      .from('sessoes')
      .update({ ativo: false })
      .eq('usuario_id', validacao.usuario_id);

    // Registrar log
    await this.registrarLogAutenticacao(
      validacao.usuario_id!,
      'reset_senha_sucesso',
      'Senha redefinida com sucesso'
    );

    console.log(`✅ Senha redefinida com sucesso para usuário: ${validacao.usuario_id}`);
  }
}
