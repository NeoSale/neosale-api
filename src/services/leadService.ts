import { supabase } from '../lib/supabase'
import { ImportLeadsInput, BulkLeadsInput, AgendamentoInput, MensagemInput, EtapaInput, StatusInput, PaginationInput, UpdateLeadInput, UpdateFollowupInput, CreateLeadInput } from '../lib/validators'
import { generateLeadEmbedding } from '../lib/embedding'
import { ReferenciaService } from './referenciaService'
export class LeadService {
  // Função para formatar telefone com DDI 55 quando necessário
  private static formatarTelefone(telefone: string): string {
    if (!telefone) return telefone
    
    // Remove todos os caracteres não numéricos
    const numeroLimpo = telefone.replace(/\D/g, '')
    
    // Se já tem DDI (13 ou 14 dígitos), retorna como está
    if (numeroLimpo.length === 13 || numeroLimpo.length === 14) {
      return numeroLimpo
    }
    
    // Se tem 12 dígitos e começa com 55, já tem DDI, retorna como está
    if (numeroLimpo.length === 12 && numeroLimpo.startsWith('55')) {
      return numeroLimpo
    }
    
    // Se tem 10 ou 11 dígitos, adiciona DDI 55 (número brasileiro sem DDI)
    if (numeroLimpo.length === 10 || numeroLimpo.length === 11) {
      return '55' + numeroLimpo
    }
    
    return numeroLimpo
  }
  // Verificar se Supabase está configurado
  private static checkSupabaseConnection() {
    if (!supabase) {
      throw new Error('Supabase não está configurado. Configure as credenciais no arquivo .env');
    }
  }

  // Criar um único lead
  static async criarLead(data: CreateLeadInput, clienteId?: string) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Criando novo lead:', data.nome)

    try {
      // Formatar telefone com DDI 55 se necessário
      const telefoneFormatado = LeadService.formatarTelefone(data.telefone)
      
      // Verificar se telefone já existe e está ativo
      const { data: existingPhones, error: phoneError } = await supabase!
        .from('leads')
        .select(`
          id, 
          nome, 
          telefone,
          deletado,
          status_negociacao:status_negociacao_id(nome)
        `)
        .eq('telefone', telefoneFormatado)
        .eq('deletado', false)
        .eq('cliente_id', clienteId)

      if (phoneError) {
        console.error('❌ Erro ao verificar telefone:', phoneError)
        throw phoneError
      }

      // Verificar se existe algum lead ativo com este telefone
      const activePhone = existingPhones?.find((lead: any) => {
        const statusNome = lead.status_negociacao?.nome
        // Lead é considerado ativo se não tem status ou se o status não é 'perdido' nem 'fechado'
        return !statusNome || (statusNome !== 'perdido' && statusNome !== 'fechado')
      })

      if (activePhone) {
        throw new Error(`Já existe um lead ativo com o telefone ${telefoneFormatado}: ${activePhone.nome}`)
      }

      // Verificar se email já existe (se fornecido)
      if (data.email) {
        const { data: existingEmail, error: emailError } = await supabase!
          .from('leads')
          .select('id, nome, email')
          .eq('email', data.email)
          .eq('deletado', false)
          .eq('cliente_id', clienteId)
          .single()

        if (existingEmail && !emailError) {
          throw new Error(`Já existe um lead com o email ${data.email}: ${existingEmail.nome}`)
        }
      }

      // Determinar origem_id baseado no campo 'origem' ou usar 'outbound' como padrão
      let origemId = data.origem_id
      if (!origemId) {
        // Se o campo 'origem' foi fornecido, buscar por nome, senão usar 'outbound'
        const nomeOrigem = (data as any).origem || 'outbound'

        const origem = await ReferenciaService.buscarOrigemPorNome(nomeOrigem)

        if (!origem) {
          throw new Error(`Origem "${nomeOrigem}" não encontrada. É necessário ter a origem "${nomeOrigem}" cadastrada.`)
        }

        origemId = origem.id
      }

      // Gerar embedding para o lead
      const embedding = data.embedding || await generateLeadEmbedding(data)

      // Criar o lead
      const { data: novoLead, error } = await supabase!
        .from('leads')
        .insert({
          nome: data.nome,
          telefone: telefoneFormatado,
          email: data.email || null,
          empresa: data.empresa || null,
          cargo: data.cargo || null,
          contador: data.contador || null,
          escritorio: data.escritorio || null,
          responsavel: data.responsavel || null,
          cnpj: data.cnpj || null,
          observacao: data.observacao || null,
          profile_picture_url: data.profile_picture_url || null,
          segmento: data.segmento || null,
          erp_atual: data.erp_atual || null,
          origem_id: origemId,
          qualificacao_id: data.qualificacao_id || null,
          cliente_id: clienteId || null,
          embedding: embedding,
          deletado: false
        })
        .select('id')
        .single()

      if (error) {
        console.error('❌ Erro ao criar lead:', error)
        throw error
      }

      console.log('✅ Lead criado com sucesso:', novoLead.id)
      return novoLead

    } catch (error: any) {
      console.error('❌ Erro ao criar lead:', error)
      throw error
    }
  }

  // Importar leads
  static async importLeads(data: ImportLeadsInput, clienteId?: string) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Iniciando importação de leads:', data.leads.length, 'leads')

    const results = []
    const skipped = []

    for (const leadData of data.leads) {
      try {
        // Verificar se telefone já existe e está ativo (deletado = false)
        const { data: existingPhone, error: phoneError } = await supabase!
          .from('leads')
          .select('id, nome, telefone, deletado')
          .eq('telefone', leadData.telefone)
          .eq('deletado', false)
          .eq('cliente_id', clienteId)
          .single()

        if (phoneError && phoneError.code !== 'PGRST116') {
          console.error('❌ Erro ao verificar telefone:', phoneError)
          throw phoneError
        }

        if (existingPhone) {
          console.log('⚠️ Lead ativo com telefone já existe:', leadData.telefone, '- pulando')
          skipped.push({ ...leadData, motivo: 'Telefone já existe em lead ativo' })
          continue
        }

        // Verificar se email já existe (apenas se email foi fornecido)
        if (leadData.email) {
          const { data: existingEmail, error: emailError } = await supabase!
            .from('leads')
            .select('id, nome, email')
            .eq('email', leadData.email)
            .eq('deletado', false)
            .eq('cliente_id', clienteId)
            .single()

          if (emailError && emailError.code !== 'PGRST116') {
            console.error('❌ Erro ao verificar email:', emailError)
            throw emailError
          }

          if (existingEmail) {
            console.log('⚠️ Lead com email já existe:', leadData.email, '- pulando')
            skipped.push({ ...leadData, motivo: 'Email já existe' })
            continue
          }
        }

        // Criar followup primeiro com valores padrão
        // const { data: followup, error: followupError } = await supabase!
        //   .from('followup')
        //   .insert({
        //     id_mensagem: (await supabase!.from('mensagens').select('id').limit(1).single()).data?.id || null,
        //     status: 'sucesso',
        //     mensagem_enviada: 'Mensagem padrão - aguardando envio'
        //   })
        //   .select()
        //   .single()

        // if (followupError) {
        //   console.error('❌ Erro ao criar followup:', followupError)
        //   throw followupError
        // }

        // Criar lead com referência ao mensagem_status
        const { data: lead, error: leadError } = await supabase!
          .from('leads')
          .insert({
            nome: leadData.nome,
            telefone: leadData.telefone,
            email: leadData.email,
            empresa: leadData.empresa,
            cargo: leadData.cargo,
            origem_id: leadData.origem_id,
            cliente_id: clienteId
          })
          .select()
          .single()

        if (leadError) {
          console.error('❌ Erro ao criar lead:', leadError)
          throw leadError
        }

        console.log('✅ Lead criado com sucesso:', lead.id)
        results.push(lead)
      } catch (error) {
        console.error('❌ Erro ao processar lead:', leadData, error)
        throw error
      }
    }

    console.log('✅ Importação concluída:', results.length, 'leads criados,', skipped.length, 'leads pulados')
    return { created: results, skipped }
  }

  // Importar leads em lote (bulk) sem origem_id
  static async bulkImportLeads(data: BulkLeadsInput, clienteId: string) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Iniciando importação em lote de leads:', data.leads.length, 'leads')

    // Buscar a origem 'outbound'
    const { data: origens, error: origemError } = await supabase!
      .from('origens_leads')
      .select('id')
      .eq('nome', 'outbound')
      .single()

    if (origemError || !origens) {
      throw new Error('Origem "outbound" não encontrada. É necessário ter a origem "outbound" cadastrada.')
    }

    const origemOutbound = origens.id
    const results = []
    const skipped = []

    for (const leadData of data.leads) {
      try {
        // Formatar telefone com DDI 55 se necessário
        const telefoneFormatado = LeadService.formatarTelefone(leadData.telefone)
        
        // Verificar se telefone já existe
        const { data: existingPhone, error: phoneError } = await supabase!
          .from('leads')
          .select('id, nome, telefone')
          .eq('telefone', telefoneFormatado)
          .eq('deletado', false)
          .eq('cliente_id', clienteId)
          .single()

        if (phoneError && phoneError.code !== 'PGRST116') {
          console.error('❌ Erro ao verificar telefone:', phoneError)
          throw phoneError
        }

        if (existingPhone) {
          console.log('⚠️ Lead com telefone já existe:', telefoneFormatado, '- pulando')
          skipped.push({ ...leadData, motivo: 'Telefone já existe na base de leads' })

          continue
        }

        // Criar lead
        const { data: lead, error: leadError } = await supabase!
          .from('leads')
          .insert({
            nome: leadData.nome,
            telefone: telefoneFormatado,
            email: leadData.email,
            empresa: leadData.empresa,
            cargo: leadData.cargo,
            origem_id: origemOutbound,
            cliente_id: clienteId
          })
          .select()
          .single()

        if (leadError) {
          console.error('❌ Erro ao criar lead:', leadError)
          throw leadError
        }

        console.log('✅ Lead criado com sucesso:', lead.id)
        results.push(lead)
      } catch (error) {
        console.error('❌ Erro ao processar lead:', leadData, error)
        throw error
      }
    }

    console.log('✅ Importação em lote concluída:', results.length, 'leads criados,', skipped.length, 'leads pulados')
    return { created: results, skipped }
  }

  // Agendar lead
  static async agendarLead(id: string, data: AgendamentoInput) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Agendando lead:', id)

    const updateData: any = {
      status_agendamento: true
    }

    if (data.agendado_em) {
      updateData.agendado_em = data.agendado_em
    }

    const { data: lead, error } = await supabase!
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .eq('deletado', false)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao agendar lead:', error)
      throw error
    }

    console.log('✅ Lead agendado com sucesso:', id)
    return lead
  }

  // Enviar mensagem
  static async enviarMensagem(id: string, data: MensagemInput) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Enviando mensagem para lead:', id, 'mensagem_id:', data.mensagem_id)

    // Buscar o lead para obter informações necessárias
    const { data: lead, error: leadError } = await supabase!
      .from('leads')
      .select('followup_id')
      .eq('id', id)
      .eq('deletado', false)
      .single()

    if (leadError) {
      console.error('❌ Erro ao buscar lead:', leadError)
      throw leadError
    }

    // Buscar o texto da mensagem
    const { data: mensagem, error: mensagemError } = await supabase!
      .from('mensagens')
      .select('texto_mensagem')
      .eq('id', data.mensagem_id)
      .single()

    if (mensagemError) {
      console.error('❌ Erro ao buscar mensagem:', mensagemError)
      throw mensagemError
    }

    // Atualizar followup com nova estrutura
    const { data: followup, error: updateError } = await supabase!
      .from('followup')
      .update({
        id_mensagem: data.mensagem_id,
        id_lead: id,
        status: 'sucesso',
        erro: null,
        mensagem_enviada: mensagem.texto_mensagem,
        updated_at: new Date().toISOString()
      })
      .eq('id', lead.followup_id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Erro ao atualizar followup:', updateError)
      throw updateError
    }

    console.log('✅ Mensagem enviada com sucesso para lead:', id)
    return followup
  }

  // Atualizar status de mensagem enviada
  static async atualizarMensagem(id: string, data: UpdateFollowupInput) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Atualizando status de mensagem do lead:', id)

    // Buscar o lead para obter o followup_id
    const { data: lead, error: leadError } = await supabase!
      .from('leads')
      .select('followup_id')
      .eq('id', id)
      .eq('deletado', false)
      .single()

    if (leadError) {
      console.error('❌ Erro ao buscar lead:', leadError)
      throw leadError
    }

    // Preparar dados para atualização com nova estrutura
    const updateData: any = {
      status: data.status || 'sucesso',
      updated_at: new Date().toISOString()
    }

    // Adicionar campos opcionais se fornecidos
    if (data.id_mensagem) {
      updateData.id_mensagem = data.id_mensagem
    }

    if (data.id_lead) {
      updateData.id_lead = data.id_lead
    }

    if (data.erro) {
      updateData.erro = data.erro
      updateData.status = 'erro'
    }

    if (data.mensagem_enviada) {
      updateData.mensagem_enviada = data.mensagem_enviada
    }

    // Atualizar followup
    const { data: followup, error: followupError } = await supabase!
      .from('followup')
      .update(updateData)
      .eq('id', lead.followup_id)
      .select()
      .single()

    if (followupError) {
      console.error('❌ Erro ao atualizar status de mensagem:', followupError)
      throw followupError
    }

    console.log('✅ Status de mensagem atualizado com sucesso para lead:', id)
    return followup
  }

  // Atualizar etapa do funil
  static async atualizarEtapa(id: string, data: EtapaInput) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Atualizando etapa do lead:', id, 'nova etapa:', data.etapa_funil_id)

    const { data: lead, error } = await supabase!
      .from('leads')
      .update({ etapa_funil_id: data.etapa_funil_id })
      .eq('id', id)
      .eq('deletado', false)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao atualizar etapa:', error)
      throw error
    }

    console.log('✅ Etapa atualizada com sucesso:', id)
    return lead
  }

  // Atualizar status de negociação
  static async atualizarStatus(id: string, data: StatusInput) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Atualizando status do lead:', id, 'novo status:', data.status_negociacao_id)

    const { data: lead, error } = await supabase!
      .from('leads')
      .update({ status_negociacao_id: data.status_negociacao_id })
      .eq('id', id)
      .eq('deletado', false)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao atualizar status:', error)
      throw error
    }

    console.log('✅ Status atualizado com sucesso:', id)
    return lead
  }

  // Buscar lead por ID
  static async buscarPorId(id: string, clienteId?: string) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Buscando lead:', id)

    let query = supabase!
      .from('leads')
      .select(`
        *,
        origem:origem_id(*),
        etapa_funil:etapa_funil_id(*),
        status_negociacao:status_negociacao_id(*)
      `)
      .eq('id', id)
      .eq('deletado', false)

    if (clienteId) {
      query = query.eq('cliente_id', clienteId)
    }

    const { data: lead, error } = await query.single()

    if (error) {
      console.error('❌ Erro ao buscar lead:', error)
      throw error
    }

    console.log('✅ Lead encontrado:', id)
    return lead
  }

  // Buscar lead por telefone
  static async buscarPorTelefone(telefone: string, clienteId: string) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Buscando lead por telefone:', telefone, 'para cliente:', clienteId)

    const query = supabase!
      .from('leads')
      .select('*')
      .eq('telefone', telefone)
      .eq('cliente_id', clienteId)
      .eq('deletado', false)

    const { data: lead, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        const badRequestError = new Error('Lead não encontrado com este telefone')
          ; (badRequestError as any).statusCode = 400
        throw badRequestError
      }
      console.error('❌ Erro ao buscar lead por telefone:', error)
      throw error
    }

    console.log('✅ Lead encontrado por telefone:', telefone)
    return lead
  }

  // Listar todos os leads
  static async listarTodos(clienteId?: string) {
    LeadService.checkSupabaseConnection();

    // Primeiro, contar o total de leads
    let countQuery = supabase!
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('deletado', false)

    if (clienteId) {
      countQuery = countQuery.eq('cliente_id', clienteId)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('❌ Erro ao contar leads:', countError)
      throw countError
    }

    // Depois, buscar os dados dos leads
    let dataQuery = supabase!
      .from('leads')
      .select(`
        *,
        origem:origem_id (nome),
        etapa_funil:etapa_funil_id (nome),
        status_negociacao:status_negociacao_id (nome)
      `)
      .eq('deletado', false)

    if (clienteId) {
      dataQuery = dataQuery.eq('cliente_id', clienteId)
    }

    const { data: leads, error } = await dataQuery.order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao listar leads:', error)
      throw error
    }

    console.log('✅ Leads listados:', leads?.length || 0, 'encontrados de', count, 'total')

    return {
      leads: leads || [],
      total: count || 0
    }
  }

  // Listar leads com paginação
  static async listarComPaginacao(params: PaginationInput, clienteId?: string) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Listando leads com paginação:', params)

    const { page, limit, search } = params
    const offset = (page - 1) * limit

    let query = supabase!
      .from('leads')
      .select(`
        *,
        origem:origem_id(*),
        etapa_funil:etapa_funil_id(*),
        status_negociacao:status_negociacao_id(*)
      `, { count: 'exact' })
      .eq('deletado', false)

    if (clienteId) {
      query = query.eq('cliente_id', clienteId)
    }

    // Aplicar filtro de busca se fornecido
    if (search && search.trim()) {
      query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%,telefone.ilike.%${search}%`)
    }

    // Aplicar paginação e ordenação
    const { data: leads, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ Erro ao listar leads paginados:', error)
      throw error
    }

    const totalPages = Math.ceil((count || 0) / limit)

    const result = {
      data: leads || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }

    console.log('✅ Leads paginados listados:', {
      total: count,
      page,
      limit,
      totalPages,
      returned: leads?.length || 0
    })

    return result
  }

  // Obter estatísticas dos leads
  static async obterEstatisticas(clienteId?: string) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Obtendo estatísticas dos leads', clienteId ? `para cliente: ${clienteId}` : '')

    try {
      // Total de leads
      let totalQuery = supabase!
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('deletado', false)

      if (clienteId) {
        totalQuery = totalQuery.eq('cliente_id', clienteId)
      }

      const { count: total, error: totalError } = await totalQuery

      if (totalError) throw totalError

      // Leads com email
      let emailQuery = supabase!
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('deletado', false)
        .not('email', 'is', null)
        .neq('email', '')

      if (clienteId) {
        emailQuery = emailQuery.eq('cliente_id', clienteId)
      }

      const { count: withEmail, error: emailError } = await emailQuery

      if (emailError) throw emailError

      // Leads qualificados (etapa >= qualificacao)
      const { data: etapaQualificacao, error: etapaError } = await supabase!
        .from('etapas_funil')
        .select('id')
        .in('nome', ['qualificacao', 'reuniao', 'apresentacao', 'negociacao', 'fechamento'])

      if (etapaError) throw etapaError

      const etapaIds = etapaQualificacao.map(e => e.id)

      let qualifiedQuery = supabase!
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('deletado', false)
        .in('etapa_funil_id', etapaIds)

      if (clienteId) {
        qualifiedQuery = qualifiedQuery.eq('cliente_id', clienteId)
      }

      const { count: qualified, error: qualifiedError } = await qualifiedQuery

      if (qualifiedError) throw qualifiedError

      // Leads novos (últimos 7 dias)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      let newLeadsQuery = supabase!
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('deletado', false)
        .gte('created_at', sevenDaysAgo.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\/(\d{2})\/(\d{4})/, '$2-$1').replace(', ', 'T') + '.000Z')

      if (clienteId) {
        newLeadsQuery = newLeadsQuery.eq('cliente_id', clienteId)
      }

      const { count: newLeads, error: newError } = await newLeadsQuery

      if (newError) throw newError

      // Leads por status de negociação
      let statusQuery = supabase!
        .from('leads')
        .select(`
          status_negociacao:status_negociacao_id(
            nome
          )
        `)
        .eq('deletado', false)

      if (clienteId) {
        statusQuery = statusQuery.eq('cliente_id', clienteId)
      }

      const { data: statusData, error: statusError } = await statusQuery

      if (statusError) throw statusError

      const byStatus: Record<string, number> = {}
      statusData?.forEach((lead: any) => {
        const statusNome = lead.status_negociacao?.nome || 'sem_status'
        byStatus[statusNome] = (byStatus[statusNome] || 0) + 1
      })

      const stats = {
        total: total || 0,
        withEmail: withEmail || 0,
        qualified: qualified || 0,
        new: newLeads || 0,
        byStatus
      }

      console.log('✅ Estatísticas obtidas:', stats)
      return stats

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error)
      throw error
    }
  }

  // Atualizar lead
  static async atualizarLead(id: string, data: UpdateLeadInput, clienteId?: string) {
    try {
      LeadService.checkSupabaseConnection();
      console.log('🔄 Atualizando lead:', id, data)

      // Verificar se o lead existe e não está deletado
      let query = supabase!
        .from('leads')
        .select('id, deletado')
        .eq('id', id)

      if (clienteId) {
        query = query.eq('cliente_id', clienteId)
      }

      const { data: leadExistente, error: errorVerificacao } = await query.single()

      if (errorVerificacao || !leadExistente) {
        throw new Error('Lead não encontrado')
      }

      if (leadExistente.deletado) {
        throw new Error('Não é possível atualizar um lead excluído')
      }

      // Formatar telefone se estiver sendo atualizado
      const updateData = { ...data }
      if (updateData.telefone) {
        updateData.telefone = LeadService.formatarTelefone(updateData.telefone)
      }
      
      // Gerar embedding se houver dados para atualizar
      if (Object.keys(updateData).length > 0 && !updateData.embedding) {
        // Buscar dados atuais do lead para gerar embedding completo
        const { data: leadAtual } = await supabase!
          .from('leads')
          .select('*')
          .eq('id', id)
          .single()

        if (leadAtual) {
          const dadosCompletos = { ...leadAtual, ...updateData }
          updateData.embedding = await generateLeadEmbedding(dadosCompletos)
        }
      }

      // Atualizar o lead
      let updateQuery = supabase!
        .from('leads')
        .update(updateData)
        .eq('id', id)

      if (clienteId) {
        updateQuery = updateQuery.eq('cliente_id', clienteId)
      }

      const { data: leadAtualizado, error: errorAtualizacao } = await updateQuery
        .select(`
          *,
          origem:origem_id(nome),
          etapa_funil:etapa_funil_id(nome),
          status_negociacao:status_negociacao_id(nome)
        `)
        .single()

      if (errorAtualizacao) {
        console.error('❌ Erro ao atualizar lead:', errorAtualizacao)
        throw errorAtualizacao
      }

      console.log('✅ Lead atualizado com sucesso:', leadAtualizado.id)
      return leadAtualizado

    } catch (error) {
      console.error('❌ Erro ao atualizar lead:', error)
      throw error
    }
  }

  // Excluir lead
  static async excluirLead(id: string, clienteId?: string) {
    try {
      LeadService.checkSupabaseConnection();
      console.log('🔄 Marcando lead como deletado:', id)

      // Verificar se o lead existe
      let query = supabase!
        .from('leads')
        .select('id, deletado')
        .eq('id', id)

      if (clienteId) {
        query = query.eq('cliente_id', clienteId)
      }

      const { data: leadExistente, error: errorVerificacao } = await query.single()

      if (errorVerificacao || !leadExistente) {
        throw new Error('Lead não encontrado')
      }

      if (leadExistente.deletado) {
        throw new Error('Lead já foi excluído')
      }

      // Marcar o lead como deletado (soft delete)
      let deleteQuery = supabase!
        .from('leads')
        .update({ deletado: true })
        .eq('id', id)

      if (clienteId) {
        deleteQuery = deleteQuery.eq('cliente_id', clienteId)
      }

      const { error: errorExclusao } = await deleteQuery

      if (errorExclusao) {
        console.error('❌ Erro ao marcar lead como deletado:', errorExclusao)
        throw new Error('Erro ao excluir lead')
      }

      console.log('✅ Lead marcado como deletado com sucesso:', id)
      return {
        message: 'Lead excluído com sucesso'
      }

    } catch (error) {
      console.error('❌ Erro no serviço de exclusão:', error)
      throw error
    }
  }

  // Atualizar campo ai_habilitada do lead
  static async atualizarAiHabilitada(id: string, aiHabilitada: boolean, clienteId?: string) {
    LeadService.checkSupabaseConnection();
    console.log(`🔄 Atualizando ai_habilitada do lead ${id} para:`, aiHabilitada)

    try {
      // Construir query base
      let query = supabase!
        .from('leads')
        .update({ ai_habilitada: aiHabilitada })
        .eq('id', id)
        .eq('deletado', false)

      // Adicionar filtro de cliente se fornecido
      if (clienteId) {
        query = query.eq('cliente_id', clienteId)
      }

      const { data, error } = await query.select('id, nome, ai_habilitada').single()

      if (error) {
        console.error('❌ Erro ao atualizar ai_habilitada:', error)
        if (error.code === 'PGRST116') {
          throw new Error('Lead não encontrado')
        }
        throw error
      }

      console.log('✅ Campo ai_habilitada atualizado com sucesso:', data)
      return data
    } catch (error) {
      console.error('❌ Erro ao atualizar ai_habilitada:', error)
      throw error
    }
  }
}