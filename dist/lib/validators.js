"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConfiguracaoSchema = exports.createConfiguracaoSchema = exports.createLeadSchema = exports.atualizarMensagemSchema = exports.updateLeadSchema = exports.paginationSchema = exports.idParamSchema = exports.statusSchema = exports.etapaSchema = exports.mensagemSchema = exports.agendamentoSchema = exports.bulkLeadsSchema = exports.importLeadsSchema = void 0;
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
    tipo_mensagem: zod_1.z.enum(['mensagem_1', 'mensagem_2', 'mensagem_3'], {
        errorMap: () => ({ message: 'Tipo de mensagem deve ser mensagem_1, mensagem_2 ou mensagem_3' })
    })
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
exports.atualizarMensagemSchema = zod_1.z.object({
    tipo_mensagem: zod_1.z.enum(['mensagem_1', 'mensagem_2', 'mensagem_3'], {
        errorMap: () => ({ message: 'Tipo de mensagem deve ser mensagem_1, mensagem_2 ou mensagem_3' })
    }),
    enviada: zod_1.z.boolean({
        errorMap: () => ({ message: 'Campo enviada deve ser um valor booleano' })
    }),
    data: zod_1.z.string().datetime().optional()
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
//# sourceMappingURL=validators.js.map