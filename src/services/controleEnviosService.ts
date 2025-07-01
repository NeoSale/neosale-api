import { supabase } from '../lib/supabase'

export interface ControleEnvio {
  id: string
  data: string
  quantidade_enviada: number
  limite_diario: number
  created_at: string
}

export class ControleEnviosService {
  // Verificar se Supabase está configurado
  private static checkSupabaseConnection() {
    if (!supabase) {
      throw new Error('Supabase não está configurado. Configure as credenciais no arquivo .env');
    }
  }

  // Buscar todos os registros de controle de envios
  static async getAllControleEnvios(): Promise<ControleEnvio[]> {
    ControleEnviosService.checkSupabaseConnection();
    console.log('🔄 Buscando todos os registros de controle de envios')
    
    const { data, error } = await supabase!
      .from('controle_envios_diarios')
      .select('*')
      .order('data', { ascending: false })
    
    if (error) {
      console.error('❌ Erro ao buscar controle de envios:', error)
      throw error
    }
    
    console.log('✅ Controle de envios encontrados:', data?.length || 0)
    return data || []
  }
  
  // Buscar controle de envio por data específica
  static async getControleEnvioByDate(data: string): Promise<ControleEnvio> {
    ControleEnviosService.checkSupabaseConnection();
    console.log('🔄 Buscando controle de envio para data:', data)
    
    const { data: controleEnvio, error } = await supabase!
      .from('controle_envios_diarios')
      .select('*')
      .eq('data', data)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Erro ao buscar controle de envio:', error)
      throw error
    }
    
    // Se não encontrou o registro, criar um novo
    if (!controleEnvio) {
      console.log('📝 Registro não encontrado, criando novo para data:', data)
      return await this.createControleEnvio(data)
    }
    
    console.log('✅ Controle de envio encontrado:', controleEnvio.id)
    return controleEnvio
  }
  
  // Criar novo registro de controle de envio
  static async createControleEnvio(data: string): Promise<ControleEnvio> {
    ControleEnviosService.checkSupabaseConnection();
    console.log('🔄 Criando novo controle de envio para data:', data)
    
    // Pegar o limite diário padrão das variáveis de ambiente
    const limiteDiarioPadrao = parseInt(process.env.LIMITE_DIARIO_PADRAO || '30')
    
    const { data: novoControleEnvio, error } = await supabase!
      .from('controle_envios_diarios')
      .insert({
        data: data,
        quantidade_enviada: 0,
        limite_diario: limiteDiarioPadrao
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Erro ao criar controle de envio:', error)
      throw error
    }
    
    console.log('✅ Controle de envio criado com sucesso:', novoControleEnvio.id)
    return novoControleEnvio
  }
  
  // Atualizar quantidade enviada
  static async updateQuantidadeEnviada(data: string, novaQuantidade: number): Promise<ControleEnvio> {
    ControleEnviosService.checkSupabaseConnection();
    console.log('🔄 Atualizando quantidade enviada para data:', data, 'nova quantidade:', novaQuantidade)
    
    const { data: controleAtualizado, error } = await supabase!
      .from('controle_envios_diarios')
      .update({ quantidade_enviada: novaQuantidade })
      .eq('data', data)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Erro ao atualizar quantidade enviada:', error)
      throw error
    }
    
    console.log('✅ Quantidade enviada atualizada com sucesso')
    return controleAtualizado
  }
  
  // Incrementar quantidade enviada
  static async incrementarQuantidadeEnviada(data: string, incremento: number = 1): Promise<ControleEnvio> {
    ControleEnviosService.checkSupabaseConnection();
    console.log('🔄 Incrementando quantidade enviada para data:', data, 'incremento:', incremento)
    
    // Primeiro buscar o registro atual
    const controleAtual = await this.getControleEnvioByDate(data)
    
    // Incrementar a quantidade
    const novaQuantidade = controleAtual.quantidade_enviada + incremento
    
    return await this.updateQuantidadeEnviada(data, novaQuantidade)
  }
  
  // Verificar se pode enviar mensagem (não excedeu limite diário)
  static async podeEnviarMensagem(data: string): Promise<{ podeEnviar: boolean; quantidadeRestante: number; limite: number; enviadas: number }> {
    ControleEnviosService.checkSupabaseConnection();
    console.log('🔄 Verificando se pode enviar mensagem para data:', data)
    
    const controleEnvio = await this.getControleEnvioByDate(data)
    
    const podeEnviar = controleEnvio.quantidade_enviada < controleEnvio.limite_diario
    const quantidadeRestante = controleEnvio.limite_diario - controleEnvio.quantidade_enviada
    
    console.log('✅ Verificação concluída - Pode enviar:', podeEnviar, 'Restante:', quantidadeRestante)
    
    return {
      podeEnviar,
      quantidadeRestante,
      limite: controleEnvio.limite_diario,
      enviadas: controleEnvio.quantidade_enviada
    }
  }
}