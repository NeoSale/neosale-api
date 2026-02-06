import { supabase } from '../lib/supabase'
import { ImportLeadsInput, BulkLeadsInput, AgendamentoInput, MensagemInput, EtapaInput, StatusInput, PaginationInput, UpdateLeadInput, UpdateAutomaticMessageInput, CreateLeadInput } from '../lib/validators'
import { generateLeadEmbedding } from '../lib/embedding'
import { OrigemLeadsService } from './origemLeadsService'
import { QualificacaoService } from './qualificacaoService'
import { LeadDistribuicaoService } from './leadDistribuicaoService'
export class LeadService {
  // Função para formatar telefone com DDI 55 quando necessário
  private static formatarTelefone(telefone: string): string {
    if (!telefone) return telefone

    // Se o telefone contém '@', retorna como está (formato especial como WhatsApp Business)
    if (telefone.includes('@lid')) {
      return telefone
    }

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

      // Determinar origem_id baseado no campo 'origem' ou cria uma nova
      let origemId = data.origem_id
      if (!origemId) {
        // Se o campo 'origem' foi fornecido, buscar por nome, senão cria uma nova
        const nomeOrigem = (data as any).origem;

        // Se o campo 'origem' não foi fornecido retorna um erro
        if (!nomeOrigem) {
          throw new Error('Campo "origem" é obrigatório quando "origem_id" não é fornecido')
        }

        const origem = await OrigemLeadsService.buscarOrigemPorNome(nomeOrigem, clienteId)

        if (!origem) {
          // crie uma origem caso não exista
          const novaOrigem = await OrigemLeadsService.criarOrigem({
            nome: nomeOrigem,
            cliente_id: clienteId!
          })
          if (novaOrigem) {
            origemId = novaOrigem.id
          }
        } else if (origem) {
          origemId = origem.id
        }
      }

      // Determinar qualificacao_id baseado no campo 'qualificacao' ou cria uma nova
      let qualificacaoId = data.qualificacao_id
      if (!qualificacaoId) {
        // Se o campo 'qualificacao' foi fornecido, buscar por nome, senão cria uma nova
        let nomeQualificacao = (data as any).qualificacao;

        // Se o campo 'qualificacao' não foi fornecido retorna um erro
        if (!nomeQualificacao) {
          nomeQualificacao = "Novo"
        }

        const qualificacao = await QualificacaoService.buscarQualificacaoPorNome(nomeQualificacao)

        if (!qualificacao) {
          throw new Error('Qualificação não existe');
        } else if (qualificacao) {
          qualificacaoId = qualificacao.id
        }
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
          cpf: data.cpf || null,
          observacao: data.observacao || null,
          resumo: data.resumo || null,
          profile_picture_url: data.profile_picture_url || null,
          segmento: data.segmento || null,
          erp_atual: data.erp_atual || null,
          faturamento: data.faturamento || null,
          numero_funcionarios: data.numero_funcionarios || null,
          origem_id: origemId,
          qualificacao_id: qualificacaoId || null,
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

        // Validar e obter origem_id
        let origemId = null
        if (leadData.origem) {
          // Buscar origem pelo nome
          const { data: origemExistente, error: origemError } = await supabase!
            .from('origens_leads')
            .select('id')
            .eq('nome', leadData.origem)
            .eq('cliente_id', clienteId)
            .single()

          if (origemError && origemError.code !== 'PGRST116') {
            console.error('❌ Erro ao buscar origem:', origemError)
            throw origemError
          }

          if (origemExistente) {
            // Origem existe, usar o ID
            origemId = origemExistente.id
            console.log(`✅ Origem "${leadData.origem}" encontrada:`, origemId)
          } else {
            // Origem não existe, criar
            const { data: novaOrigem, error: criarOrigemError } = await supabase!
              .from('origens_leads')
              .insert({
                nome: leadData.origem,
                cliente_id: clienteId
              })
              .select()
              .single()

            if (criarOrigemError) {
              console.error('❌ Erro ao criar origem:', criarOrigemError)
              throw criarOrigemError
            }

            origemId = novaOrigem.id
            console.log(`✅ Origem "${leadData.origem}" criada:`, origemId)
          }
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
            cpf: (leadData as any).cpf || null,
            resumo: leadData.resumo || null,
            origem_id: origemId,
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

    console.log('✅ Importação de leads concluída:', results.length, 'leads criados,', skipped.length, 'leads pulados')
    return { created: results, skipped }
  }

  // Importar leads em lote (bulk) com origem opcional
  static async bulkImportLeads(data: BulkLeadsInput, clienteId: string) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Iniciando importação em lote de leads:', data.leads.length, 'leads')

    // Usar origem fornecida ou 'import' como padrão
    const origemNome = data.leads[0].origem || 'import'
    console.log('📍 Origem:', origemNome)

    // Buscar a origem
    const { data: origens, error: origemError } = await supabase!
      .from('origens_leads')
      .select('id')
      .eq('nome', origemNome)
      .eq('cliente_id', clienteId)
      .single()

    let origemId = origens?.id
    if (origemError || !origens) {
      // Criar a origem se não existir
      const { data: origemImport, error: origemImportError } = await supabase!
        .from('origens_leads')
        .insert({
          nome: origemNome,
          cliente_id: clienteId
        })
        .select()
        .single()

      if (origemImport) {
        console.log(`✅ Origem "${origemNome}" criada com sucesso:`, origemImport.id)
        origemId = origemImport.id
      }

      if (origemImportError) {
        console.error(`❌ Erro ao criar origem "${origemNome}":`, origemImportError)
        throw origemImportError
      }
    }

    // Buscar qualificação "Novo"
    const qualificacao = await QualificacaoService.buscarQualificacaoPorNome('Novo')
    const qualificacaoId = qualificacao?.id || null
    
    if (qualificacaoId) {
      console.log('✅ Qualificação "Novo" encontrada:', qualificacaoId)
    } else {
      console.log('⚠️ Qualificação "Novo" não encontrada')
    }

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
            cpf: (leadData as any).cpf || null,
            resumo: leadData.resumo || null,
            origem_id: origemId,
            qualificacao_id: qualificacaoId,
            cliente_id: clienteId,
            profile_picture_url: leadData.profile_picture_url || null
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
      status_agendamento: true,
      updated_at: new Date().toISOString()
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

    // Atualizar automatic_messages com nova estrutura
    const { data: automaticMessage, error: updateError } = await supabase!
      .from('automatic_messages')
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
      console.error('❌ Erro ao atualizar mensagem automática:', updateError)
      throw updateError
    }

    console.log('✅ Mensagem enviada com sucesso para lead:', id)
    return automaticMessage
  }

  // Atualizar status de mensagem enviada
  static async atualizarMensagem(id: string, data: UpdateAutomaticMessageInput) {
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

    // Atualizar automatic_messages
    const { data: automaticMessage, error: automaticMessageError } = await supabase!
      .from('automatic_messages')
      .update(updateData)
      .eq('id', lead.followup_id)
      .select()
      .single()

    if (automaticMessageError) {
      console.error('❌ Erro ao atualizar status de mensagem:', automaticMessageError)
      throw automaticMessageError
    }

    console.log('✅ Status de mensagem atualizado com sucesso para lead:', id)
    return automaticMessage
  }

  // Atualizar etapa do funil
  static async atualizarEtapa(id: string, data: EtapaInput) {
    LeadService.checkSupabaseConnection();
    console.log('🔄 Atualizando etapa do lead:', id, 'nova etapa:', data.etapa_funil_id)

    const { data: lead, error } = await supabase!
      .from('leads')
      .update({
        etapa_funil_id: data.etapa_funil_id,
        updated_at: new Date().toISOString()
      })
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
      .update({
        status_negociacao_id: data.status_negociacao_id,
        updated_at: new Date().toISOString()
      })
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
      .select(`
        *,
        origem:origem_id (nome),
        qualificacao:qualificacao_id (*)
      `)
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
    const countQuery = supabase!
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('cliente_id', clienteId)
      .eq('deletado', false)

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('❌ Erro ao contar leads:', countError)
      throw countError
    }

    console.log(`📊 Total de leads encontrados: ${count}`)

    // Buscar todos os registros em lotes de 1000 (limite do Supabase)
    const batchSize = 1000
    const totalBatches = Math.ceil((count || 0) / batchSize)
    let allLeads: any[] = []

    for (let i = 0; i < totalBatches; i++) {
      const from = i * batchSize
      const to = from + batchSize - 1

      console.log(`🔄 Buscando lote ${i + 1}/${totalBatches} (registros ${from} a ${to})`)

      const { data: batchLeads, error } = await supabase!
        .from('leads')
        .select(`
          *,
          origem:origem_id (nome),
          qualificacao:qualificacao_id (*)
        `)
        .eq('cliente_id', clienteId)
        .eq('deletado', false)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error(`❌ Erro ao buscar lote ${i + 1}:`, error)
        throw error
      }

      allLeads = allLeads.concat(batchLeads || [])
      console.log(`✅ Lote ${i + 1} carregado: ${batchLeads?.length || 0} registros`)
    }

    console.log(`✅ Total de leads carregados: ${allLeads.length} de ${count}`)

    // Buscar atribuições ativas com dados do vendedor
    const leadIds = allLeads.map(l => l.id)
    if (leadIds.length > 0) {
      const { data: atribuicoes, error: atribError } = await supabase!
        .from('lead_atribuicoes')
        .select(`
          lead_id,
          vendedor_id,
          vendedor:vendedor_id (
            id,
            full_name,
            email
          )
        `)
        .eq('cliente_id', clienteId)
        .eq('status', 'ativo')
        .in('lead_id', leadIds)

      if (!atribError && atribuicoes) {
        // Criar mapa de lead_id -> vendedor
        const vendedorMap = new Map<string, any>()
        for (const atrib of atribuicoes) {
          vendedorMap.set(atrib.lead_id, atrib.vendedor)
        }

        // Adicionar vendedor a cada lead
        allLeads = allLeads.map(lead => ({
          ...lead,
          vendedor: vendedorMap.get(lead.id) || null
        }))

        console.log(`✅ Vendedores atribuídos carregados para ${atribuicoes.length} leads`)
      }
    }

    return {
      leads: allLeads,
      total: count || 0
    }
  }

  // List leads assigned to a specific salesperson
  static async listBySalesperson(clienteId: string, vendedorId: string) {
    LeadService.checkSupabaseConnection()
    console.log(`🔄 Listing leads for salesperson: ${vendedorId}`)

    // Get lead IDs from active assignments for this salesperson
    const { data: assignments, error: assignmentError } = await supabase!
      .from('lead_atribuicoes')
      .select('lead_id')
      .eq('cliente_id', clienteId)
      .eq('vendedor_id', vendedorId)
      .eq('status', 'ativo')

    if (assignmentError) {
      console.error('❌ Error fetching assignments:', assignmentError)
      throw assignmentError
    }

    const leadIds = assignments?.map(a => a.lead_id) || []

    if (leadIds.length === 0) {
      console.log('✅ No leads assigned to this salesperson')
      return { leads: [], total: 0 }
    }

    // Fetch leads using the IDs
    const { data: leads, error } = await supabase!
      .from('leads')
      .select(`
        *,
        origem:origem_id (nome),
        qualificacao:qualificacao_id (*)
      `)
      .eq('cliente_id', clienteId)
      .eq('deletado', false)
      .in('id', leadIds)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching leads for salesperson:', error)
      throw error
    }

    console.log(`✅ Found ${leads?.length || 0} leads for salesperson ${vendedorId}`)

    return {
      leads: leads || [],
      total: leads?.length || 0
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

      // Atualizar o lead incluindo updated_at
      let updateQuery = supabase!
        .from('leads')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
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
        .update({
          deletado: true,
          updated_at: new Date().toISOString()
        })
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
        .update({
          ai_habilitada: aiHabilitada,
          updated_at: new Date().toISOString()
        })
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

  // Atualizar qualificação do lead por nome da qualificação
  static async atualizarQualificacaoPorNome(id: string, nomeQualificacao: string) {
    LeadService.checkSupabaseConnection()
    console.log('🔄 Atualizando qualificação do lead:', id, 'para:', nomeQualificacao)

    try {
      // Primeiro, buscar a qualificação pelo nome
      const qualificacao = await QualificacaoService.buscarQualificacaoPorNome(nomeQualificacao)

      if (!qualificacao) {
        throw new Error(`Qualificação '${nomeQualificacao}' não encontrada`)
      }

      // Verificar se o lead existe e buscar dados completos para distribuição
      const { data: leadExistente, error: leadError } = await supabase!
        .from('leads')
        .select('id, nome, telefone, email, empresa, qualificacao_id, cliente_id')
        .eq('id', id)
        .eq('deletado', false)
        .single()

      if (leadError) {
        console.error('❌ Erro ao buscar lead:', leadError)
        if (leadError.code === 'PGRST116') {
          throw new Error('Lead não encontrado')
        }
        throw leadError
      }

      // Atualizar a qualificação do lead
      const { data, error } = await supabase!
        .from('leads')
        .update({
          qualificacao_id: qualificacao.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          id,
          nome,
          qualificacao_id,
          qualificacao:qualificacao_id(id, nome, descricao)
        `)
        .single()

      if (error) {
        console.error('❌ Erro ao atualizar qualificação do lead:', error)
        throw error
      }

      console.log('✅ Qualificação do lead atualizada com sucesso:', data)

      // Hook: Se qualificação mudou para "Decidido", distribuir automaticamente
      if (nomeQualificacao.toLowerCase() === 'decidido' && leadExistente.cliente_id) {
        console.log('🎯 Lead qualificado como Decidido - iniciando distribuição automática')
        try {
          const resultado = await LeadDistribuicaoService.distribuirLeadDecidido({
            id: leadExistente.id,
            nome: leadExistente.nome,
            telefone: leadExistente.telefone,
            email: leadExistente.email,
            empresa: leadExistente.empresa,
            cliente_id: leadExistente.cliente_id
          })

          if (resultado.sucesso) {
            if (resultado.naFila) {
              console.log('📋 Lead adicionado à fila de espera (sem vendedor disponível)')
            } else {
              console.log('✅ Lead distribuído para vendedor:', resultado.vendedor?.nome)
            }
          }
        } catch (distError) {
          console.error('⚠️ Erro na distribuição automática (não crítico):', distError)
        }
      }

      return data
    } catch (error) {
      console.error('❌ Erro ao atualizar qualificação do lead:', error)
      throw error
    }
  }

  // Gerar relatório de atualizações de leads por período
  static async gerarRelatorioDiario(clienteId: string, dataInicio: string, dataFim: string) {
    LeadService.checkSupabaseConnection()
    console.log('📊 Gerando relatório para:', clienteId, 'período:', dataInicio, 'até', dataFim)

    try {
      // Datas no formato local (sem timezone)
      const dataInicioFormatada = `${dataInicio}T00:00:00`
      const dataFimFormatada = `${dataFim}T23:59:59.999`

      console.log(`🔍 Buscando atualizações entre ${dataInicioFormatada} e ${dataFimFormatada}`)

      // Buscar leads criados no dia em lotes
      const { count: countCriados } = await supabase!
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_id', clienteId)
        .eq('deletado', false)
        .gte('created_at', dataInicioFormatada)
        .lte('created_at', dataFimFormatada)

      console.log(`📊 Total de leads criados: ${countCriados}`)

      const batchSize = 1000
      const totalBatchesCriados = Math.ceil((countCriados || 0) / batchSize)
      let leadsCriados: any[] = []

      for (let i = 0; i < totalBatchesCriados; i++) {
        const from = i * batchSize
        const to = from + batchSize - 1

        console.log(`🔄 Buscando lote ${i + 1}/${totalBatchesCriados} de leads criados`)

        const { data: batchLeads, error: errorCriados } = await supabase!
          .from('leads')
          .select(`
            id,
            nome,
            telefone,
            email,
            empresa,
            created_at,
            origem:origem_id (nome),
            qualificacao:qualificacao_id (nome)
          `)
          .eq('cliente_id', clienteId)
          .eq('deletado', false)
          .gte('created_at', dataInicioFormatada)
          .lte('created_at', dataFimFormatada)
          .order('created_at', { ascending: false })
          .range(from, to)

        if (errorCriados) {
          console.error('❌ Erro ao buscar leads criados:', errorCriados)
          throw errorCriados
        }

        leadsCriados = leadsCriados.concat(batchLeads || [])
        console.log(`✅ Lote ${i + 1} carregado: ${batchLeads?.length || 0} registros`)
      }

      // Buscar leads atualizados no dia (mas não criados no dia) em lotes
      const { count: countAtualizados } = await supabase!
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_id', clienteId)
        .eq('deletado', false)
        .gte('updated_at', dataInicioFormatada)
        .lte('updated_at', dataFimFormatada)
        .lt('created_at', dataInicioFormatada)

      console.log(`📊 Total de leads atualizados: ${countAtualizados}`)

      const totalBatchesAtualizados = Math.ceil((countAtualizados || 0) / batchSize)
      let leadsAtualizados: any[] = []

      for (let i = 0; i < totalBatchesAtualizados; i++) {
        const from = i * batchSize
        const to = from + batchSize - 1

        console.log(`🔄 Buscando lote ${i + 1}/${totalBatchesAtualizados} de leads atualizados`)

        const { data: batchLeads, error: errorAtualizados } = await supabase!
          .from('leads')
          .select(`
            id,
            nome,
            telefone,
            email,
            empresa,
            created_at,
            updated_at,
            origem:origem_id (nome),
            qualificacao:qualificacao_id (nome)
          `)
          .eq('cliente_id', clienteId)
          .eq('deletado', false)
          .gte('updated_at', dataInicioFormatada)
          .lte('updated_at', dataFimFormatada)
          .lt('created_at', dataInicioFormatada)
          .order('updated_at', { ascending: false })
          .range(from, to)

        if (errorAtualizados) {
          console.error('❌ Erro ao buscar leads atualizados:', errorAtualizados)
          throw errorAtualizados
        }

        leadsAtualizados = leadsAtualizados.concat(batchLeads || [])
        console.log(`✅ Lote ${i + 1} carregado: ${batchLeads?.length || 0} registros`)
      }

      // Buscar leads deletados no dia em lotes
      const { count: countDeletados } = await supabase!
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_id', clienteId)
        .eq('deletado', true)
        .gte('updated_at', dataInicioFormatada)
        .lte('updated_at', dataFimFormatada)

      console.log(`📊 Total de leads deletados: ${countDeletados}`)

      const totalBatchesDeletados = Math.ceil((countDeletados || 0) / batchSize)
      let leadsDeletados: any[] = []

      for (let i = 0; i < totalBatchesDeletados; i++) {
        const from = i * batchSize
        const to = from + batchSize - 1

        console.log(`🔄 Buscando lote ${i + 1}/${totalBatchesDeletados} de leads deletados`)

        const { data: batchLeads, error: errorDeletados } = await supabase!
          .from('leads')
          .select(`
            id,
            nome,
            telefone,
            email,
            empresa,
            updated_at,
            origem:origem_id (nome),
            qualificacao:qualificacao_id (nome)
          `)
          .eq('cliente_id', clienteId)
          .eq('deletado', true)
          .gte('updated_at', dataInicioFormatada)
          .lte('updated_at', dataFimFormatada)
          .order('updated_at', { ascending: false })
          .range(from, to)

        if (errorDeletados) {
          console.error('❌ Erro ao buscar leads deletados:', errorDeletados)
          throw errorDeletados
        }

        leadsDeletados = leadsDeletados.concat(batchLeads || [])
        console.log(`✅ Lote ${i + 1} carregado: ${batchLeads?.length || 0} registros`)
      }

      // Agrupar por qualificação e origem (todos os leads: criados + atualizados)
      const leadsPorQualificacao: Record<string, number> = {}
      const leadsPorOrigem: Record<string, number> = {}

      const todosLeads = [...leadsCriados, ...leadsAtualizados]

      todosLeads.forEach((lead: any) => {
        const qualificacao = lead.qualificacao?.nome || 'Sem qualificação'
        const origem = lead.origem?.nome || 'Sem origem'
        
        leadsPorQualificacao[qualificacao] = (leadsPorQualificacao[qualificacao] || 0) + 1
        leadsPorOrigem[origem] = (leadsPorOrigem[origem] || 0) + 1
      })

      // Montar resumo
      const resumo = {
        periodo: {
          data_inicio: dataInicio,
          data_fim: dataFim
        },
        totais: {
          criados: leadsCriados?.length || 0,
          atualizados: leadsAtualizados?.length || 0,
          deletados: leadsDeletados?.length || 0,
          total: (leadsCriados?.length || 0) + (leadsAtualizados?.length || 0)
        },
        distribuicao: {
          por_qualificacao: leadsPorQualificacao,
          por_origem: leadsPorOrigem
        },
        detalhes: {
          leads_criados: leadsCriados || [],
          leads_atualizados: leadsAtualizados || [],
          leads_deletados: leadsDeletados || []
        }
      }

      console.log('✅ Relatório diário gerado com sucesso')
      console.log(`📊 Resumo: ${resumo.totais.criados} criados, ${resumo.totais.atualizados} atualizados, ${resumo.totais.deletados} deletados`)

      return resumo
    } catch (error) {
      console.error('❌ Erro ao gerar relatório diário:', error)
      throw error
    }
  }
}