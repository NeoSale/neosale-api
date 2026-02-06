import { supabase } from '../lib/supabase'
import { LeadNotificationService } from './leadNotificationService'

interface Usuario {
  id: string
  nome: string
  email: string
  telefone?: string
  cliente_id: string
}

interface Lead {
  id: string
  nome: string
  telefone: string
  email?: string
  empresa?: string
  cliente_id: string
  qualificacao_id?: string
}

interface LeadAtribuicao {
  id: string
  lead_id: string
  vendedor_id: string
  atribuido_por?: string
  cliente_id: string
  status: string
  notificado: boolean
  created_at: string
}

interface VendedorContador {
  id: string
  vendedor_id: string
  cliente_id: string
  total_leads: number
  leads_ativos: number
  leads_concluidos: number
  ultima_atribuicao?: string
}

interface VendedorComCarga extends Usuario {
  leads_ativos: number
  ultima_atribuicao?: string
}

export class LeadDistribuicaoService {
  private static checkSupabaseConnection() {
    if (!supabase) {
      throw new Error('Supabase não está configurado')
    }
  }

  // Buscar próximo vendedor com menor carga (round-robin)
  static async buscarProximoVendedor(clienteId: string): Promise<Usuario | null> {
    this.checkSupabaseConnection()
    console.log('🔍 Buscando próximo vendedor para cliente:', clienteId)

    try {
      // Usar função do banco para buscar vendedor
      const { data: vendedorId, error: rpcError } = await supabase!
        .rpc('buscar_proximo_vendedor', { p_cliente_id: clienteId })

      if (rpcError) {
        console.error('❌ Erro ao buscar vendedor via RPC:', rpcError)
        // Fallback: buscar manualmente
        return this.buscarProximoVendedorManual(clienteId)
      }

      if (!vendedorId) {
        console.log('⚠️ Nenhum vendedor disponível')
        return null
      }

      // Buscar dados completos do vendedor
      const { data: vendedor, error } = await supabase!
        .from('usuarios')
        .select('id, nome, email, telefone, cliente_id')
        .eq('id', vendedorId)
        .single()

      if (error) {
        console.error('❌ Erro ao buscar dados do vendedor:', error)
        return null
      }

      console.log('✅ Vendedor encontrado:', vendedor.nome)
      return vendedor
    } catch (error) {
      console.error('❌ Erro ao buscar próximo vendedor:', error)
      return null
    }
  }

  // Fallback: buscar vendedor manualmente
  private static async buscarProximoVendedorManual(clienteId: string): Promise<Usuario | null> {
    console.log('🔄 Buscando vendedor manualmente...')

    try {
      // Buscar vendedores ativos com perfil "Vendedor"
      const { data: vendedores, error } = await supabase!
        .from('usuarios')
        .select(`
          id, nome, email, telefone, cliente_id,
          usuario_perfis!inner(
            perfil_id,
            ativo,
            perfis!inner(nome)
          )
        `)
        .eq('cliente_id', clienteId)
        .eq('ativo', true)
        .eq('usuario_perfis.ativo', true)
        .eq('usuario_perfis.perfis.nome', 'Vendedor')

      if (error || !vendedores?.length) {
        console.log('⚠️ Nenhum vendedor encontrado')
        return null
      }

      // Buscar contadores de cada vendedor
      const vendedorIds = vendedores.map(v => v.id)
      const { data: contadores } = await supabase!
        .from('vendedor_contador_leads')
        .select('*')
        .eq('cliente_id', clienteId)
        .in('vendedor_id', vendedorIds)

      // Mapear contadores por vendedor
      const contadorMap = new Map<string, VendedorContador>()
      contadores?.forEach(c => contadorMap.set(c.vendedor_id, c))

      // Ordenar por menor carga
      const vendedoresOrdenados = vendedores.sort((a, b) => {
        const cargaA = contadorMap.get(a.id)?.leads_ativos || 0
        const cargaB = contadorMap.get(b.id)?.leads_ativos || 0
        return cargaA - cargaB
      })

      const vendedor = vendedoresOrdenados[0]
      console.log('✅ Vendedor encontrado (manual):', vendedor.nome)
      return {
        id: vendedor.id,
        nome: vendedor.nome,
        email: vendedor.email,
        telefone: vendedor.telefone,
        cliente_id: vendedor.cliente_id
      }
    } catch (error) {
      console.error('❌ Erro ao buscar vendedor manualmente:', error)
      return null
    }
  }

  // Atribuir lead a vendedor
  static async atribuirLead(
    leadId: string,
    vendedorId: string,
    clienteId: string,
    atribuidoPor?: string
  ): Promise<LeadAtribuicao | null> {
    this.checkSupabaseConnection()
    console.log('🔄 Atribuindo lead', leadId, 'para vendedor', vendedorId)

    try {
      // Verificar se já existe atribuição ativa
      const { data: existente } = await supabase!
        .from('lead_atribuicoes')
        .select('id')
        .eq('lead_id', leadId)
        .eq('status', 'ativo')
        .single()

      if (existente) {
        console.log('⚠️ Lead já possui atribuição ativa')
        return null
      }

      // Criar atribuição
      const { data: atribuicao, error } = await supabase!
        .from('lead_atribuicoes')
        .insert({
          lead_id: leadId,
          vendedor_id: vendedorId,
          cliente_id: clienteId,
          atribuido_por: atribuidoPor || null,
          status: 'ativo',
          notificado: false
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao criar atribuição:', error)
        throw error
      }

      // Incrementar contador do vendedor
      await supabase!.rpc('incrementar_contador_vendedor', {
        p_vendedor_id: vendedorId,
        p_cliente_id: clienteId
      })

      // Enviar notificação para o vendedor (async, não bloqueia)
      try {
        const { data: lead } = await supabase!
          .from('leads')
          .select('id, nome, telefone, email, empresa')
          .eq('id', leadId)
          .single()

        if (lead) {
          LeadNotificationService.notifyLeadAssignment(
            clienteId,
            vendedorId,
            lead,
            atribuidoPor
          ).then((result) => {
            console.log('🔔 Notificação enviada:', result)
          }).catch((err) => {
            console.error('⚠️ Erro ao enviar notificação:', err)
          })
        }
      } catch (notifError) {
        console.error('⚠️ Erro ao preparar notificação:', notifError)
        // Não falha a atribuição se a notificação falhar
      }

      console.log('✅ Lead atribuído com sucesso')
      return atribuicao
    } catch (error) {
      console.error('❌ Erro ao atribuir lead:', error)
      throw error
    }
  }

  // Transferir lead para outro vendedor
  static async transferirLead(
    leadId: string,
    novoVendedorId: string,
    clienteId: string,
    transferidoPor: string,
    motivo?: string
  ): Promise<LeadAtribuicao | null> {
    this.checkSupabaseConnection()
    console.log('🔄 Transferindo lead', leadId, 'para vendedor', novoVendedorId)

    try {
      // Buscar atribuição ativa atual
      const { data: atribuicaoAtual, error: buscaError } = await supabase!
        .from('lead_atribuicoes')
        .select('*')
        .eq('lead_id', leadId)
        .eq('status', 'ativo')
        .single()

      if (buscaError || !atribuicaoAtual) {
        console.log('⚠️ Nenhuma atribuição ativa encontrada')
        // Criar nova atribuição se não existir
        return this.atribuirLead(leadId, novoVendedorId, clienteId, transferidoPor)
      }

      const vendedorAnteriorId = atribuicaoAtual.vendedor_id

      // Marcar atribuição atual como transferida
      await supabase!
        .from('lead_atribuicoes')
        .update({
          status: 'transferido',
          motivo_transferencia: motivo || 'Transferido por gerente/admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', atribuicaoAtual.id)

      // Decrementar contador do vendedor anterior
      await supabase!.rpc('decrementar_leads_ativos', {
        p_vendedor_id: vendedorAnteriorId,
        p_cliente_id: clienteId,
        p_concluido: false
      })

      // Criar nova atribuição
      const novaAtribuicao = await this.atribuirLead(
        leadId,
        novoVendedorId,
        clienteId,
        transferidoPor
      )

      console.log('✅ Lead transferido com sucesso')
      return novaAtribuicao
    } catch (error) {
      console.error('❌ Erro ao transferir lead:', error)
      throw error
    }
  }

  // Concluir atribuição (venda fechada ou perdida)
  static async concluirAtribuicao(
    leadId: string,
    clienteId: string,
    sucesso: boolean = true
  ): Promise<boolean> {
    this.checkSupabaseConnection()
    console.log('🔄 Concluindo atribuição do lead:', leadId)

    try {
      const { data: atribuicao, error: buscaError } = await supabase!
        .from('lead_atribuicoes')
        .select('*')
        .eq('lead_id', leadId)
        .eq('status', 'ativo')
        .single()

      if (buscaError || !atribuicao) {
        console.log('⚠️ Nenhuma atribuição ativa encontrada')
        return false
      }

      // Atualizar status
      await supabase!
        .from('lead_atribuicoes')
        .update({
          status: 'concluido',
          updated_at: new Date().toISOString()
        })
        .eq('id', atribuicao.id)

      // Decrementar leads ativos e incrementar concluídos
      await supabase!.rpc('decrementar_leads_ativos', {
        p_vendedor_id: atribuicao.vendedor_id,
        p_cliente_id: clienteId,
        p_concluido: sucesso
      })

      console.log('✅ Atribuição concluída')
      return true
    } catch (error) {
      console.error('❌ Erro ao concluir atribuição:', error)
      throw error
    }
  }

  // Marcar como notificado
  static async marcarNotificado(atribuicaoId: string): Promise<boolean> {
    this.checkSupabaseConnection()

    try {
      const { error } = await supabase!
        .from('lead_atribuicoes')
        .update({
          notificado: true,
          notificado_em: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', atribuicaoId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('❌ Erro ao marcar notificado:', error)
      return false
    }
  }

  // Adicionar lead à fila de espera
  static async adicionarFilaEspera(
    leadId: string,
    clienteId: string,
    motivo?: string,
    prioridade: number = 0
  ): Promise<boolean> {
    this.checkSupabaseConnection()
    console.log('🔄 Adicionando lead à fila de espera:', leadId)

    try {
      const { error } = await supabase!
        .from('lead_fila_espera')
        .insert({
          lead_id: leadId,
          cliente_id: clienteId,
          motivo: motivo || 'Sem vendedor disponível',
          prioridade
        })

      if (error) {
        if (error.code === '23505') {
          console.log('⚠️ Lead já está na fila')
          return true
        }
        throw error
      }

      console.log('✅ Lead adicionado à fila')
      return true
    } catch (error) {
      console.error('❌ Erro ao adicionar à fila:', error)
      return false
    }
  }

  // Processar fila de espera
  static async processarFilaEspera(clienteId: string): Promise<number> {
    this.checkSupabaseConnection()
    console.log('🔄 Processando fila de espera para cliente:', clienteId)

    try {
      // Buscar leads na fila
      const { data: fila, error } = await supabase!
        .from('lead_fila_espera')
        .select('*')
        .eq('cliente_id', clienteId)
        .eq('processado', false)
        .order('prioridade', { ascending: false })
        .order('created_at', { ascending: true })

      if (error || !fila?.length) {
        console.log('⚠️ Fila vazia')
        return 0
      }

      let processados = 0

      for (const item of fila) {
        const vendedor = await this.buscarProximoVendedor(clienteId)
        if (!vendedor) {
          console.log('⚠️ Sem vendedores disponíveis, parando processamento')
          break
        }

        await this.atribuirLead(item.lead_id, vendedor.id, clienteId)

        // Marcar como processado
        await supabase!
          .from('lead_fila_espera')
          .update({
            processado: true,
            processado_em: new Date().toISOString()
          })
          .eq('id', item.id)

        processados++
      }

      console.log(`✅ ${processados} leads processados da fila`)
      return processados
    } catch (error) {
      console.error('❌ Erro ao processar fila:', error)
      return 0
    }
  }

  // Listar atribuições de um vendedor
  static async listarAtribuicoesVendedor(
    vendedorId: string,
    clienteId: string,
    status?: string
  ): Promise<LeadAtribuicao[]> {
    this.checkSupabaseConnection()

    try {
      let query = supabase!
        .from('lead_atribuicoes')
        .select(`
          *,
          lead:lead_id(id, nome, telefone, email, empresa, qualificacao:qualificacao_id(nome)),
          atribuidor:atribuido_por(id, nome)
        `)
        .eq('vendedor_id', vendedorId)
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Erro ao listar atribuições:', error)
      return []
    }
  }

  // Listar todas atribuições (para gerente/admin)
  static async listarTodasAtribuicoes(
    clienteId: string,
    filtros?: {
      status?: string
      vendedorId?: string
      dataInicio?: string
      dataFim?: string
    }
  ): Promise<LeadAtribuicao[]> {
    this.checkSupabaseConnection()

    try {
      let query = supabase!
        .from('lead_atribuicoes')
        .select(`
          *,
          lead:lead_id(id, nome, telefone, email, empresa, qualificacao:qualificacao_id(nome)),
          vendedor:vendedor_id(id, nome, email),
          atribuidor:atribuido_por(id, nome)
        `)
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false })

      if (filtros?.status) {
        query = query.eq('status', filtros.status)
      }
      if (filtros?.vendedorId) {
        query = query.eq('vendedor_id', filtros.vendedorId)
      }
      if (filtros?.dataInicio) {
        query = query.gte('created_at', filtros.dataInicio)
      }
      if (filtros?.dataFim) {
        query = query.lte('created_at', filtros.dataFim)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Erro ao listar atribuições:', error)
      return []
    }
  }

  // Dashboard de carga por vendedor
  static async dashboardCargaVendedores(clienteId: string): Promise<VendedorComCarga[]> {
    this.checkSupabaseConnection()

    try {
      // Buscar vendedores com perfil "Vendedor"
      const { data: vendedores, error } = await supabase!
        .from('usuarios')
        .select(`
          id, nome, email, telefone, cliente_id,
          usuario_perfis!inner(perfil_id, ativo, perfis!inner(nome))
        `)
        .eq('cliente_id', clienteId)
        .eq('ativo', true)
        .eq('usuario_perfis.ativo', true)
        .eq('usuario_perfis.perfis.nome', 'Vendedor')

      if (error || !vendedores?.length) {
        return []
      }

      // Buscar contadores
      const vendedorIds = vendedores.map(v => v.id)
      const { data: contadores } = await supabase!
        .from('vendedor_contador_leads')
        .select('*')
        .eq('cliente_id', clienteId)
        .in('vendedor_id', vendedorIds)

      const contadorMap = new Map<string, VendedorContador>()
      contadores?.forEach(c => contadorMap.set(c.vendedor_id, c))

      // Montar resultado
      const resultado: VendedorComCarga[] = vendedores.map(v => {
        const contador = contadorMap.get(v.id)
        return {
          id: v.id,
          nome: v.nome,
          email: v.email,
          telefone: v.telefone,
          cliente_id: v.cliente_id,
          leads_ativos: contador?.leads_ativos || 0,
          ...(contador?.ultima_atribuicao && { ultima_atribuicao: contador.ultima_atribuicao })
        }
      })

      // Ordenar por leads ativos
      resultado.sort((a, b) => b.leads_ativos - a.leads_ativos)

      return resultado
    } catch (error) {
      console.error('❌ Erro ao buscar dashboard:', error)
      return []
    }
  }

  // Distribuir lead automaticamente quando qualificado como "Decidido"
  static async distribuirLeadDecidido(lead: Lead): Promise<{
    sucesso: boolean
    vendedor?: Usuario
    atribuicao?: LeadAtribuicao
    naFila?: boolean
  }> {
    console.log('🎯 Distribuindo lead decidido:', lead.nome)

    try {
      const vendedor = await this.buscarProximoVendedor(lead.cliente_id)

      if (!vendedor) {
        console.log('⚠️ Sem vendedor disponível, adicionando à fila')
        await this.adicionarFilaEspera(
          lead.id,
          lead.cliente_id,
          'Lead qualificado como Decidido - aguardando vendedor'
        )
        return { sucesso: true, naFila: true }
      }

      const atribuicao = await this.atribuirLead(
        lead.id,
        vendedor.id,
        lead.cliente_id
      )

      if (!atribuicao) {
        return { sucesso: false }
      }

      console.log('✅ Lead distribuído para:', vendedor.nome)
      return {
        sucesso: true,
        vendedor,
        atribuicao
      }
    } catch (error) {
      console.error('❌ Erro ao distribuir lead:', error)
      return { sucesso: false }
    }
  }
}
