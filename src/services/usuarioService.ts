import { supabase } from '../lib/supabase';
import { 
  CreateUsuarioInput, 
  UpdateUsuarioInput,
  UpdateUsuarioComRelacionamentosInput,
  CreateUsuarioRevendedorInput,
  CreateUsuarioClienteInput,
  CreateUsuarioPermissaoSistemaInput
} from '../lib/validators';
import { generateUsuarioEmbedding } from '../lib/embedding';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  provedor_id: string;
  ativo: boolean;
  embedding?: number[];
  created_at: string;
  updated_at: string;
}

export interface UsuarioWithRelations extends Usuario {
  provedor?: {
    id: string;
    nome: string;
    descricao?: string;
  };
  revendedores?: Array<{
    id: string;
    nome: string;
    email: string;
  }>;
  clientes?: Array<{
    id: string;
    nome: string;
    email: string;
  }>;
  permissoes_sistema?: Array<{
    id: string;
    permissao: string;
    ativo: boolean;
  }>;
}

export interface UsuarioRevendedor {
  id: string;
  usuario_id: string;
  revendedor_id: string;
  embedding?: number[];
  created_at: string;
  updated_at: string;
}

export interface UsuarioCliente {
  id: string;
  usuario_id: string;
  cliente_id: string;
  embedding?: number[];
  created_at: string;
  updated_at: string;
}

export interface UsuarioPermissaoSistema {
  id: string;
  usuario_id: string;
  permissao: string;
  ativo: boolean;
  embedding?: number[];
  created_at: string;
  updated_at: string;
}

export class UsuarioService {
  static async getAll(): Promise<UsuarioWithRelations[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        provedor:provedores(
          id,
          nome,
          descricao
        )
      `)
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar usuários: ${error.message}`);
    }

    return data || [];
  }

  static async getById(id: string): Promise<UsuarioWithRelations | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        provedor:provedores(
          id,
          nome,
          descricao
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }

    return data;
  }

  static async getByEmail(email: string): Promise<UsuarioWithRelations | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        provedor:provedores(
          id,
          nome,
          descricao
        )
      `)
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar usuário por email: ${error.message}`);
    }

    return data;
  }



  static async getAtivos(): Promise<UsuarioWithRelations[]> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        provedor:provedores(
          id,
          nome,
          descricao
        )
      `)
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar usuários ativos: ${error.message}`);
    }

    return data || [];
  }

  static async create(input: CreateUsuarioInput): Promise<UsuarioWithRelations> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        nome: input.nome,
        email: input.email,
        telefone: input.telefone,
        provedor_id: input.provedor_id,
        ativo: input.ativo ?? true,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .select(`
        *,
        provedor:provedores(
          id,
          nome,
          descricao
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }

    return data;
  }

  static async update(id: string, input: UpdateUsuarioInput): Promise<UsuarioWithRelations> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update({
        ...input,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .eq('id', id)
      .select(`
        *,
        provedor:provedores(
          id,
          nome,
          descricao
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar usuário: ${error.message}`);
    }
  }

  // Métodos para gerenciar relacionamentos múltiplos
  static async getUsuarioComRelacionamentos(id: string, clienteId?: string): Promise<UsuarioWithRelations | null> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    let query = supabase
      .from('usuarios')
      .select(`
        *,
        provedor:provedores(
          id,
          nome,
          descricao
        ),
        usuario_revendedores(
          revendedor:revendedores(
            id,
            nome,
            email
          )
        ),
        usuario_clientes(
          cliente:clientes(
            id,
            nome,
            email
          )
        ),
        usuario_permissoes_sistema(
          id,
          permissao,
          ativo
        )
      `)
      .eq('id', id);

    // Se clienteId for fornecido, verificar se o usuário tem acesso ao cliente
    if (clienteId) {
      const hasAccess = await this.verificarAcessoCliente(id, clienteId);
      if (!hasAccess) {
        throw new Error('Usuário não tem acesso a este cliente');
      }
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }

    // Transformar os dados para o formato esperado
    const usuario = {
      ...data,
      revendedores: data.usuario_revendedores?.map((ur: any) => ur.revendedor) || [],
      clientes: data.usuario_clientes?.map((uc: any) => uc.cliente) || [],
      permissoes_sistema: data.usuario_permissoes_sistema || []
    };

    // Remover as propriedades intermediárias
    delete usuario.usuario_revendedores;
    delete usuario.usuario_clientes;

    return usuario;
  }

  static async updateComRelacionamentos(id: string, input: UpdateUsuarioComRelacionamentosInput): Promise<UsuarioWithRelations> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    // Gerar embedding se necessário
    let embedding = input.embedding;
    if (!embedding && (input.nome || input.email)) {
      const currentUser = await this.getById(id);
      if (currentUser) {
        const userData = {
          nome: input.nome || currentUser.nome,
          email: input.email || currentUser.email,
          telefone: input.telefone || currentUser.telefone
        };
        embedding = await generateUsuarioEmbedding(userData);
      }
    }

    // Atualizar dados básicos do usuário
    const updateData = {
      ...input,
      embedding,
      updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
    };
    
    // Remover arrays de relacionamentos dos dados de atualização
    delete updateData.revendedores;
    delete updateData.clientes;
    delete updateData.permissoes_sistema;

    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (userError) {
      throw new Error(`Erro ao atualizar usuário: ${userError.message}`);
    }

    // Atualizar relacionamentos com revendedores
    if (input.revendedores !== undefined) {
      // Remover relacionamentos existentes
      await supabase
        .from('usuario_revendedores')
        .delete()
        .eq('usuario_id', id);

      // Adicionar novos relacionamentos
      if (input.revendedores.length > 0) {
        const revendedorRelations = input.revendedores.map(revendedorId => ({
          usuario_id: id,
          revendedor_id: revendedorId,
          embedding: embedding
        }));

        const { error: revendedorError } = await supabase
          .from('usuario_revendedores')
          .insert(revendedorRelations);

        if (revendedorError) {
          throw new Error(`Erro ao atualizar relacionamentos com revendedores: ${revendedorError.message}`);
        }
      }
    }

    // Atualizar relacionamentos com clientes
    if (input.clientes !== undefined) {
      // Remover relacionamentos existentes
      await supabase
        .from('usuario_clientes')
        .delete()
        .eq('usuario_id', id);

      // Adicionar novos relacionamentos
      if (input.clientes.length > 0) {
        const clienteRelations = input.clientes.map(clienteId => ({
          usuario_id: id,
          cliente_id: clienteId,
          embedding: embedding
        }));

        const { error: clienteError } = await supabase
          .from('usuario_clientes')
          .insert(clienteRelations);

        if (clienteError) {
          throw new Error(`Erro ao atualizar relacionamentos com clientes: ${clienteError.message}`);
        }
      }
    }

    // Atualizar permissões do sistema
    if (input.permissoes_sistema !== undefined) {
      // Remover permissões existentes
      await supabase
        .from('usuario_permissoes_sistema')
        .delete()
        .eq('usuario_id', id);

      // Adicionar novas permissões
      if (input.permissoes_sistema.length > 0) {
        const permissaoRelations = input.permissoes_sistema.map(permissao => ({
          usuario_id: id,
          permissao: permissao,
          ativo: true,
          embedding: embedding
        }));

        const { error: permissaoError } = await supabase
          .from('usuario_permissoes_sistema')
          .insert(permissaoRelations);

        if (permissaoError) {
          throw new Error(`Erro ao atualizar permissões do sistema: ${permissaoError.message}`);
        }
      }
    }

    // Retornar usuário atualizado com relacionamentos
    const updatedUser = await this.getUsuarioComRelacionamentos(id);
    if (!updatedUser) {
      throw new Error('Usuário não encontrado após atualização');
    }

    return updatedUser;
  }

  // Métodos para verificar acesso
  static async verificarAcessoRevendedor(usuarioId: string, revendedorId: string): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuario_revendedores')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('revendedor_id', revendedorId)
      .single();

    return !error && !!data;
  }

  static async verificarAcessoCliente(usuarioId: string, clienteId: string): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuario_clientes')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('cliente_id', clienteId)
      .single();

    return !error && !!data;
  }

  static async verificarPermissaoSistema(usuarioId: string, permissao: string): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase
      .from('usuario_permissoes_sistema')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('permissao', permissao)
      .eq('ativo', true)
      .single();

    return !error && !!data;
  }

  static async isAdmin(usuarioId: string): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { data, error } = await supabase.rpc('verificar_usuario_admin', {
      p_usuario_id: usuarioId
    });

    if (error) {
      throw new Error(`Erro ao verificar se usuário é admin: ${error.message}`);
    }

    return data || false;
  }

  // Métodos para gerenciar relacionamentos individuais
  static async adicionarRevendedor(input: CreateUsuarioRevendedorInput): Promise<UsuarioRevendedor> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const embedding = input.embedding || await generateUsuarioEmbedding({ usuario_id: input.usuario_id, revendedor_id: input.revendedor_id });

    const { data, error } = await supabase
      .from('usuario_revendedores')
      .insert({
        usuario_id: input.usuario_id,
        revendedor_id: input.revendedor_id,
        embedding,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao adicionar revendedor ao usuário: ${error.message}`);
    }

    return data;
  }

  static async adicionarCliente(input: CreateUsuarioClienteInput): Promise<UsuarioCliente> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const embedding = input.embedding || await generateUsuarioEmbedding({ usuario_id: input.usuario_id, cliente_id: input.cliente_id });

    const { data, error } = await supabase
      .from('usuario_clientes')
      .insert({
        usuario_id: input.usuario_id,
        cliente_id: input.cliente_id,
        embedding,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao adicionar cliente ao usuário: ${error.message}`);
    }

    return data;
  }

  static async adicionarPermissaoSistema(input: CreateUsuarioPermissaoSistemaInput): Promise<UsuarioPermissaoSistema> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const embedding = input.embedding || await generateUsuarioEmbedding({ usuario_id: input.usuario_id, permissao: input.permissao });

    const { data, error } = await supabase
      .from('usuario_permissoes_sistema')
      .insert({
        usuario_id: input.usuario_id,
        permissao: input.permissao,
        ativo: input.ativo ?? true,
        embedding,
        updated_at: new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao adicionar permissão do sistema ao usuário: ${error.message}`);
    }

    return data;
  }

  static async removerRevendedor(usuarioId: string, revendedorId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('usuario_revendedores')
      .delete()
      .eq('usuario_id', usuarioId)
      .eq('revendedor_id', revendedorId);

    if (error) {
      throw new Error(`Erro ao remover revendedor do usuário: ${error.message}`);
    }
  }

  static async removerCliente(usuarioId: string, clienteId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('usuario_clientes')
      .delete()
      .eq('usuario_id', usuarioId)
      .eq('cliente_id', clienteId);

    if (error) {
      throw new Error(`Erro ao remover cliente do usuário: ${error.message}`);
    }
  }

  static async removerPermissaoSistema(usuarioId: string, permissao: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client não está inicializado');
    }

    const { error } = await supabase
      .from('usuario_permissoes_sistema')
      .delete()
      .eq('usuario_id', usuarioId)
      .eq('permissao', permissao);

    if (error) {
      throw new Error(`Erro ao remover permissão do sistema do usuário: ${error.message}`);
    }
  }
}