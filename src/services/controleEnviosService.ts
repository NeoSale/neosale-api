import { supabase } from '../lib/supabase'
import { ParametroService } from './parametroService'

export interface ControleEnvio {
  id: string
  cliente_id: string
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
  static async getAllControleEnvios(clienteId?: string): Promise<ControleEnvio[]> {
    ControleEnviosService.checkSupabaseConnection();
    console.log('🔄 Buscando todos os registros de controle de envios')
    
    let query = supabase!
      .from('controle_envios_diarios')
      .select('*');

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query.order('data', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar controle de envios:', error)
      throw error
    }
    
    console.log('✅ Controle de envios encontrados:', data?.length || 0)
    return data || []
  }
  
  // Buscar controle de envio por data específica
  static async getControleEnvioByDate(data: string, clienteId?: string): Promise<ControleEnvio> {
    ControleEnviosService.checkSupabaseConnection();
    console.log('🔄 Buscando controle de envio para data:', data)
    
    let query = supabase!
      .from('controle_envios_diarios')
      .select('*')
      .eq('data', data);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data: controleEnvio, error } = await query.single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Erro ao buscar controle de envio:', error)
      throw error
    }
    
    // Se não encontrou o registro, criar um novo
    if (!controleEnvio) {
      console.log('📝 Registro não encontrado, criando novo para data:', data)
      return await this.createControleEnvio(data, clienteId)
    }
    
    console.log('✅ Controle de envio encontrado:', controleEnvio.id)
    return controleEnvio
  }
  
  // Criar novo registro de controle de envio
  static async createControleEnvio(data: string, clienteId?: string): Promise<ControleEnvio> {
    ControleEnviosService.checkSupabaseConnection();
    console.log('🔄 Criando novo controle de envio para data:', data)
    
    // Pegar o limite diário padrão do endpoint de configurações
    let limiteDiarioPadrao = 0; // valor padrão caso não encontre a configuração
    
    try {
      const parametroLimite = await ParametroService.getByChave('quantidade_diaria_maxima');
    if (parametroLimite && parametroLimite.valor) {
      limiteDiarioPadrao = parseInt(parametroLimite.valor);
        console.log('✅ Limite diário obtido das configurações:', limiteDiarioPadrao);
      } else {
        console.log('⚠️ Configuração quantidade_diaria_maxima não encontrada, usando valor padrão:', limiteDiarioPadrao);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar configuração quantidade_diaria_maxima:', error);
      console.log('⚠️ Usando valor padrão:', limiteDiarioPadrao);
    }
    
    const insertData: any = {
      data: data,
      quantidade_enviada: 0,
      limite_diario: limiteDiarioPadrao
    };

    if (clienteId) {
      insertData.cliente_id = clienteId;
    }
    
    const { data: novoControleEnvio, error } = await supabase!
      .from('controle_envios_diarios')
      .insert(insertData)
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
  static async updateQuantidadeEnviada(data: string, novaQuantidade: number, clienteId?: string): Promise<ControleEnvio> {
    ControleEnviosService.checkSupabaseConnection();
    console.log('🔄 Atualizando quantidade enviada para data:', data, 'nova quantidade:', novaQuantidade)
    
    let query = supabase!
      .from('controle_envios_diarios')
      .update({ quantidade_enviada: novaQuantidade })
      .eq('data', data);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data: controleAtualizado, error } = await query
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao atualizar quantidade enviada:', error)
      throw error
    }
    
    console.log('✅ Quantidade enviada atualizada com sucesso')
    return controleAtualizado
  }
  
  // Incrementar quantidade enviada
  static async incrementarQuantidadeEnviada(data: string, incremento: number = 1, clienteId?: string): Promise<ControleEnvio> {
    ControleEnviosService.checkSupabaseConnection();
    console.log('🔄 Incrementando quantidade enviada para data:', data, 'incremento:', incremento)
    
    // Primeiro buscar o registro atual
    const controleAtual = await this.getControleEnvioByDate(data, clienteId)
    
    // Incrementar a quantidade
    const novaQuantidade = controleAtual.quantidade_enviada + incremento
    
    return await this.updateQuantidadeEnviada(data, novaQuantidade, clienteId)
  }
  
  // Verificar se pode enviar mensagem (não excedeu limite diário)
  static async podeEnviarMensagem(data: string, clienteId?: string): Promise<{ podeEnviar: boolean; quantidadeRestante: number; limite: number; enviadas: number }> {
    ControleEnviosService.checkSupabaseConnection();
    console.log('🔄 Verificando se pode enviar mensagem para data:', data)
    
    const controleEnvio = await this.getControleEnvioByDate(data, clienteId)
    
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

  // Alterar quantidade enviada para uma data específica
  static async alterarQuantidadeEnviada(data: string, novaQuantidade: number, clienteId?: string): Promise<ControleEnvio> {
    ControleEnviosService.checkSupabaseConnection();
    console.log('🔄 Alterando quantidade enviada para data:', data, 'nova quantidade:', novaQuantidade)
    
    // Validar se a quantidade é válida
    if (novaQuantidade < 0) {
      throw new Error('A quantidade enviada não pode ser negativa')
    }
    
    // Buscar ou criar o registro para a data
    await this.getControleEnvioByDate(data, clienteId)
    
    // Atualizar a quantidade
    return await this.updateQuantidadeEnviada(data, novaQuantidade, clienteId)
  }

  // Alterar limite diário para hoje
  static async alterarLimiteDiario(novoLimite: number, clienteId?: string): Promise<ControleEnvio> {
    ControleEnviosService.checkSupabaseConnection();
    console.log('🔄 Alterando limite diário para:', novoLimite)
    
    // Validar se o limite é válido
    if (novoLimite < 0) {
      throw new Error('O limite diário não pode ser negativo')
    }
    
    // Obter data atual no fuso horário do Brasil
    const agora = new Date()
    const brasilTime = agora.toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo", year: 'numeric', month: '2-digit', day: '2-digit'})
    const hoje = brasilTime.split('/').reverse().join('-') // YYYY-MM-DD
    
    console.log('📅 Data de hoje (Brasil):', hoje)
    
    // Buscar ou criar o registro para hoje
    const controleAtual = await this.getControleEnvioByDate(hoje, clienteId)
    
    // Atualizar apenas o limite diário, mantendo a quantidade enviada atual
    let query = supabase!
      .from('controle_envios_diarios')
      .update({ 
        limite_diario: novoLimite
      })
      .eq('data', hoje);

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data: controleAtualizado, error } = await query
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao atualizar limite diário:', error)
      throw error
    }
    
    console.log('✅ Limite diário atualizado com sucesso')
    return controleAtualizado
  }
}