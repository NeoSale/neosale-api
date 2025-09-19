import { supabase } from '../lib/supabase'

export class OrigemLeadsService {
  // Verificar conexão com Supabase
  private static checkSupabaseConnection() {
    if (!supabase) {
      throw new Error('Conexão com Supabase não estabelecida')
    }
  }

  // Listar todas as origens de leads
  static async listarOrigens(clienteId?: string) {
    OrigemLeadsService.checkSupabaseConnection();
    console.log('🔄 Listando origens de leads')
    
    try {
      let query = supabase!
        .from('origens_leads')
        .select('*')
      
      if (clienteId) {
        query = query.eq('cliente_id', clienteId)
      }
      
      const { data: origens, error } = await query.order('nome')
      
      if (error) {
        console.error('❌ Erro ao listar origens:', error)
        throw error
      }
      
      console.log('✅ Origens listadas:', origens?.length || 0)
      return origens || []
      
    } catch (error) {
      console.error('❌ Erro ao listar origens:', error)
      throw error
    }
  }

  // Buscar origem por ID
  static async buscarOrigemPorId(id: string, clienteId?: string) {
    OrigemLeadsService.checkSupabaseConnection();
    console.log('🔄 Buscando origem por ID:', id)
    
    try {
      let query = supabase!
        .from('origens_leads')
        .select('*')
        .eq('id', id)
      
      if (clienteId) {
        query = query.eq('cliente_id', clienteId)
      }
      
      const { data: origem, error } = await query.single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('❌ Origem não encontrada:', id)
          return null
        }
        console.error('❌ Erro ao buscar origem:', error)
        throw error
      }
      
      console.log('✅ Origem encontrada:', origem.id)
      return origem
      
    } catch (error) {
      console.error('❌ Erro ao buscar origem:', error)
      throw error
    }
  }

  // Buscar origem por nome
  static async buscarOrigemPorNome(nome: string, clienteId?: string) {
    OrigemLeadsService.checkSupabaseConnection();
    console.log('🔄 Buscando origem por nome:', nome)
    
    try {
      let query = supabase!
        .from('origens_leads')
        .select('*')
        .eq('nome', nome)
      
      if (clienteId) {
        query = query.eq('cliente_id', clienteId)
      }
      
      const { data: origem, error } = await query.single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('❌ Origem não encontrada:', nome)
          return null
        }
        console.error('❌ Erro ao buscar origem:', error)
        throw error
      }
      
      console.log('✅ Origem encontrada:', origem.id)
      return origem
      
    } catch (error) {
      console.error('❌ Erro ao buscar origem:', error)
      throw error
    }
  }

  // Criar nova origem
  static async criarOrigem(data: { nome: string; cliente_id?: string; embedding?: any }) {
    OrigemLeadsService.checkSupabaseConnection();
    console.log('🔄 Criando nova origem:', data.nome)
    
    try {
      const { data: origem, error } = await supabase!
        .from('origens_leads')
        .insert({
          nome: data.nome,
          cliente_id: data.cliente_id || null,
          embedding: data.embedding || null
        })
        .select()
        .single()
      
      if (error) {
        console.error('❌ Erro ao criar origem:', error)
        throw error
      }
      
      console.log('✅ Origem criada com sucesso:', origem.id)
      return origem
      
    } catch (error) {
      console.error('❌ Erro ao criar origem:', error)
      throw error
    }
  }

  // Atualizar origem
  static async atualizarOrigem(id: string, data: { nome?: string; cliente_id?: string; embedding?: any }, clienteId?: string) {
    OrigemLeadsService.checkSupabaseConnection();
    console.log('🔄 Atualizando origem:', id)
    
    try {
      // Verificar se a origem existe e pertence ao cliente
      const origemExistente = await OrigemLeadsService.buscarOrigemPorId(id, clienteId)
      if (!origemExistente) {
        throw new Error('Origem não encontrada')
      }
      
      const updateData: any = {}
      if (data.nome !== undefined) updateData.nome = data.nome
      if (data.cliente_id !== undefined) updateData.cliente_id = data.cliente_id
      if (data.embedding !== undefined) updateData.embedding = data.embedding
      
      let query = supabase!
        .from('origens_leads')
        .update(updateData)
        .eq('id', id)
      
      if (clienteId) {
        query = query.eq('cliente_id', clienteId)
      }
      
      const { data: origem, error } = await query.select().single()
      
      if (error) {
        console.error('❌ Erro ao atualizar origem:', error)
        throw error
      }
      
      console.log('✅ Origem atualizada com sucesso:', origem.id)
      return origem
      
    } catch (error) {
      console.error('❌ Erro ao atualizar origem:', error)
      throw error
    }
  }

  // Deletar origem
  static async deletarOrigem(id: string, clienteId?: string) {
    OrigemLeadsService.checkSupabaseConnection();
    console.log('🔄 Deletando origem:', id)
    
    try {
      // Verificar se a origem existe e pertence ao cliente
      const origemExistente = await OrigemLeadsService.buscarOrigemPorId(id, clienteId)
      if (!origemExistente) {
        throw new Error('Origem não encontrada')
      }
      
      let query = supabase!
        .from('origens_leads')
        .delete()
        .eq('id', id)
      
      if (clienteId) {
        query = query.eq('cliente_id', clienteId)
      }
      
      const { error } = await query
      
      if (error) {
        console.error('❌ Erro ao deletar origem:', error)
        throw error
      }
      
      console.log('✅ Origem deletada com sucesso:', id)
      return { message: 'Origem deletada com sucesso' }
      
    } catch (error) {
      console.error('❌ Erro ao deletar origem:', error)
      throw error
    }
  }

  // Buscar ou criar origem por nome
  static async buscarOuCriarOrigemPorNome(nome: string, cliente_id?: string) {
    OrigemLeadsService.checkSupabaseConnection();
    console.log('🔄 Buscando ou criando origem por nome:', nome)
    
    try {
      // Primeiro, tentar buscar a origem existente
      const origemExistente = await OrigemLeadsService.buscarOrigemPorNome(nome, cliente_id)
      
      if (origemExistente) {
        console.log('✅ Origem encontrada:', origemExistente.id)
        return origemExistente
      }
      
      // Se não encontrou, criar uma nova origem
      console.log('🔄 Origem não encontrada, criando nova origem:', nome)
      const novaOrigem = await OrigemLeadsService.criarOrigem({ nome, cliente_id: cliente_id || '' })
      
      console.log('✅ Nova origem criada com sucesso:', novaOrigem.id)
      return novaOrigem
      
    } catch (error) {
      console.error('❌ Erro ao buscar ou criar origem:', error)
      throw error
    }
  }
}