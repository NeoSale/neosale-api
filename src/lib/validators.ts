import { z } from 'zod'

// Validator para importação de leads
export const importLeadsSchema = z.object({
  leads: z.array(
    z.object({
      nome: z.string().min(1, 'Nome é obrigatório'),
      telefone: z.string().min(1, 'Telefone é obrigatório'),
      email: z.string().email('Email inválido'),
      empresa: z.string().optional(),
      cargo: z.string().optional(),
      origem_id: z.string().uuid('origem_id deve ser um UUID válido')
    })
  ).min(1, 'Pelo menos um lead deve ser fornecido')
})

// Validator para importação em lote (bulk) de leads
export const bulkLeadsSchema = z.object({
  leads: z.array(
    z.object({
      nome: z.string().min(1, 'Nome é obrigatório'),
      telefone: z.string().min(1, 'Telefone é obrigatório'),
      email: z.string().email('Email inválido').optional(),
      empresa: z.string().optional(),
      cargo: z.string().optional()
    })
  ).min(1, 'Pelo menos um lead deve ser fornecido')
})

// Validator para agendamento
export const agendamentoSchema = z.object({
  agendado_em: z.string().datetime().optional()
})

// Validator para mensagens
export const mensagemSchema = z.object({
  mensagem_id: z.string().uuid('mensagem_id deve ser um UUID válido')
})

// Validator para atualização de etapa
export const etapaSchema = z.object({
  etapa_funil_id: z.string().uuid('etapa_funil_id deve ser um UUID válido')
})

// Validator para atualização de status
export const statusSchema = z.object({
  status_negociacao_id: z.string().uuid('status_negociacao_id deve ser um UUID válido')
})

// Validator para parâmetros de ID
export const idParamSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido')
})

// Validator para paginação
export const paginationSchema = z.object({
  page: z.string().optional().transform((val) => {
    const num = parseInt(val || '1')
    return isNaN(num) || num < 1 ? 1 : num
  }),
  limit: z.string().optional().transform((val) => {
    const num = parseInt(val || '10')
    return isNaN(num) || num < 1 ? 10 : num > 100 ? 100 : num
  }),
  search: z.string().optional()
})

// Validator para atualização de lead
export const updateLeadSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  telefone: z.string().min(1, 'Telefone é obrigatório').optional(),
  email: z.string().optional(),
  empresa: z.string().optional(),
  cargo: z.string().optional(),
  contador: z.string().optional(),
  escritorio: z.string().optional(),
  responsavel: z.string().optional(),
  cnpj: z.string().optional(),
  observacao: z.string().optional(),
  segmento: z.string().optional(),
  erp_atual: z.string().optional(),
  origem_id: z.string().uuid('origem_id deve ser um UUID válido').optional(),
  status_agendamento: z.boolean().optional(),
  etapa_funil_id: z.string().uuid('etapa_funil_id deve ser um UUID válido').optional(),
  status_negociacao_id: z.string().uuid('status_negociacao_id deve ser um UUID válido').optional(),
  qualificacao_id: z.string().uuid('qualificacao_id deve ser um UUID válido').optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

// Validator para criação de followup
export const createFollowupSchema = z.object({
  id_mensagem: z.string().uuid('id_mensagem deve ser um UUID válido'),
  id_lead: z.string().uuid('id_lead deve ser um UUID válido'),
  status: z.enum(['sucesso', 'erro'], {
    errorMap: () => ({ message: 'Status deve ser sucesso ou erro' })
  }),
  erro: z.string().optional(),
  mensagem_enviada: z.string().min(1, 'Mensagem enviada é obrigatória'),
  embedding: z.array(z.number()).optional()
})

// Validator para atualização de followup
export const updateFollowupSchema = z.object({
  id_mensagem: z.string().uuid('id_mensagem deve ser um UUID válido').optional(),
  id_lead: z.string().uuid('id_lead deve ser um UUID válido').optional(),
  status: z.enum(['sucesso', 'erro'], {
    errorMap: () => ({ message: 'Status deve ser sucesso ou erro' })
  }).optional(),
  erro: z.string().optional(),
  mensagem_enviada: z.string().min(1, 'Mensagem enviada é obrigatória').optional(),
  embedding: z.array(z.number()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

// Validator para criação de um único lead
export const createLeadSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().optional(),
  empresa: z.string().optional(),
  cargo: z.string().optional(),
  contador: z.string().optional(),
  escritorio: z.string().optional(),
  responsavel: z.string().optional(),
  cnpj: z.string().optional(),
  observacao: z.string().optional(),
  segmento: z.string().optional(),
  erp_atual: z.string().optional(),
  origem_id: z.string().uuid('origem_id deve ser um UUID válido').optional(),
  qualificacao_id: z.string().uuid('qualificacao_id deve ser um UUID válido').optional()
})

export type ImportLeadsInput = z.infer<typeof importLeadsSchema>
export type BulkLeadsInput = z.infer<typeof bulkLeadsSchema>
export type AgendamentoInput = z.infer<typeof agendamentoSchema>
export type MensagemInput = z.infer<typeof mensagemSchema>
export type EtapaInput = z.infer<typeof etapaSchema>
export type StatusInput = z.infer<typeof statusSchema>
export type IdParam = z.infer<typeof idParamSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
export type CreateFollowupInput = z.infer<typeof createFollowupSchema>
export type UpdateFollowupInput = z.infer<typeof updateFollowupSchema>
export type CreateLeadInput = z.infer<typeof createLeadSchema>

// Validator para criação de configuração
export const createConfiguracaoSchema = z.object({
  chave: z.string().min(1, 'Chave é obrigatória'),
  valor: z.string().min(1, 'Valor é obrigatório')
})

// Validator para atualização de configuração
export const updateConfiguracaoSchema = z.object({
  chave: z.string().min(1, 'Chave é obrigatória').optional(),
  valor: z.string().min(1, 'Valor é obrigatório').optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

export type CreateConfiguracaoInput = z.infer<typeof createConfiguracaoSchema>
export type UpdateConfiguracaoInput = z.infer<typeof updateConfiguracaoSchema>

// ===== VALIDATORS PARA CONFIGURAÇÕES FOLLOWUP =====

// Validator para criação de configuração followup
export const createConfiguracaoFollowupSchema = z.object({
  horario_inicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Horário de início deve estar no formato HH:MM:SS'),
  horario_fim: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Horário de fim deve estar no formato HH:MM:SS'),
  qtd_envio_diario: z.number().int().min(1, 'Quantidade de envio diário deve ser maior que 0'),
  somente_dias_uteis: z.boolean()
})

// Validator para atualização de configuração followup
export const updateConfiguracaoFollowupSchema = z.object({
  horario_inicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Horário de início deve estar no formato HH:MM:SS').optional(),
  horario_fim: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Horário de fim deve estar no formato HH:MM:SS').optional(),
  qtd_envio_diario: z.number().int().min(1, 'Quantidade de envio diário deve ser maior que 0').optional(),
  somente_dias_uteis: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

export type CreateConfiguracaoFollowupInput = z.infer<typeof createConfiguracaoFollowupSchema>
export type UpdateConfiguracaoFollowupInput = z.infer<typeof updateConfiguracaoFollowupSchema>

// ===== VALIDATORS PARA PROVEDORES =====

// Validator para criação de provedor
export const createProvedorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres'),
  descricao: z.string().optional(),
  ativo: z.boolean().optional().default(true)
})

// Validator para atualização de provedor
export const updateProvedorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres').optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

export type CreateProvedorInput = z.infer<typeof createProvedorSchema>
export type UpdateProvedorInput = z.infer<typeof updateProvedorSchema>

// ===== VALIDATORS PARA TIPOS DE ACESSO =====

// Validator para criação de tipo de acesso
export const createTipoAcessoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres'),
  descricao: z.string().optional(),
  ativo: z.boolean().optional().default(true)
})

// Validator para atualização de tipo de acesso
export const updateTipoAcessoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres').optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

export type CreateTipoAcessoInput = z.infer<typeof createTipoAcessoSchema>
export type UpdateTipoAcessoInput = z.infer<typeof updateTipoAcessoSchema>

// ===== VALIDATORS PARA REVENDEDORES =====

// Validator para criação de revendedor
export const createRevendedorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  email: z.string().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres'),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  status: z.string().max(50, 'Status deve ter no máximo 50 caracteres').optional().default('ativo')
})

// Validator para atualização de revendedor
export const updateRevendedorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres').optional(),
  email: z.string().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres').optional(),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  status: z.string().max(50, 'Status deve ter no máximo 50 caracteres').optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

export type CreateRevendedorInput = z.infer<typeof createRevendedorSchema>
export type UpdateRevendedorInput = z.infer<typeof updateRevendedorSchema>

// ===== VALIDATORS PARA CLIENTES =====

// Validator para criação de cliente
export const createClienteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  email: z.string().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres'),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  status: z.string().max(50, 'Status deve ter no máximo 50 caracteres').optional().default('ativo'),
  revendedor_id: z.string().uuid('revendedor_id deve ser um UUID válido').optional()
})

// Validator para atualização de cliente
export const updateClienteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres').optional(),
  email: z.string().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres').optional(),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  status: z.string().max(50, 'Status deve ter no máximo 50 caracteres').optional(),
  revendedor_id: z.string().uuid('revendedor_id deve ser um UUID válido').optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

export type CreateClienteInput = z.infer<typeof createClienteSchema>
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>

// ===== VALIDATORS PARA USUÁRIOS =====

// Validator para criação de usuário
export const createUsuarioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  email: z.string().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres'),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  provedor_id: z.string().uuid('provedor_id deve ser um UUID válido'),
  tipo_acesso_id: z.string().uuid('tipo_acesso_id deve ser um UUID válido'),
  revendedor_id: z.string().uuid('revendedor_id deve ser um UUID válido').optional(),
  ativo: z.boolean().optional().default(true)
})

// Validator para atualização de usuário
export const updateUsuarioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres').optional(),
  email: z.string().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres').optional(),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  provedor_id: z.string().uuid('provedor_id deve ser um UUID válido').optional(),
  tipo_acesso_id: z.string().uuid('tipo_acesso_id deve ser um UUID válido').optional(),
  revendedor_id: z.string().uuid('revendedor_id deve ser um UUID válido').optional(),
  ativo: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>

// ===== VALIDATORS PARA EVOLUTION API =====

// Validator para criação de instância Evolution
export const createEvolutionInstanceSchema = z.object({
  instanceName: z.string().min(1, 'Nome da instância é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  token: z.string().optional(),
  qrcode: z.boolean().optional().default(true),
  number: z.string().optional(),
  integration: z.string().optional(),
  webhookUrl: z.string().url('URL do webhook deve ser válida').optional(),
  webhookByEvents: z.boolean().optional().default(false),
  webhookBase64: z.boolean().optional().default(false),
  webhookEvents: z.array(z.string()).optional()
})

// Validator para atualização de instância Evolution
export const updateEvolutionInstanceSchema = z.object({
  instanceName: z.string().min(1, 'Nome da instância é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  token: z.string().optional(),
  qrcode: z.boolean().optional(),
  number: z.string().optional(),
  integration: z.string().optional(),
  webhookUrl: z.string().url('URL do webhook deve ser válida').optional(),
  webhookByEvents: z.boolean().optional(),
  webhookBase64: z.boolean().optional(),
  webhookEvents: z.array(z.string()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

// Validator para configuração de webhook
export const setWebhookSchema = z.object({
  url: z.string().url('URL do webhook deve ser válida'),
  enabled: z.boolean().optional().default(true),
  events: z.array(z.string()).optional(),
  webhook_by_events: z.boolean().optional().default(false),
  webhook_base64: z.boolean().optional().default(false)
})

export type CreateEvolutionInstanceInput = z.infer<typeof createEvolutionInstanceSchema>
export type UpdateEvolutionInstanceInput = z.infer<typeof updateEvolutionInstanceSchema>
export type SetWebhookInput = z.infer<typeof setWebhookSchema>