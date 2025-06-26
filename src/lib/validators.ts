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
      email: z.string().email('Email inválido'),
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
  tipo_mensagem: z.enum(['mensagem_1', 'mensagem_2', 'mensagem_3'], {
    errorMap: () => ({ message: 'Tipo de mensagem deve ser mensagem_1, mensagem_2 ou mensagem_3' })
  })
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
  email: z.string().email('Email inválido').optional(),
  empresa: z.string().optional(),
  cargo: z.string().optional(),
  origem_id: z.string().uuid('origem_id deve ser um UUID válido').optional(),
  status_agendamento: z.boolean().optional(),
  etapa_funil_id: z.string().uuid('etapa_funil_id deve ser um UUID válido').optional(),
  status_negociacao_id: z.string().uuid('status_negociacao_id deve ser um UUID válido').optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização'
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