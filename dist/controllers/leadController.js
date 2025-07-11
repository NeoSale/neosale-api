"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadController = void 0;
const leadService_1 = require("../services/leadService");
const validators_1 = require("../lib/validators");
const zod_1 = require("zod");
class LeadController {
    // Utilitário para extrair ID da URL
    static extractIdFromUrl(req) {
        const { id } = req.params;
        return id || '';
    }
    // Utilitário para tratamento de erros
    static handleError(res, error) {
        console.error('❌ Erro no controller:', error);
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: error.errors
            });
        }
        // Verificar se o erro tem statusCode customizado
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        if (error.code === 'PGRST116') {
            return res.status(404).json({
                success: false,
                message: 'Recurso não encontrado'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
    // Criar um único lead
    static async criarLead(req, res) {
        try {
            const validatedData = validators_1.createLeadSchema.parse(req.body);
            const lead = await leadService_1.LeadService.criarLead(validatedData);
            return res.status(201).json({
                success: true,
                message: 'Lead criado com sucesso',
                data: lead
            });
        }
        catch (error) {
            return LeadController.handleError(res, error);
        }
    }
    // Importar leads
    static async importLeads(req, res) {
        try {
            const validatedData = validators_1.importLeadsSchema.parse(req.body);
            const result = await leadService_1.LeadService.importLeads(validatedData);
            const message = result.skipped.length > 0
                ? `${result.created.length} leads importados com sucesso, ${result.skipped.length} leads pulados por duplicação`
                : `${result.created.length} leads importados com sucesso`;
            return res.status(201).json({
                success: true,
                message,
                data: {
                    created: result.created,
                    skipped: result.skipped,
                    summary: {
                        total_processed: validatedData.leads.length,
                        created_count: result.created.length,
                        skipped_count: result.skipped.length
                    }
                }
            });
        }
        catch (error) {
            return LeadController.handleError(res, error);
        }
    }
    // Importar leads em lote (bulk)
    static async bulkImportLeads(req, res) {
        try {
            const validatedData = validators_1.bulkLeadsSchema.parse(req.body);
            const result = await leadService_1.LeadService.bulkImportLeads(validatedData);
            const message = result.skipped.length > 0
                ? `${result.created.length} leads importados em lote com sucesso, ${result.skipped.length} leads pulados por duplicação`
                : `${result.created.length} leads importados em lote com sucesso`;
            return res.status(201).json({
                success: true,
                message,
                data: {
                    created: result.created,
                    skipped: result.skipped,
                    summary: {
                        total_processed: validatedData.leads.length,
                        created_count: result.created.length,
                        skipped_count: result.skipped.length
                    }
                }
            });
        }
        catch (error) {
            return LeadController.handleError(res, error);
        }
    }
    // Obter informações sobre importação
    static async getImportInfo(req, res) {
        return res.status(200).json({
            success: true,
            message: 'Endpoint para importação de leads',
            usage: {
                method: 'POST',
                body: {
                    leads: [
                        {
                            nome: 'string',
                            telefone: 'string',
                            email: 'string (email válido)',
                            origem_id: 'string (UUID)'
                        }
                    ]
                }
            }
        });
    }
    // Agendar lead
    static async agendarLead(req, res) {
        try {
            const id = LeadController.extractIdFromUrl(req);
            validators_1.idParamSchema.parse({ id });
            const validatedData = validators_1.agendamentoSchema.parse(req.body);
            const lead = await leadService_1.LeadService.agendarLead(id, validatedData);
            return res.status(200).json({
                success: true,
                message: 'Lead agendado com sucesso',
                data: lead
            });
        }
        catch (error) {
            return LeadController.handleError(res, error);
        }
    }
    // GET /api/leads/[id]/agendamento
    static async getAgendamentoInfo(req, res) {
        const id = LeadController.extractIdFromUrl(req);
        return res.status(200).json({
            success: true,
            message: `Endpoint para agendamento do lead ${id}`,
            usage: {
                method: 'POST',
                body: {
                    agendado_em: 'string (datetime pt-BR) - opcional'
                }
            }
        });
    }
    // Enviar mensagem
    static async enviarMensagem(req, res) {
        try {
            const id = LeadController.extractIdFromUrl(req);
            validators_1.idParamSchema.parse({ id });
            const validatedData = validators_1.mensagemSchema.parse(req.body);
            const mensagemStatus = await leadService_1.LeadService.enviarMensagem(id, validatedData);
            return res.status(200).json({
                success: true,
                message: `${validatedData.tipo_mensagem} enviada com sucesso`,
                data: mensagemStatus
            });
        }
        catch (error) {
            return LeadController.handleError(res, error);
        }
    }
    // GET /api/leads/[id]/mensagens
    static async getMensagensInfo(req, res) {
        const id = LeadController.extractIdFromUrl(req);
        return res.status(200).json({
            success: true,
            message: `Endpoint para envio de mensagens do lead ${id}`,
            usage: {
                method: 'POST',
                body: {
                    tipo_mensagem: 'mensagem_1 | mensagem_2 | mensagem_3'
                }
            }
        });
    }
    // Atualizar etapa do funil
    static async atualizarEtapa(req, res) {
        try {
            const id = LeadController.extractIdFromUrl(req);
            validators_1.idParamSchema.parse({ id });
            const validatedData = validators_1.etapaSchema.parse(req.body);
            const lead = await leadService_1.LeadService.atualizarEtapa(id, validatedData);
            return res.status(200).json({
                success: true,
                message: 'Etapa do funil atualizada com sucesso',
                data: lead
            });
        }
        catch (error) {
            return LeadController.handleError(res, error);
        }
    }
    // GET /api/leads/[id]/etapa
    static async getEtapaInfo(req, res) {
        const id = LeadController.extractIdFromUrl(req);
        return res.status(200).json({
            success: true,
            message: `Endpoint para atualização de etapa do lead ${id}`,
            usage: {
                method: 'PATCH',
                body: {
                    etapa_funil_id: 'string (UUID)'
                }
            }
        });
    }
    // Atualizar status de negociação
    static async atualizarStatus(req, res) {
        try {
            const id = LeadController.extractIdFromUrl(req);
            validators_1.idParamSchema.parse({ id });
            const validatedData = validators_1.statusSchema.parse(req.body);
            const lead = await leadService_1.LeadService.atualizarStatus(id, validatedData);
            return res.status(200).json({
                success: true,
                message: 'Status de negociação atualizado com sucesso',
                data: lead
            });
        }
        catch (error) {
            return LeadController.handleError(res, error);
        }
    }
    // GET /api/leads/[id]/status
    static async getStatusInfo(req, res) {
        const id = LeadController.extractIdFromUrl(req);
        return res.status(200).json({
            success: true,
            message: `Endpoint para atualização de status do lead ${id}`,
            usage: {
                method: 'PATCH',
                body: {
                    status_negociacao_id: 'string (UUID)'
                }
            }
        });
    }
    // GET /api/leads/[id] - Buscar lead específico
    static async buscarLead(req, res) {
        try {
            const id = LeadController.extractIdFromUrl(req);
            validators_1.idParamSchema.parse({ id });
            const lead = await leadService_1.LeadService.buscarPorId(id);
            return res.status(200).json({
                success: true,
                message: 'Lead encontrado',
                data: lead
            });
        }
        catch (error) {
            return LeadController.handleError(res, error);
        }
    }
    // GET /api/leads/telefone/[telefone] - Buscar lead por telefone
    static async buscarPorTelefone(req, res) {
        try {
            const { telefone } = req.params;
            if (!telefone) {
                return res.status(400).json({
                    success: false,
                    message: 'Telefone é obrigatório'
                });
            }
            const lead = await leadService_1.LeadService.buscarPorTelefone(telefone);
            return res.status(200).json({
                success: true,
                message: 'Lead encontrado',
                data: lead
            });
        }
        catch (error) {
            return LeadController.handleError(res, error);
        }
    }
    // Listar todos os leads
    static async listarLeads(req, res) {
        try {
            console.log('📋 Listando todos os leads');
            const leads = await leadService_1.LeadService.listarTodos();
            return res.status(200).json({
                success: true,
                data: leads,
                message: 'Leads listados com sucesso'
            });
        }
        catch (error) {
            console.error('❌ Erro ao listar leads:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
    // Listar leads com paginação
    static async listarLeadsPaginados(req, res) {
        try {
            console.log('📋 Listando leads com paginação');
            // Validar parâmetros de paginação
            const params = validators_1.paginationSchema.parse(req.query);
            const result = await leadService_1.LeadService.listarComPaginacao(params);
            return res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination,
                message: 'Leads listados com sucesso'
            });
        }
        catch (error) {
            console.error('❌ Erro ao listar leads paginados:', error);
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Dados inválidos',
                    details: error.errors
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
    // Obter estatísticas dos leads
    static async obterEstatisticas(req, res) {
        try {
            console.log('📊 Solicitação de estatísticas recebida');
            const stats = await leadService_1.LeadService.obterEstatisticas();
            return res.status(200).json({
                success: true,
                data: stats,
                message: 'Estatísticas obtidas com sucesso'
            });
        }
        catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
    // Atualizar lead
    static async atualizarLead(req, res) {
        try {
            // Validar ID
            const { id } = validators_1.idParamSchema.parse(req.params);
            // Validar dados de atualização
            const dadosAtualizacao = validators_1.updateLeadSchema.parse(req.body);
            // Atualizar lead
            const leadAtualizado = await leadService_1.LeadService.atualizarLead(id, dadosAtualizacao);
            return res.status(200).json({
                success: true,
                message: 'Lead atualizado com sucesso',
                data: leadAtualizado
            });
        }
        catch (error) {
            return LeadController.handleError(res, error);
        }
    }
    // Excluir lead
    static async excluirLead(req, res) {
        try {
            // Validar ID
            const { id } = validators_1.idParamSchema.parse(req.params);
            // Excluir lead
            const resultado = await leadService_1.LeadService.excluirLead(id);
            return res.status(200).json({
                success: true,
                message: resultado.message
            });
        }
        catch (error) {
            return LeadController.handleError(res, error);
        }
    }
    // Atualizar status de mensagem enviada
    static async atualizarMensagem(req, res) {
        try {
            const id = LeadController.extractIdFromUrl(req);
            validators_1.idParamSchema.parse({ id });
            const validatedData = validators_1.atualizarMensagemSchema.parse(req.body);
            const mensagemStatus = await leadService_1.LeadService.atualizarMensagem(id, validatedData);
            return res.status(200).json({
                success: true,
                message: `Status da ${validatedData.tipo_mensagem} atualizado com sucesso`,
                data: mensagemStatus
            });
        }
        catch (error) {
            return LeadController.handleError(res, error);
        }
    }
}
exports.LeadController = LeadController;
//# sourceMappingURL=leadController.js.map