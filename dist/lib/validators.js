"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setWebhookSchema = exports.updateEvolutionInstanceSchema = exports.createEvolutionInstanceSchema = exports.updateUsuarioSchema = exports.createUsuarioSchema = exports.updateClienteSchema = exports.createClienteSchema = exports.updateRevendedorSchema = exports.createRevendedorSchema = exports.updateTipoAcessoSchema = exports.createTipoAcessoSchema = exports.updateProvedorSchema = exports.createProvedorSchema = exports.updateConfiguracaoFollowupSchema = exports.createConfiguracaoFollowupSchema = exports.updateConfiguracaoSchema = exports.createConfiguracaoSchema = exports.createLeadSchema = exports.updateFollowupSchema = exports.createFollowupSchema = exports.updateLeadSchema = exports.paginationSchema = exports.idParamSchema = exports.statusSchema = exports.etapaSchema = exports.mensagemSchema = exports.agendamentoSchema = exports.bulkLeadsSchema = exports.importLeadsSchema = void 0;
const zod_1 = require("zod");
// Validator para importação de leads
exports.importLeadsSchema = zod_1.z.object({
    leads: zod_1.z.array(zod_1.z.object({
        nome: zod_1.z.string().min(1, 'Nome é obrigatório'),
        telefone: zod_1.z.string().min(1, 'Telefone é obrigatório'),
        email: zod_1.z.string().email('Email inválido'),
        empresa: zod_1.z.string().optional(),
        cargo: zod_1.z.string().optional(),
        origem_id: zod_1.z.string().uuid('origem_id deve ser um UUID válido')
    })).min(1, 'Pelo menos um lead deve ser fornecido')
});
// Validator para importação em lote (bulk) de leads
exports.bulkLeadsSchema = zod_1.z.object({
    leads: zod_1.z.array(zod_1.z.object({
        nome: zod_1.z.string().min(1, 'Nome é obrigatório'),
        telefone: zod_1.z.string().min(1, 'Telefone é obrigatório'),
        email: zod_1.z.string().email('Email inválido').optional(),
        empresa: zod_1.z.string().optional(),
        cargo: zod_1.z.string().optional()
    })).min(1, 'Pelo menos um lead deve ser fornecido')
});
// Validator para agendamento
exports.agendamentoSchema = zod_1.z.object({
    agendado_em: zod_1.z.string().datetime().optional()
});
// Validator para mensagens
exports.mensagemSchema = zod_1.z.object({
    mensagem_id: zod_1.z.string().uuid('mensagem_id deve ser um UUID válido')
});
// Validator para atualização de etapa
exports.etapaSchema = zod_1.z.object({
    etapa_funil_id: zod_1.z.string().uuid('etapa_funil_id deve ser um UUID válido')
});
// Validator para atualização de status
exports.statusSchema = zod_1.z.object({
    status_negociacao_id: zod_1.z.string().uuid('status_negociacao_id deve ser um UUID válido')
});
// Validator para parâmetros de ID
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('ID deve ser um UUID válido')
});
// Validator para paginação
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform((val) => {
        const num = parseInt(val || '1');
        return isNaN(num) || num < 1 ? 1 : num;
    }),
    limit: zod_1.z.string().optional().transform((val) => {
        const num = parseInt(val || '10');
        return isNaN(num) || num < 1 ? 10 : num > 100 ? 100 : num;
    }),
    search: zod_1.z.string().optional()
});
// Validator para atualização de lead
exports.updateLeadSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, 'Nome é obrigatório').optional(),
    telefone: zod_1.z.string().min(1, 'Telefone é obrigatório').optional(),
    email: zod_1.z.string().optional(),
    empresa: zod_1.z.string().optional(),
    cargo: zod_1.z.string().optional(),
    contador: zod_1.z.string().optional(),
    escritorio: zod_1.z.string().optional(),
    responsavel: zod_1.z.string().optional(),
    cnpj: zod_1.z.string().optional(),
    observacao: zod_1.z.string().optional(),
    segmento: zod_1.z.string().optional(),
    erp_atual: zod_1.z.string().optional(),
    origem_id: zod_1.z.string().uuid('origem_id deve ser um UUID válido').optional(),
    status_agendamento: zod_1.z.boolean().optional(),
    etapa_funil_id: zod_1.z.string().uuid('etapa_funil_id deve ser um UUID válido').optional(),
    status_negociacao_id: zod_1.z.string().uuid('status_negociacao_id deve ser um UUID válido').optional(),
    qualificacao_id: zod_1.z.string().uuid('qualificacao_id deve ser um UUID válido').optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização'
});
// Validator para criação de followup
exports.createFollowupSchema = zod_1.z.object({
    id_mensagem: zod_1.z.string().uuid('id_mensagem deve ser um UUID válido'),
    id_lead: zod_1.z.string().uuid('id_lead deve ser um UUID válido'),
    status: zod_1.z.enum(['sucesso', 'erro'], {
        errorMap: () => ({ message: 'Status deve ser sucesso ou erro' })
    }),
    erro: zod_1.z.string().optional(),
    mensagem_enviada: zod_1.z.string().min(1, 'Mensagem enviada é obrigatória'),
    embedding: zod_1.z.array(zod_1.z.number()).optional()
});
// Validator para atualização de followup
exports.updateFollowupSchema = zod_1.z.object({
    id_mensagem: zod_1.z.string().uuid('id_mensagem deve ser um UUID válido').optional(),
    id_lead: zod_1.z.string().uuid('id_lead deve ser um UUID válido').optional(),
    status: zod_1.z.enum(['sucesso', 'erro'], {
        errorMap: () => ({ message: 'Status deve ser sucesso ou erro' })
    }).optional(),
    erro: zod_1.z.string().optional(),
    mensagem_enviada: zod_1.z.string().min(1, 'Mensagem enviada é obrigatória').optional(),
    embedding: zod_1.z.array(zod_1.z.number()).optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização'
});
// Validator para criação de um único lead
exports.createLeadSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, 'Nome é obrigatório'),
    telefone: zod_1.z.string().min(1, 'Telefone é obrigatório'),
    email: zod_1.z.string().optional(),
    empresa: zod_1.z.string().optional(),
    cargo: zod_1.z.string().optional(),
    contador: zod_1.z.string().optional(),
    escritorio: zod_1.z.string().optional(),
    responsavel: zod_1.z.string().optional(),
    cnpj: zod_1.z.string().optional(),
    observacao: zod_1.z.string().optional(),
    segmento: zod_1.z.string().optional(),
    erp_atual: zod_1.z.string().optional(),
    origem_id: zod_1.z.string().uuid('origem_id deve ser um UUID válido').optional(),
    qualificacao_id: zod_1.z.string().uuid('qualificacao_id deve ser um UUID válido').optional()
});
// Validator para criação de configuração
exports.createConfiguracaoSchema = zod_1.z.object({
    chave: zod_1.z.string().min(1, 'Chave é obrigatória'),
    valor: zod_1.z.string().min(1, 'Valor é obrigatório')
});
// Validator para atualização de configuração
exports.updateConfiguracaoSchema = zod_1.z.object({
    chave: zod_1.z.string().min(1, 'Chave é obrigatória').optional(),
    valor: zod_1.z.string().min(1, 'Valor é obrigatório').optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização'
});
// ===== VALIDATORS PARA CONFIGURAÇÕES FOLLOWUP =====
// Validator para criação de configuração followup
exports.createConfiguracaoFollowupSchema = zod_1.z.object({
    horario_inicio: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Horário de início deve estar no formato HH:MM:SS'),
    horario_fim: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Horário de fim deve estar no formato HH:MM:SS'),
    qtd_envio_diario: zod_1.z.number().int().min(1, 'Quantidade de envio diário deve ser maior que 0'),
    somente_dias_uteis: zod_1.z.boolean()
});
// Validator para atualização de configuração followup
exports.updateConfiguracaoFollowupSchema = zod_1.z.object({
    horario_inicio: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Horário de início deve estar no formato HH:MM:SS').optional(),
    horario_fim: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Horário de fim deve estar no formato HH:MM:SS').optional(),
    qtd_envio_diario: zod_1.z.number().int().min(1, 'Quantidade de envio diário deve ser maior que 0').optional(),
    somente_dias_uteis: zod_1.z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização'
});
// ===== VALIDATORS PARA PROVEDORES =====
// Validator para criação de provedor
exports.createProvedorSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, 'Nome é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres'),
    descricao: zod_1.z.string().optional(),
    ativo: zod_1.z.boolean().optional().default(true)
});
// Validator para atualização de provedor
exports.updateProvedorSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, 'Nome é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres').optional(),
    descricao: zod_1.z.string().optional(),
    ativo: zod_1.z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização'
});
// ===== VALIDATORS PARA TIPOS DE ACESSO =====
// Validator para criação de tipo de acesso
exports.createTipoAcessoSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, 'Nome é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres'),
    descricao: zod_1.z.string().optional(),
    ativo: zod_1.z.boolean().optional().default(true)
});
// Validator para atualização de tipo de acesso
exports.updateTipoAcessoSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, 'Nome é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres').optional(),
    descricao: zod_1.z.string().optional(),
    ativo: zod_1.z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização'
});
// ===== VALIDATORS PARA REVENDEDORES =====
// Validator para criação de revendedor
exports.createRevendedorSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    email: zod_1.z.string().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres'),
    telefone: zod_1.z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
    status: zod_1.z.string().max(50, 'Status deve ter no máximo 50 caracteres').optional().default('ativo')
});
// Validator para atualização de revendedor
exports.updateRevendedorSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres').optional(),
    email: zod_1.z.string().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres').optional(),
    telefone: zod_1.z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
    status: zod_1.z.string().max(50, 'Status deve ter no máximo 50 caracteres').optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização'
});
// ===== VALIDATORS PARA CLIENTES =====
// Validator para criação de cliente
exports.createClienteSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    email: zod_1.z.string().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres'),
    telefone: zod_1.z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
    status: zod_1.z.string().max(50, 'Status deve ter no máximo 50 caracteres').optional().default('ativo'),
    revendedor_id: zod_1.z.string().uuid('revendedor_id deve ser um UUID válido').optional()
});
// Validator para atualização de cliente
exports.updateClienteSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres').optional(),
    email: zod_1.z.string().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres').optional(),
    telefone: zod_1.z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
    status: zod_1.z.string().max(50, 'Status deve ter no máximo 50 caracteres').optional(),
    revendedor_id: zod_1.z.string().uuid('revendedor_id deve ser um UUID válido').optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização'
});
// ===== VALIDATORS PARA USUÁRIOS =====
// Validator para criação de usuário
exports.createUsuarioSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    email: zod_1.z.string().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres'),
    telefone: zod_1.z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
    provedor_id: zod_1.z.string().uuid('provedor_id deve ser um UUID válido'),
    tipo_acesso_id: zod_1.z.string().uuid('tipo_acesso_id deve ser um UUID válido'),
    revendedor_id: zod_1.z.string().uuid('revendedor_id deve ser um UUID válido').optional(),
    ativo: zod_1.z.boolean().optional().default(true)
});
// Validator para atualização de usuário
exports.updateUsuarioSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres').optional(),
    email: zod_1.z.string().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres').optional(),
    telefone: zod_1.z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
    provedor_id: zod_1.z.string().uuid('provedor_id deve ser um UUID válido').optional(),
    tipo_acesso_id: zod_1.z.string().uuid('tipo_acesso_id deve ser um UUID válido').optional(),
    revendedor_id: zod_1.z.string().uuid('revendedor_id deve ser um UUID válido').optional(),
    ativo: zod_1.z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização'
});
// ===== VALIDATORS PARA EVOLUTION API =====
// Validator para criação de instância Evolution
exports.createEvolutionInstanceSchema = zod_1.z.object({
    instanceName: zod_1.z.string().min(1, 'Nome da instância é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
    token: zod_1.z.string().optional(),
    qrcode: zod_1.z.boolean().optional().default(true),
    number: zod_1.z.string().optional(),
    integration: zod_1.z.string().optional(),
    webhookUrl: zod_1.z.string().url('URL do webhook deve ser válida').optional(),
    webhookByEvents: zod_1.z.boolean().optional().default(false),
    webhookBase64: zod_1.z.boolean().optional().default(false),
    webhookEvents: zod_1.z.array(zod_1.z.string()).optional()
});
// Validator para atualização de instância Evolution
exports.updateEvolutionInstanceSchema = zod_1.z.object({
    instanceName: zod_1.z.string().min(1, 'Nome da instância é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
    token: zod_1.z.string().optional(),
    qrcode: zod_1.z.boolean().optional(),
    number: zod_1.z.string().optional(),
    integration: zod_1.z.string().optional(),
    webhookUrl: zod_1.z.string().url('URL do webhook deve ser válida').optional(),
    webhookByEvents: zod_1.z.boolean().optional(),
    webhookBase64: zod_1.z.boolean().optional(),
    webhookEvents: zod_1.z.array(zod_1.z.string()).optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização'
});
// Validator para configuração de webhook
exports.setWebhookSchema = zod_1.z.object({
    url: zod_1.z.string().url('URL do webhook deve ser válida'),
    enabled: zod_1.z.boolean().optional().default(true),
    events: zod_1.z.array(zod_1.z.string()).optional(),
    webhook_by_events: zod_1.z.boolean().optional().default(false),
    webhook_base64: zod_1.z.boolean().optional().default(false)
});
//# sourceMappingURL=validators.js.map