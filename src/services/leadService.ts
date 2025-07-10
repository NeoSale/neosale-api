import { supabase } from '../lib/supabase'
import { ImportLeadsInput, BulkLeadsInput, AgendamentoInput, MensagemInput, EtapaInput, StatusInput, PaginationInput, UpdateLeadInput, AtualizarMensagemInput, CreateLeadInput } from '../lib/validators'
export class LeadService {
  // Verificar se Supabase está configurado
  private static checkSupabaseConnection() {
    if (!supabase) {
      throw new Error('Supabase não está configurado. Configure as credenciais no arquivo .env');
    }
  }

  // Criar um único lead
  static async criarLead(data: CreateLeadInput) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Criando novo lead:', data.nome)
    
    try {
      // Verificar se telefone já existe
      const { data: existingPhone, error: phoneError } = await supabase!
        .from('leads')
        .select('id, nome, telefone')
        .eq('telefone', data.telefone)
        .eq('deletado', false)
        .single()
      
      if (existingPhone && !phoneError) {
        throw new Error(`Já existe um lead com o telefone ${data.telefone}: ${existingPhone.nome}`)
      }
      
      // Verificar se email já existe (se fornecido)
      if (data.email) {
        const { data: existingEmail, error: emailError } = await supabase!
          .from('leads')
          .select('id, nome, email')
          .eq('email', data.email)
          .eq('deletado', false)
          .single()
        
        if (existingEmail && !emailError) {
          throw new Error(`Já existe um lead com o email ${data.email}: ${existingEmail.nome}`)
        }
      }
      
      // Se origem_id não foi fornecido, usar origem 'outbound' como padrão
      let origemId = data.origem_id
      if (!origemId) {
        const { data: origens, error: origemError } = await supabase!
          .from('origens_leads')
          .select('id')
          .eq('nome', 'outbound')
          .single()
        
        if (origemError || !origens) {
          throw new Error('Origem "outbound" não encontrada. É necessário ter a origem "outbound" cadastrada.')
        }
        
        origemId = origens.id
      }
      
      // Criar mensagem_status primeiro
      const { data: mensagemStatus, error: mensagemError } = await supabase!
        .from('mensagem_status')
        .insert({})
        .select()
        .single()
      
      if (mensagemError) {
        console.error('❌ Erro ao criar mensagem_status:', mensagemError)
        throw mensagemError
      }
      
      // Criar o lead
      const { data: novoLead, error } = await supabase!
        .from('leads')
        .insert({
          nome: data.nome,
          telefone: data.telefone,
          email: data.email || null,
          empresa: data.empresa || null,
          cargo: data.cargo || null,
          contador: data.contador || null,
          escritorio: data.escritorio || null,
          responsavel: data.responsavel || null,
          cnpj: data.cnpj || null,
          observacao: data.observacao || null,
          segmento: data.segmento || null,
          erp_atual: data.erp_atual || null,
          origem_id: origemId,
          mensagem_status_id: mensagemStatus.id,
          qualificacao_id: data.qualificacao_id || null,
          deletado: false
        })
        .select(`
          *,
          mensagem_status:mensagem_status_id(*),
          origem:origem_id(*),
          etapa_funil:etapa_funil_id(*),
          status_negociacao:status_negociacao_id(*),
          qualificacao:qualificacao_id(*)
        `)
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
  static async importLeads(data: ImportLeadsInput) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Iniciando importação de leads:', data.leads.length, 'leads')
    
    const results = []
    const skipped = []
    
    for (const leadData of data.leads) {
      try {
        // Verificar se telefone já existe
        const { data: existingPhone, error: phoneError } = await supabase!
          .from('leads')
          .select('id, nome, telefone')
          .eq('telefone', leadData.telefone)
          .eq('deletado', false)
          .single()
        
        if (phoneError && phoneError.code !== 'PGRST116') {
          console.error('❌ Erro ao verificar telefone:', phoneError)
          throw phoneError
        }
        
        if (existingPhone) {
          console.log('⚠️ Lead com telefone já existe:', leadData.telefone, '- pulando')
          skipped.push({ ...leadData, motivo: 'Telefone já existe' })
          continue
        }
        
        // Verificar se email já existe (apenas se email foi fornecido)
        if (leadData.email) {
          const { data: existingEmail, error: emailError } = await supabase!
            .from('leads')
            .select('id, nome, email')
            .eq('email', leadData.email)
            .eq('deletado', false)
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
        
        // Criar mensagem_status primeiro
        const { data: mensagemStatus, error: mensagemError } = await supabase!
          .from('mensagem_status')
          .insert({})
          .select()
          .single()
        
        if (mensagemError) {
          console.error('❌ Erro ao criar mensagem_status:', mensagemError)
          throw mensagemError
        }
        
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
            mensagem_status_id: mensagemStatus.id
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
  static async bulkImportLeads(data: BulkLeadsInput) {
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
        // Verificar se telefone já existe
        const { data: existingPhone, error: phoneError } = await supabase!
          .from('leads')
          .select('id, nome, telefone')
          .eq('telefone', leadData.telefone)
          .eq('deletado', false)
          .single()
        
        if (phoneError && phoneError.code !== 'PGRST116') {
          console.error('❌ Erro ao verificar telefone:', phoneError)
          throw phoneError
        }
        
        if (existingPhone) {
          console.log('⚠️ Lead com telefone já existe:', leadData.telefone, '- pulando')
          skipped.push({ ...leadData, motivo: 'Telefone já existe' })
          continue
        }
        
        // Verificar se email já existe (apenas se email foi fornecido)
        if (leadData.email) {
          const { data: existingEmail, error: emailError } = await supabase!
            .from('leads')
            .select('id, nome, email')
            .eq('email', leadData.email)
            .eq('deletado', false)
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
        
        // Criar mensagem_status primeiro
        const { data: mensagemStatus, error: mensagemError } = await supabase!
          .from('mensagem_status')
          .insert({})
          .select()
          .single()
        
        if (mensagemError) {
          console.error('❌ Erro ao criar mensagem_status:', mensagemError)
          throw mensagemError
        }
        
        // Criar lead com referência ao mensagem_status e origem outbound
        const { data: lead, error: leadError } = await supabase!
          .from('leads')
          .insert({
            nome: leadData.nome,
            telefone: leadData.telefone,
            email: leadData.email,
            empresa: leadData.empresa,
            cargo: leadData.cargo,
            origem_id: origemOutbound,
            mensagem_status_id: mensagemStatus.id
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
    console.log('🔄 Enviando mensagem para lead:', id, 'tipo:', data.tipo_mensagem)
    
    // Buscar o lead para obter o mensagem_status_id
    const { data: lead, error: leadError } = await supabase!
      .from('leads')
      .select('mensagem_status_id')
      .eq('id', id)
      .eq('deletado', false)
      .single()
    
    if (leadError) {
      console.error('❌ Erro ao buscar lead:', leadError)
      throw leadError
    }
    
    // Atualizar mensagem_status
    const updateData: any = {}
    updateData[`${data.tipo_mensagem}_enviada`] = true
    // Usar fuso horário do Brasil para registrar data/hora (formato pt-BR)
    const agora = new Date()
    const brasilTime = agora.toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo", year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).replace(/\/(\d{2})\/(\d{4})/, '$2-$1').replace(', ', 'T') + '.000Z'
    updateData[`${data.tipo_mensagem}_data`] = brasilTime
    
    const { data: mensagemStatus, error: mensagemError } = await supabase!
      .from('mensagem_status')
      .update(updateData)
      .eq('id', lead.mensagem_status_id)
      .select()
      .single()
    
    if (mensagemError) {
      console.error('❌ Erro ao atualizar mensagem_status:', mensagemError)
      throw mensagemError
    }
    
    console.log('✅ Mensagem enviada com sucesso:', data.tipo_mensagem)
    return mensagemStatus
  }

  // Atualizar status de mensagem enviada
  static async atualizarMensagem(id: string, data: AtualizarMensagemInput) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Atualizando status de mensagem do lead:', id, 'tipo:', data.tipo_mensagem)
    
    // Buscar o lead para obter o mensagem_status_id
    const { data: lead, error: leadError } = await supabase!
      .from('leads')
      .select('mensagem_status_id')
      .eq('id', id)
      .eq('deletado', false)
      .single()
    
    if (leadError) {
      console.error('❌ Erro ao buscar lead:', leadError)
      throw leadError
    }
    
    // Preparar dados para atualização
    const updateData: any = {}
    updateData[`${data.tipo_mensagem}_enviada`] = data.enviada
    
    // Se data foi fornecida, usar ela; senão usar data atual se enviada for true
    if (data.data) {
      updateData[`${data.tipo_mensagem}_data`] = data.data
    } else if (data.enviada) {
      // Usar fuso horário do Brasil para registrar data/hora (formato pt-BR)
      const agora = new Date()
      // CORREÇÃO: Gerar timestamp ISO válido para o fuso horário do Brasil
      const brasilTime = new Date(agora.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"})).toISOString()
      updateData[`${data.tipo_mensagem}_data`] = brasilTime
    } else {
      // Se enviada for false e não há data específica, limpar a data
      updateData[`${data.tipo_mensagem}_data`] = null
    }
    
    // Atualizar mensagem_status
    const { data: mensagemStatus, error: mensagemError } = await supabase!
      .from('mensagem_status')
      .update(updateData)
      .eq('id', lead.mensagem_status_id)
      .select()
      .single()
    
    if (mensagemError) {
      console.error('❌ Erro ao atualizar status de mensagem:', mensagemError)
      throw mensagemError
    }
    
    console.log('✅ Status de mensagem atualizado com sucesso:', data.tipo_mensagem)
    return mensagemStatus
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
  static async buscarPorId(id: string) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Buscando lead:', id)
    
    const { data: lead, error } = await supabase!
      .from('leads')
      .select(`
        *,
        mensagem_status:mensagem_status_id(*),
        origem:origem_id(*),
        etapa_funil:etapa_funil_id(*),
        status_negociacao:status_negociacao_id(*)
      `)
      .eq('id', id)
      .eq('deletado', false)
      .single()
    
    if (error) {
      console.error('❌ Erro ao buscar lead:', error)
      throw error
    }
    
    console.log('✅ Lead encontrado:', id)
    return lead
  }

  // Buscar lead por telefone
  static async buscarPorTelefone(telefone: string) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Buscando lead por telefone:', telefone)
    
    const { data: lead, error } = await supabase!
      .from('leads')
      .select(`
        *,
        mensagem_status:mensagem_status_id(*),
        origem:origem_id(*),
        etapa_funil:etapa_funil_id(*),
        status_negociacao:status_negociacao_id(*),
        qualificacao:qualificacao_id(*)
      `)
      .eq('telefone', telefone)
      .eq('deletado', false)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        const badRequestError = new Error('Lead não encontrado com este telefone')
        ;(badRequestError as any).statusCode = 400
        throw badRequestError
      }
      console.error('❌ Erro ao buscar lead por telefone:', error)
      throw error
    }
    
    console.log('✅ Lead encontrado por telefone:', telefone)
    return lead
  }
  
  // Listar todos os leads
  static async listarTodos() {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Listando todos os leads')
    
    const { data: leads, error } = await supabase!
      .from('leads')
      .select(`
        *,
        mensagem_status:mensagem_status_id(*),
        origem:origem_id(*),
        etapa_funil:etapa_funil_id(*),
        status_negociacao:status_negociacao_id(*)
      `)
      .eq('deletado', false)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro ao listar leads:', error)
      throw error
    }
    
    console.log('✅ Leads listados:', leads?.length || 0, 'encontrados')
    return leads || []
  }

  // Listar leads com paginação
  static async listarComPaginacao(params: PaginationInput) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Listando leads com paginação:', params)
    
    const { page, limit, search } = params
    const offset = (page - 1) * limit
    
    let query = supabase!
      .from('leads')
      .select(`
        *,
        mensagem_status:mensagem_status_id(*),
        origem:origem_id(*),
        etapa_funil:etapa_funil_id(*),
        status_negociacao:status_negociacao_id(*)
      `, { count: 'exact' })
      .eq('deletado', false)
    
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
  static async obterEstatisticas() {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Obtendo estatísticas dos leads')
    
    try {
      // Total de leads
      const { count: total, error: totalError } = await supabase!
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('deletado', false)
      
      if (totalError) throw totalError
      
      // Leads com email
      const { count: withEmail, error: emailError } = await supabase!
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('deletado', false)
        .not('email', 'is', null)
        .neq('email', '')
      
      if (emailError) throw emailError
      
      // Leads qualificados (etapa >= qualificacao)
      const { data: etapaQualificacao, error: etapaError } = await supabase!
        .from('etapas_funil')
        .select('id')
        .in('nome', ['qualificacao', 'reuniao', 'apresentacao', 'negociacao', 'fechamento'])
      
      if (etapaError) throw etapaError
      
      const etapaIds = etapaQualificacao.map(e => e.id)
      
      const { count: qualified, error: qualifiedError } = await supabase!
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('deletado', false)
        .in('etapa_funil_id', etapaIds)
      
      if (qualifiedError) throw qualifiedError
      
      // Leads novos (últimos 7 dias)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { count: newLeads, error: newError } = await supabase!
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('deletado', false)
        .gte('created_at', sevenDaysAgo.toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo", year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).replace(/\/(\d{2})\/(\d{4})/, '$2-$1').replace(', ', 'T') + '.000Z')
      
      if (newError) throw newError
      
      // Leads por status de negociação
      const { data: statusData, error: statusError } = await supabase!
        .from('leads')
        .select(`
          status_negociacao:status_negociacao_id(
            nome
          )
        `)
        .eq('deletado', false)
      
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
  static async atualizarLead(id: string, data: UpdateLeadInput) {
    try {
      LeadService.checkSupabaseConnection();
      console.log('🔄 Atualizando lead:', id, data)
      
      // Verificar se o lead existe e não está deletado
      const { data: leadExistente, error: errorVerificacao } = await supabase!
        .from('leads')
        .select('id, deletado')
        .eq('id', id)
        .single()
      
      if (errorVerificacao || !leadExistente) {
        throw new Error('Lead não encontrado')
      }
      
      if (leadExistente.deletado) {
        throw new Error('Não é possível atualizar um lead excluído')
      }
      
      // Atualizar o lead
      const { data: leadAtualizado, error: errorAtualizacao } = await supabase!
        .from('leads')
        .update({
          ...data
        })
        .eq('id', id)
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
  static async excluirLead(id: string) {
    try {
      LeadService.checkSupabaseConnection();
      console.log('🔄 Marcando lead como deletado:', id)
      
      // Verificar se o lead existe
      const { data: leadExistente, error: errorVerificacao } = await supabase!
        .from('leads')
        .select('id, deletado')
        .eq('id', id)
        .single()
      
      if (errorVerificacao || !leadExistente) {
        throw new Error('Lead não encontrado')
      }
      
      if (leadExistente.deletado) {
        throw new Error('Lead já foi excluído')
      }
      
      // Marcar o lead como deletado (soft delete)
      const { error: errorExclusao } = await supabase!
        .from('leads')
        .update({ deletado: true })
        .eq('id', id)
      
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
}