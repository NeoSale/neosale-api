"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadService = void 0;
const supabase_1 = require("../lib/supabase");
class LeadService {
    // Importar leads
    static async importLeads(data) {
        console.log('🔄 Iniciando importação de leads:', data.leads.length, 'leads');
        const results = [];
        for (const leadData of data.leads) {
            try {
                // Criar mensagem_status primeiro
                const { data: mensagemStatus, error: mensagemError } = await supabase_1.supabase
                    .from('mensagem_status')
                    .insert({})
                    .select()
                    .single();
                if (mensagemError) {
                    console.error('❌ Erro ao criar mensagem_status:', mensagemError);
                    throw mensagemError;
                }
                // Criar lead com referência ao mensagem_status
                const { data: lead, error: leadError } = await supabase_1.supabase
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
                    .single();
                if (leadError) {
                    console.error('❌ Erro ao criar lead:', leadError);
                    throw leadError;
                }
                console.log('✅ Lead criado com sucesso:', lead.id);
                results.push(lead);
            }
            catch (error) {
                console.error('❌ Erro ao processar lead:', leadData, error);
                throw error;
            }
        }
        console.log('✅ Importação concluída:', results.length, 'leads criados');
        return results;
    }
    // Importar leads em lote (bulk) sem origem_id
    static async bulkImportLeads(data) {
        console.log('🔄 Iniciando importação em lote de leads:', data.leads.length, 'leads');
        // Buscar a origem 'outbound'
        const { data: origens, error: origemError } = await supabase_1.supabase
            .from('origens_leads')
            .select('id')
            .eq('nome', 'outbound')
            .single();
        if (origemError || !origens) {
            throw new Error('Origem "outbound" não encontrada. É necessário ter a origem "outbound" cadastrada.');
        }
        const origemOutbound = origens.id;
        const results = [];
        for (const leadData of data.leads) {
            try {
                // Criar mensagem_status primeiro
                const { data: mensagemStatus, error: mensagemError } = await supabase_1.supabase
                    .from('mensagem_status')
                    .insert({})
                    .select()
                    .single();
                if (mensagemError) {
                    console.error('❌ Erro ao criar mensagem_status:', mensagemError);
                    throw mensagemError;
                }
                // Criar lead com referência ao mensagem_status e origem outbound
                const { data: lead, error: leadError } = await supabase_1.supabase
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
                    .single();
                if (leadError) {
                    console.error('❌ Erro ao criar lead:', leadError);
                    throw leadError;
                }
                console.log('✅ Lead criado com sucesso:', lead.id);
                results.push(lead);
            }
            catch (error) {
                console.error('❌ Erro ao processar lead:', leadData, error);
                throw error;
            }
        }
        console.log('✅ Importação em lote concluída:', results.length, 'leads criados');
        return results;
    }
    // Agendar lead
    static async agendarLead(id, data) {
        console.log('🔄 Agendando lead:', id);
        const updateData = {
            status_agendamento: true
        };
        if (data.agendado_em) {
            updateData.agendado_em = data.agendado_em;
        }
        const { data: lead, error } = await supabase_1.supabase
            .from('leads')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('❌ Erro ao agendar lead:', error);
            throw error;
        }
        console.log('✅ Lead agendado com sucesso:', id);
        return lead;
    }
    // Enviar mensagem
    static async enviarMensagem(id, data) {
        console.log('🔄 Enviando mensagem para lead:', id, 'tipo:', data.tipo_mensagem);
        // Buscar o lead para obter o mensagem_status_id
        const { data: lead, error: leadError } = await supabase_1.supabase
            .from('leads')
            .select('mensagem_status_id')
            .eq('id', id)
            .single();
        if (leadError) {
            console.error('❌ Erro ao buscar lead:', leadError);
            throw leadError;
        }
        // Atualizar mensagem_status
        const updateData = {};
        updateData[`${data.tipo_mensagem}_enviada`] = true;
        updateData[`${data.tipo_mensagem}_data`] = new Date().toISOString();
        const { data: mensagemStatus, error: mensagemError } = await supabase_1.supabase
            .from('mensagem_status')
            .update(updateData)
            .eq('id', lead.mensagem_status_id)
            .select()
            .single();
        if (mensagemError) {
            console.error('❌ Erro ao atualizar mensagem_status:', mensagemError);
            throw mensagemError;
        }
        console.log('✅ Mensagem enviada com sucesso:', data.tipo_mensagem);
        return mensagemStatus;
    }
    // Atualizar status de mensagem enviada
    static async atualizarMensagem(id, data) {
        console.log('🔄 Atualizando status de mensagem do lead:', id, 'tipo:', data.tipo_mensagem);
        // Buscar o lead para obter o mensagem_status_id
        const { data: lead, error: leadError } = await supabase_1.supabase
            .from('leads')
            .select('mensagem_status_id')
            .eq('id', id)
            .single();
        if (leadError) {
            console.error('❌ Erro ao buscar lead:', leadError);
            throw leadError;
        }
        // Preparar dados para atualização
        const updateData = {};
        updateData[`${data.tipo_mensagem}_enviada`] = data.enviada;
        // Se data foi fornecida, usar ela; senão usar data atual se enviada for true
        if (data.data) {
            updateData[`${data.tipo_mensagem}_data`] = data.data;
        }
        else if (data.enviada) {
            updateData[`${data.tipo_mensagem}_data`] = new Date().toISOString();
        }
        else {
            // Se enviada for false e não há data específica, limpar a data
            updateData[`${data.tipo_mensagem}_data`] = null;
        }
        // Atualizar mensagem_status
        const { data: mensagemStatus, error: mensagemError } = await supabase_1.supabase
            .from('mensagem_status')
            .update(updateData)
            .eq('id', lead.mensagem_status_id)
            .select()
            .single();
        if (mensagemError) {
            console.error('❌ Erro ao atualizar status de mensagem:', mensagemError);
            throw mensagemError;
        }
        console.log('✅ Status de mensagem atualizado com sucesso:', data.tipo_mensagem);
        return mensagemStatus;
    }
    // Atualizar etapa do funil
    static async atualizarEtapa(id, data) {
        console.log('🔄 Atualizando etapa do lead:', id, 'nova etapa:', data.etapa_funil_id);
        const { data: lead, error } = await supabase_1.supabase
            .from('leads')
            .update({ etapa_funil_id: data.etapa_funil_id })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('❌ Erro ao atualizar etapa:', error);
            throw error;
        }
        console.log('✅ Etapa atualizada com sucesso:', id);
        return lead;
    }
    // Atualizar status de negociação
    static async atualizarStatus(id, data) {
        console.log('🔄 Atualizando status do lead:', id, 'novo status:', data.status_negociacao_id);
        const { data: lead, error } = await supabase_1.supabase
            .from('leads')
            .update({ status_negociacao_id: data.status_negociacao_id })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('❌ Erro ao atualizar status:', error);
            throw error;
        }
        console.log('✅ Status atualizado com sucesso:', id);
        return lead;
    }
    // Buscar lead por ID
    static async buscarPorId(id) {
        console.log('🔄 Buscando lead:', id);
        const { data: lead, error } = await supabase_1.supabase
            .from('leads')
            .select(`
        *,
        mensagem_status:mensagem_status_id(*),
        origem:origem_id(*),
        etapa_funil:etapa_funil_id(*),
        status_negociacao:status_negociacao_id(*)
      `)
            .eq('id', id)
            .single();
        if (error) {
            console.error('❌ Erro ao buscar lead:', error);
            throw error;
        }
        console.log('✅ Lead encontrado:', id);
        return lead;
    }
    // Listar todos os leads
    static async listarTodos() {
        console.log('🔄 Listando todos os leads');
        const { data: leads, error } = await supabase_1.supabase
            .from('leads')
            .select(`
        *,
        mensagem_status:mensagem_status_id(*),
        origem:origem_id(*),
        etapa_funil:etapa_funil_id(*),
        status_negociacao:status_negociacao_id(*)
      `)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('❌ Erro ao listar leads:', error);
            throw error;
        }
        console.log('✅ Leads listados:', leads?.length || 0, 'encontrados');
        return leads || [];
    }
    // Listar leads com paginação
    static async listarComPaginacao(params) {
        console.log('🔄 Listando leads com paginação:', params);
        const { page, limit, search } = params;
        const offset = (page - 1) * limit;
        let query = supabase_1.supabase
            .from('leads')
            .select(`
        *,
        mensagem_status:mensagem_status_id(*),
        origem:origem_id(*),
        etapa_funil:etapa_funil_id(*),
        status_negociacao:status_negociacao_id(*)
      `, { count: 'exact' });
        // Aplicar filtro de busca se fornecido
        if (search && search.trim()) {
            query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%,telefone.ilike.%${search}%`);
        }
        // Aplicar paginação e ordenação
        const { data: leads, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error) {
            console.error('❌ Erro ao listar leads paginados:', error);
            throw error;
        }
        const totalPages = Math.ceil((count || 0) / limit);
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
        };
        console.log('✅ Leads paginados listados:', {
            total: count,
            page,
            limit,
            totalPages,
            returned: leads?.length || 0
        });
        return result;
    }
    // Obter estatísticas dos leads
    static async obterEstatisticas() {
        console.log('🔄 Obtendo estatísticas dos leads');
        try {
            // Total de leads
            const { count: total, error: totalError } = await supabase_1.supabase
                .from('leads')
                .select('*', { count: 'exact', head: true });
            if (totalError)
                throw totalError;
            // Leads com email
            const { count: withEmail, error: emailError } = await supabase_1.supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .not('email', 'is', null)
                .neq('email', '');
            if (emailError)
                throw emailError;
            // Leads qualificados (etapa >= qualificacao)
            const { data: etapaQualificacao, error: etapaError } = await supabase_1.supabase
                .from('etapas_funil')
                .select('id')
                .in('nome', ['qualificacao', 'reuniao', 'apresentacao', 'negociacao', 'fechamento']);
            if (etapaError)
                throw etapaError;
            const etapaIds = etapaQualificacao.map(e => e.id);
            const { count: qualified, error: qualifiedError } = await supabase_1.supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .in('etapa_funil_id', etapaIds);
            if (qualifiedError)
                throw qualifiedError;
            // Leads novos (últimos 7 dias)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const { count: newLeads, error: newError } = await supabase_1.supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', sevenDaysAgo.toISOString());
            if (newError)
                throw newError;
            // Leads por status de negociação
            const { data: statusData, error: statusError } = await supabase_1.supabase
                .from('leads')
                .select(`
          status_negociacao:status_negociacao_id(
            nome
          )
        `);
            if (statusError)
                throw statusError;
            const byStatus = {};
            statusData?.forEach((lead) => {
                const statusNome = lead.status_negociacao?.nome || 'sem_status';
                byStatus[statusNome] = (byStatus[statusNome] || 0) + 1;
            });
            const stats = {
                total: total || 0,
                withEmail: withEmail || 0,
                qualified: qualified || 0,
                new: newLeads || 0,
                byStatus
            };
            console.log('✅ Estatísticas obtidas:', stats);
            return stats;
        }
        catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            throw error;
        }
    }
    // Atualizar lead
    static async atualizarLead(id, data) {
        try {
            console.log('🔄 Atualizando lead:', id, data);
            // Verificar se o lead existe
            const { data: leadExistente, error: errorVerificacao } = await supabase_1.supabase
                .from('leads')
                .select('id')
                .eq('id', id)
                .single();
            if (errorVerificacao || !leadExistente) {
                throw new Error('Lead não encontrado');
            }
            // Atualizar o lead
            const { data: leadAtualizado, error: errorAtualizacao } = await supabase_1.supabase
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
                .single();
            if (errorAtualizacao) {
                console.error('❌ Erro ao atualizar lead:', errorAtualizacao);
                throw errorAtualizacao;
            }
            console.log('✅ Lead atualizado com sucesso:', leadAtualizado.id);
            return leadAtualizado;
        }
        catch (error) {
            console.error('❌ Erro ao atualizar lead:', error);
            throw error;
        }
    }
    // Excluir lead
    static async excluirLead(id) {
        try {
            console.log('🔄 Excluindo lead:', id);
            // Verificar se o lead existe e obter o mensagem_status_id
            const { data: leadExistente, error: errorVerificacao } = await supabase_1.supabase
                .from('leads')
                .select('id, mensagem_status_id')
                .eq('id', id)
                .single();
            if (errorVerificacao || !leadExistente) {
                throw new Error('Lead não encontrado');
            }
            // Excluir o lead (isso também excluirá o mensagem_status devido ao CASCADE)
            const { error: errorExclusao } = await supabase_1.supabase
                .from('leads')
                .delete()
                .eq('id', id);
            if (errorExclusao) {
                console.error('❌ Erro ao excluir lead:', errorExclusao);
                throw errorExclusao;
            }
            console.log('✅ Lead excluído com sucesso:', id);
            return { success: true, message: 'Lead excluído com sucesso' };
        }
        catch (error) {
            console.error('❌ Erro ao excluir lead:', error);
            throw error;
        }
    }
}
exports.LeadService = LeadService;
//# sourceMappingURL=leadService.js.map