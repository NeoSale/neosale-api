import { z } from 'zod'

// Validator para importação de leads
export const importLeadsSchema = z.object({
  leads: z.array(
    z.object({
      nome: z.string().min(1, 'Nome é obrigatório'),
      telefone: z.string().min(1, 'Telefone é obrigatório'),
      email: z.string(),
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
      email: z.string().optional(),
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

// Validator para parâmetros de ID numérico (para chat)
export const numericIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID deve ser um número válido').transform((val) => parseInt(val, 10))
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
  qualificacao_id: z.string().uuid('qualificacao_id deve ser um UUID válido').optional(),
  profile_picture_url: z.string().nullable().optional(),
  embedding: z.array(z.number()).optional()
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
  embedding: z.array(z.number()).optional(),
  cliente_id: z.string().uuid('cliente_id deve ser um UUID válido')
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
  embedding: z.array(z.number()).optional(),
  cliente_id: z.string().uuid('cliente_id deve ser um UUID válido').optional()
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
  origem: z.enum(['inbound', 'outbound'], {
    errorMap: () => ({ message: 'Origem deve ser inbound ou outbound' })
  }).optional(),
  origem_id: z.string().uuid('origem_id deve ser um UUID válido').optional(),
  qualificacao_id: z.string().uuid('qualificacao_id deve ser um UUID válido').optional(),
  cliente_id: z.string().uuid('cliente_id deve ser um UUID válido'),
  profile_picture_url: z.string().nullable().optional(),
  embedding: z.array(z.number()).optional()
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

// Validator para criação de parâmetro
export const createParametroSchema = z.object({
  chave: z.string().min(1, 'Chave é obrigatória'),
  valor: z.string().min(1, 'Valor é obrigatório'),
  cliente_id: z.string().uuid('cliente_id deve ser um UUID válido'),
  embedding: z.array(z.number()).optional()
})

// Validator para atualização de parâmetro
export const updateParametroSchema = z.object({
  chave: z.string().min(1, 'Chave é obrigatória').optional(),
  valor: z.string().min(1, 'Valor é obrigatório').optional(),
  cliente_id: z.string().uuid('cliente_id deve ser um UUID válido').optional(),
  embedding: z.array(z.number()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

export type CreateParametroInput = z.infer<typeof createParametroSchema>
export type UpdateParametroInput = z.infer<typeof updateParametroSchema>

// ===== VALIDATORS PARA CONFIGURAÇÕES FOLLOWUP =====

// Validator para criação de configuração followup
export const createConfiguracoesSchema = z.object({
  horario_inicio: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    const num = parseInt(val);
    return !isNaN(num) && num >= 0 && num <= 24;
  }, 'Horário de início deve ser um número entre 0 e 24').transform((val) => {
    if (!val || val === '') return '08:00:00';
    const num = parseInt(val);
    return `${num.toString().padStart(2, '0')}:00:00`;
  }),
  horario_fim: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    const num = parseInt(val);
    return !isNaN(num) && num >= 0 && num <= 24;
  }, 'Horário de fim deve ser um número entre 0 e 24').transform((val) => {
    if (!val || val === '') return '18:00:00';
    const num = parseInt(val);
    return `${num.toString().padStart(2, '0')}:00:00`;
  }),
  qtd_envio_diario: z.number().int().min(1, 'Quantidade de envio diário deve ser maior que 0'),
  somente_dias_uteis: z.boolean(),
  apiKeyOpenAI: z.string().optional(),
  PromptSDR: z.string().optional(),
  PromptCalendar: z.string().optional(),
  UsaCalendar: z.string().optional(),
  embedding: z.array(z.number()).optional()
})

// Validator para atualização de configuração followup
export const updateConfiguracoesSchema = z.object({
  horario_inicio: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    const num = parseInt(val);
    return !isNaN(num) && num >= 0 && num <= 24;
  }, 'Horário de início deve ser um número entre 0 e 24').transform((val) => {
    if (!val || val === '') return undefined;
    const num = parseInt(val);
    return `${num.toString().padStart(2, '0')}:00:00`;
  }),
  horario_fim: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    const num = parseInt(val);
    return !isNaN(num) && num >= 0 && num <= 24;
  }, 'Horário de fim deve ser um número entre 0 e 24').transform((val) => {
    if (!val || val === '') return undefined;
    const num = parseInt(val);
    return `${num.toString().padStart(2, '0')}:00:00`;
  }),
  qtd_envio_diario: z.number().int().min(1, 'Quantidade de envio diário deve ser maior que 0').optional(),
  somente_dias_uteis: z.boolean().optional(),
  apiKeyOpenAI: z.string().optional(),
  PromptSDR: z.string().optional(),
  PromptCalendar: z.string().optional(),
  UsaCalendar: z.string().optional(),
  embedding: z.array(z.number()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

export type CreateConfiguracoesInput = z.infer<typeof createConfiguracoesSchema>
export type UpdateConfiguracoesInput = z.infer<typeof updateConfiguracoesSchema>

// ===== VALIDATORS PARA PROVEDORES =====

// Validator para criação de provedor
export const createProvedorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres'),
  descricao: z.string().optional(),
  ativo: z.boolean().optional().default(true),
  embedding: z.array(z.number()).optional()
})

// Validator para atualização de provedor
export const updateProvedorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres').optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().optional(),
  embedding: z.array(z.number()).optional()
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
  ativo: z.boolean().optional().default(true),
  embedding: z.array(z.number()).optional()
})

// Validator para atualização de tipo de acesso
export const updateTipoAcessoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres').optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().optional(),
  embedding: z.array(z.number()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

export type CreateTipoAcessoInput = z.infer<typeof createTipoAcessoSchema>
export type UpdateTipoAcessoInput = z.infer<typeof updateTipoAcessoSchema>

// ===== VALIDATORS PARA USUÁRIO ADMIN =====

// Validator para criação de usuário admin
export const createUsuarioAdminSchema = z.object({
  usuario_id: z.string().uuid('usuario_id deve ser um UUID válido'),
  nivel_admin: z.enum(['super_admin', 'admin', 'moderador'], {
    errorMap: () => ({ message: 'Nível admin deve ser super_admin, admin ou moderador' })
  }),
  permissoes_especiais: z.array(z.string()).optional().default([]),
  ativo: z.boolean().optional().default(true),
  embedding: z.array(z.number()).optional()
})

// Validator para atualização de usuário admin
export const updateUsuarioAdminSchema = z.object({
  nivel_admin: z.enum(['super_admin', 'admin', 'moderador'], {
    errorMap: () => ({ message: 'Nível admin deve ser super_admin, admin ou moderador' })
  }).optional(),
  permissoes_especiais: z.array(z.string()).optional(),
  ativo: z.boolean().optional(),
  embedding: z.array(z.number()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

export type CreateUsuarioAdminInput = z.infer<typeof createUsuarioAdminSchema>
export type UpdateUsuarioAdminInput = z.infer<typeof updateUsuarioAdminSchema>

// ===== VALIDATORS PARA REVENDEDORES =====

// Validator para criação de revendedor
export const createRevendedorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  email: z.string().max(255, 'Email deve ter no máximo 255 caracteres'),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  status: z.string().max(50, 'Status deve ter no máximo 50 caracteres').optional().default('ativo'),
  embedding: z.array(z.number()).optional()
})

// Validator para atualização de revendedor
export const updateRevendedorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres').optional(),
  email: z.string().max(255, 'Email deve ter no máximo 255 caracteres').optional(),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  status: z.string().max(50, 'Status deve ter no máximo 50 caracteres').optional(),
  embedding: z.array(z.number()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

export type CreateRevendedorInput = z.infer<typeof createRevendedorSchema>
export type UpdateRevendedorInput = z.infer<typeof updateRevendedorSchema>

// ===== VALIDATORS PARA CLIENTES =====

// Validator para criação de cliente
export const createClienteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  email: z.string().max(255, 'Email deve ter no máximo 255 caracteres'),
  telefone: z.string().min(1, 'Telefone é obrigatório').max(20, 'Telefone deve ter no máximo 20 caracteres'),
  nickname: z.string().max(100, 'Nickname deve ter no máximo 100 caracteres')
    .regex(/^[a-z0-9-]*$/, 'Nickname deve conter apenas letras minúsculas, números e hífens')
    .optional(),
  status: z.string().max(50, 'Status deve ter no máximo 50 caracteres').optional().default('ativo'),
  revendedor_id: z.string().uuid('revendedor_id deve ser um UUID válido'),
  // Novos campos adicionados
  nome_responsavel_principal: z.string().max(255, 'Nome do responsável deve ter no máximo 255 caracteres').optional(),
  cnpj: z.string().max(18, 'CNPJ deve ter no máximo 18 caracteres').optional(),
  cep: z.string().max(10, 'CEP deve ter no máximo 10 caracteres').optional(),
  logradouro: z.string().max(255, 'Logradouro deve ter no máximo 255 caracteres').optional(),
  numero: z.string().max(20, 'Número deve ter no máximo 20 caracteres').optional(),
  complemento: z.string().max(100, 'Complemento deve ter no máximo 100 caracteres').optional(),
  cidade: z.string().max(100, 'Cidade deve ter no máximo 100 caracteres').optional(),
  estado: z.string().max(50, 'Estado deve ter no máximo 50 caracteres').optional(),
  pais: z.string().max(50, 'País deve ter no máximo 50 caracteres').optional().default('Brasil'),
  espaco_fisico: z.boolean().optional().default(false),
  site_oficial: z.string().max(255, 'Site oficial deve ter no máximo 255 caracteres').optional(),
  redes_sociais: z.record(z.string(), z.string().url('Link da rede social deve ser uma URL válida')).optional(),
  horario_funcionamento: z.record(z.string(), z.string()).optional(),
  regioes_atendidas: z.string().optional(),
  embedding: z.array(z.number()).optional()
})

// Validator para atualização de cliente
export const updateClienteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres').optional(),
  email: z.string().max(255, 'Email deve ter no máximo 255 caracteres').optional(),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  nickname: z.string().max(100, 'Nickname deve ter no máximo 100 caracteres').regex(/^[a-z0-9-]+$/, 'Nickname deve conter apenas letras minúsculas, números e hífens').optional(),
  status: z.string().max(50, 'Status deve ter no máximo 50 caracteres').optional(),
  revendedor_id: z.string().uuid('revendedor_id deve ser um UUID válido').optional(),
  // Novos campos adicionados
  nome_responsavel_principal: z.string().max(255, 'Nome do responsável deve ter no máximo 255 caracteres').optional(),
  cnpj: z.string().max(18, 'CNPJ deve ter no máximo 18 caracteres').optional(),
  cep: z.string().max(10, 'CEP deve ter no máximo 10 caracteres').optional(),
  logradouro: z.string().max(255, 'Logradouro deve ter no máximo 255 caracteres').optional(),
  numero: z.string().max(20, 'Número deve ter no máximo 20 caracteres').optional(),
  complemento: z.string().max(100, 'Complemento deve ter no máximo 100 caracteres').optional(),
  cidade: z.string().max(100, 'Cidade deve ter no máximo 100 caracteres').optional(),
  estado: z.string().max(50, 'Estado deve ter no máximo 50 caracteres').optional(),
  pais: z.string().max(50, 'País deve ter no máximo 50 caracteres').optional(),
  espaco_fisico: z.boolean().optional(),
  site_oficial: z.string().max(255, 'Site oficial deve ter no máximo 255 caracteres').optional(),
  redes_sociais: z.record(z.string(), z.string().url('Link da rede social deve ser uma URL válida')).optional(),
  horario_funcionamento: z.record(z.string(), z.string()).optional(),
  regioes_atendidas: z.string().optional(),
  embedding: z.array(z.number()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

export type CreateClienteInput = z.infer<typeof createClienteSchema>
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>

// ===== VALIDATORS PARA USUÁRIOS =====

// Validator para criação de usuário
export const createUsuarioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  email: z.string().max(255, 'Email deve ter no máximo 255 caracteres'),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  provedor_id: z.string().uuid('provedor_id deve ser um UUID válido'),
  ativo: z.boolean().optional().default(true),
  embedding: z.array(z.number()).optional()
})

// Validator para atualização de usuário
export const updateUsuarioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres').optional(),
  email: z.string().max(255, 'Email deve ter no máximo 255 caracteres').optional(),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  provedor_id: z.string().uuid('provedor_id deve ser um UUID válido').optional(),
  ativo: z.boolean().optional(),
  embedding: z.array(z.number()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>



// Schemas para mensagens
export const createMensagemSchema = z.object({
  nome: z.string().optional(),
  intervalo_numero: z.number().int().min(1, 'Intervalo número deve ser maior que 0'),
  intervalo_tipo: z.enum(['minutos', 'horas', 'dias'], {
    errorMap: () => ({ message: 'Intervalo tipo deve ser minutos, horas ou dias' })
  }),
  texto_mensagem: z.string().min(1, 'Texto da mensagem é obrigatório'),
  ordem: z.number().int().min(0, 'Ordem deve ser maior ou igual a 0').optional().default(0),
  ativo: z.boolean().optional().default(true),
  cliente_id: z.string().uuid('cliente_id deve ser um UUID válido'),
  embedding: z.array(z.number()).optional()
})

export const updateMensagemSchema = z.object({
  nome: z.string().optional(),
  intervalo_numero: z.number().int().min(1, 'Intervalo número deve ser maior que 0').optional(),
  intervalo_tipo: z.enum(['minutos', 'horas', 'dias'], {
    errorMap: () => ({ message: 'Intervalo tipo deve ser minutos, horas ou dias' })
  }).optional(),
  texto_mensagem: z.string().min(1, 'Texto da mensagem é obrigatório').optional(),
  ordem: z.number().int().min(0, 'Ordem deve ser maior ou igual a 0').optional(),
  ativo: z.boolean().optional(),
  cliente_id: z.string().uuid('cliente_id deve ser um UUID válido').optional(),
  embedding: z.array(z.number()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

// Schemas para origens_leads
export const createOrigemLeadSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  embedding: z.array(z.number()).optional()
})

export const updateOrigemLeadSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  embedding: z.array(z.number()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

// Schemas para etapas_funil
export const createEtapaFunilSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  embedding: z.array(z.number()).optional()
})

export const updateEtapaFunilSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  embedding: z.array(z.number()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

// Schemas para status_negociacao
export const createStatusNegociacaoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  embedding: z.array(z.number()).optional()
})

export const updateStatusNegociacaoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  embedding: z.array(z.number()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

// Schemas para qualificacao
export const createQualificacaoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  embedding: z.array(z.number()).optional()
})

export const updateQualificacaoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  embedding: z.array(z.number()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

// Schemas para controle_envios_diarios
export const createControleEnvioSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  quantidade_enviada: z.number().int().min(0, 'Quantidade enviada deve ser maior ou igual a 0').optional().default(0),
  limite_diario: z.number().int().min(1, 'Limite diário deve ser maior que 0'),
  cliente_id: z.string().uuid('cliente_id deve ser um UUID válido'),
  embedding: z.array(z.number()).optional()
})

export const updateControleEnvioSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional(),
  quantidade_enviada: z.number().int().min(0, 'Quantidade enviada deve ser maior ou igual a 0').optional(),
  limite_diario: z.number().int().min(1, 'Limite diário deve ser maior que 0').optional(),
  cliente_id: z.string().uuid('cliente_id deve ser um UUID válido').optional(),
  embedding: z.array(z.number()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

// Tipos inferidos
export type CreateMensagemInput = z.infer<typeof createMensagemSchema>
export type UpdateMensagemInput = z.infer<typeof updateMensagemSchema>
export type CreateOrigemLeadInput = z.infer<typeof createOrigemLeadSchema>
export type UpdateOrigemLeadInput = z.infer<typeof updateOrigemLeadSchema>
export type CreateEtapaFunilInput = z.infer<typeof createEtapaFunilSchema>
export type UpdateEtapaFunilInput = z.infer<typeof updateEtapaFunilSchema>
export type CreateStatusNegociacaoInput = z.infer<typeof createStatusNegociacaoSchema>
export type UpdateStatusNegociacaoInput = z.infer<typeof updateStatusNegociacaoSchema>
export type CreateQualificacaoInput = z.infer<typeof createQualificacaoSchema>
export type UpdateQualificacaoInput = z.infer<typeof updateQualificacaoSchema>
export type CreateControleEnvioInput = z.infer<typeof createControleEnvioSchema>
export type UpdateControleEnvioInput = z.infer<typeof updateControleEnvioSchema>

// Schemas para relacionamentos de usuários
export const createUsuarioRevendedorSchema = z.object({
  usuario_id: z.string().uuid('usuario_id deve ser um UUID válido'),
  revendedor_id: z.string().uuid('revendedor_id deve ser um UUID válido'),
  embedding: z.array(z.number()).optional()
})

export const createUsuarioClienteSchema = z.object({
  usuario_id: z.string().uuid('usuario_id deve ser um UUID válido'),
  cliente_id: z.string().uuid('cliente_id deve ser um UUID válido'),
  embedding: z.array(z.number()).optional()
})

export const createUsuarioPermissaoSistemaSchema = z.object({
  usuario_id: z.string().uuid('usuario_id deve ser um UUID válido'),
  permissao: z.enum(['admin', 'gerente', 'vendedor', 'suporte'], {
    errorMap: () => ({ message: 'Permissão deve ser admin, gerente, vendedor ou suporte' })
  }),
  ativo: z.boolean().optional().default(true),
  embedding: z.array(z.number()).optional()
})

// Schemas para atualização dos relacionamentos
export const updateUsuarioRevendedorSchema = z.object({
  embedding: z.array(z.number()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

export const updateUsuarioClienteSchema = z.object({
  embedding: z.array(z.number()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

export const updateUsuarioPermissaoSistemaSchema = z.object({
  permissao: z.enum(['admin', 'gerente', 'vendedor', 'suporte'], {
    errorMap: () => ({ message: 'Permissão deve ser admin, gerente, vendedor ou suporte' })
  }).optional(),
  ativo: z.boolean().optional(),
  embedding: z.array(z.number()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

// Schema para atualização de usuário com múltiplos relacionamentos
export const updateUsuarioComRelacionamentosSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres').optional(),
  email: z.string().max(255, 'Email deve ter no máximo 255 caracteres').optional(),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  provedor_id: z.string().uuid('provedor_id deve ser um UUID válido').optional(),
  ativo: z.boolean().optional(),
  embedding: z.array(z.number()).optional(),
  revendedores: z.array(z.string().uuid('revendedor_id deve ser um UUID válido')).optional(),
  clientes: z.array(z.string().uuid('cliente_id deve ser um UUID válido')).optional(),
  permissoes_sistema: z.array(z.enum(['admin', 'gerente', 'vendedor', 'suporte'])).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

export type CreateUsuarioRevendedorInput = z.infer<typeof createUsuarioRevendedorSchema>
export type CreateUsuarioClienteInput = z.infer<typeof createUsuarioClienteSchema>
export type CreateUsuarioPermissaoSistemaInput = z.infer<typeof createUsuarioPermissaoSistemaSchema>
export type UpdateUsuarioRevendedorInput = z.infer<typeof updateUsuarioRevendedorSchema>
export type UpdateUsuarioClienteInput = z.infer<typeof updateUsuarioClienteSchema>
export type UpdateUsuarioPermissaoSistemaInput = z.infer<typeof updateUsuarioPermissaoSistemaSchema>
export type UpdateUsuarioComRelacionamentosInput = z.infer<typeof updateUsuarioComRelacionamentosSchema>

// Evolution API Validators
export const createEvolutionApiSchema = z.object({
  instance_name: z.string().min(1, 'Nome da instância é obrigatório').max(100, 'Nome da instância deve ter no máximo 100 caracteres'),
  webhook_url: z.string().nullable().optional(),
  webhook_events: z.array(z.string()).optional(),
  settings: z.object({
    reject_call: z.boolean().optional(),
    msg_call: z.string().optional(),
    groups_ignore: z.boolean().optional(),
    always_online: z.boolean().optional(),
    read_messages: z.boolean().optional(),
    read_status: z.boolean().optional()
  }).optional()
})

export const updateEvolutionApiSchema = z.object({
  instance_name: z.string().min(1, 'Nome da instância é obrigatório').max(100, 'Nome da instância deve ter no máximo 100 caracteres').optional(),
  webhook_url: z.string().nullable().optional(),
  webhook_events: z.array(z.string()).optional(),
  settings: z.object({
    reject_call: z.boolean().optional(),
    msg_call: z.string().optional(),
    groups_ignore: z.boolean().optional(),
    always_online: z.boolean().optional(),
    read_messages: z.boolean().optional(),
    read_status: z.boolean().optional()
  }).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

export const connectInstanceSchema = z.object({
  instance_name: z.string().min(1, 'Nome da instância é obrigatório')
})

export const instanceNameParamSchema = z.object({
  instanceName: z.string().min(1, 'Nome da instância é obrigatório')
})

export type CreateEvolutionApiInput = z.infer<typeof createEvolutionApiSchema>
export type UpdateEvolutionApiInput = z.infer<typeof updateEvolutionApiSchema>
export type ConnectInstanceInput = z.infer<typeof connectInstanceSchema>
export type InstanceNameParam = z.infer<typeof instanceNameParamSchema>

// ===== VALIDATORS PARA CHAT HISTORIES =====

// Validator para criação de chat history
export const createChatHistorySchema = z.object({
  session_id: z.string().uuid('session_id deve ser um UUID válido'),
  message: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Message é obrigatório'
  }),
  embedding: z.array(z.number()).optional()
})

// Validator para atualização de chat history
export const updateChatHistorySchema = z.object({
  message: z.any().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
})

// Validator para parâmetros de session_id
export const sessionIdParamSchema = z.object({
  session_id: z.string().uuid('session_id deve ser um UUID válido')
})

export type CreateChatHistoryInput = z.infer<typeof createChatHistorySchema>
export type UpdateChatHistoryInput = z.infer<typeof updateChatHistorySchema>
export type SessionIdParam = z.infer<typeof sessionIdParamSchema>
export type NumericIdParam = z.infer<typeof numericIdParamSchema>