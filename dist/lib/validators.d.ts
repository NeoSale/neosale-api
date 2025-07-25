import { z } from 'zod';
export declare const importLeadsSchema: z.ZodObject<{
    leads: z.ZodArray<z.ZodObject<{
        nome: z.ZodString;
        telefone: z.ZodString;
        email: z.ZodString;
        empresa: z.ZodOptional<z.ZodString>;
        cargo: z.ZodOptional<z.ZodString>;
        origem_id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        nome: string;
        telefone: string;
        origem_id: string;
        empresa?: string | undefined;
        cargo?: string | undefined;
    }, {
        email: string;
        nome: string;
        telefone: string;
        origem_id: string;
        empresa?: string | undefined;
        cargo?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    leads: {
        email: string;
        nome: string;
        telefone: string;
        origem_id: string;
        empresa?: string | undefined;
        cargo?: string | undefined;
    }[];
}, {
    leads: {
        email: string;
        nome: string;
        telefone: string;
        origem_id: string;
        empresa?: string | undefined;
        cargo?: string | undefined;
    }[];
}>;
export declare const bulkLeadsSchema: z.ZodObject<{
    leads: z.ZodArray<z.ZodObject<{
        nome: z.ZodString;
        telefone: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
        empresa: z.ZodOptional<z.ZodString>;
        cargo: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        nome: string;
        telefone: string;
        email?: string | undefined;
        empresa?: string | undefined;
        cargo?: string | undefined;
    }, {
        nome: string;
        telefone: string;
        email?: string | undefined;
        empresa?: string | undefined;
        cargo?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    leads: {
        nome: string;
        telefone: string;
        email?: string | undefined;
        empresa?: string | undefined;
        cargo?: string | undefined;
    }[];
}, {
    leads: {
        nome: string;
        telefone: string;
        email?: string | undefined;
        empresa?: string | undefined;
        cargo?: string | undefined;
    }[];
}>;
export declare const agendamentoSchema: z.ZodObject<{
    agendado_em: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    agendado_em?: string | undefined;
}, {
    agendado_em?: string | undefined;
}>;
export declare const mensagemSchema: z.ZodObject<{
    mensagem_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    mensagem_id: string;
}, {
    mensagem_id: string;
}>;
export declare const etapaSchema: z.ZodObject<{
    etapa_funil_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    etapa_funil_id: string;
}, {
    etapa_funil_id: string;
}>;
export declare const statusSchema: z.ZodObject<{
    status_negociacao_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status_negociacao_id: string;
}, {
    status_negociacao_id: string;
}>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
    limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search?: string | undefined;
}, {
    page?: string | undefined;
    limit?: string | undefined;
    search?: string | undefined;
}>;
export declare const updateLeadSchema: z.ZodEffects<z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    telefone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    empresa: z.ZodOptional<z.ZodString>;
    cargo: z.ZodOptional<z.ZodString>;
    contador: z.ZodOptional<z.ZodString>;
    escritorio: z.ZodOptional<z.ZodString>;
    responsavel: z.ZodOptional<z.ZodString>;
    cnpj: z.ZodOptional<z.ZodString>;
    observacao: z.ZodOptional<z.ZodString>;
    segmento: z.ZodOptional<z.ZodString>;
    erp_atual: z.ZodOptional<z.ZodString>;
    origem_id: z.ZodOptional<z.ZodString>;
    status_agendamento: z.ZodOptional<z.ZodBoolean>;
    etapa_funil_id: z.ZodOptional<z.ZodString>;
    status_negociacao_id: z.ZodOptional<z.ZodString>;
    qualificacao_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    origem_id?: string | undefined;
    etapa_funil_id?: string | undefined;
    status_negociacao_id?: string | undefined;
    empresa?: string | undefined;
    cargo?: string | undefined;
    contador?: string | undefined;
    escritorio?: string | undefined;
    responsavel?: string | undefined;
    cnpj?: string | undefined;
    observacao?: string | undefined;
    segmento?: string | undefined;
    erp_atual?: string | undefined;
    status_agendamento?: boolean | undefined;
    qualificacao_id?: string | undefined;
}, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    origem_id?: string | undefined;
    etapa_funil_id?: string | undefined;
    status_negociacao_id?: string | undefined;
    empresa?: string | undefined;
    cargo?: string | undefined;
    contador?: string | undefined;
    escritorio?: string | undefined;
    responsavel?: string | undefined;
    cnpj?: string | undefined;
    observacao?: string | undefined;
    segmento?: string | undefined;
    erp_atual?: string | undefined;
    status_agendamento?: boolean | undefined;
    qualificacao_id?: string | undefined;
}>, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    origem_id?: string | undefined;
    etapa_funil_id?: string | undefined;
    status_negociacao_id?: string | undefined;
    empresa?: string | undefined;
    cargo?: string | undefined;
    contador?: string | undefined;
    escritorio?: string | undefined;
    responsavel?: string | undefined;
    cnpj?: string | undefined;
    observacao?: string | undefined;
    segmento?: string | undefined;
    erp_atual?: string | undefined;
    status_agendamento?: boolean | undefined;
    qualificacao_id?: string | undefined;
}, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    origem_id?: string | undefined;
    etapa_funil_id?: string | undefined;
    status_negociacao_id?: string | undefined;
    empresa?: string | undefined;
    cargo?: string | undefined;
    contador?: string | undefined;
    escritorio?: string | undefined;
    responsavel?: string | undefined;
    cnpj?: string | undefined;
    observacao?: string | undefined;
    segmento?: string | undefined;
    erp_atual?: string | undefined;
    status_agendamento?: boolean | undefined;
    qualificacao_id?: string | undefined;
}>;
export declare const createFollowupSchema: z.ZodObject<{
    id_mensagem: z.ZodString;
    id_lead: z.ZodString;
    status: z.ZodEnum<["sucesso", "erro"]>;
    erro: z.ZodOptional<z.ZodString>;
    mensagem_enviada: z.ZodString;
    embedding: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "sucesso" | "erro";
    id_mensagem: string;
    id_lead: string;
    mensagem_enviada: string;
    erro?: string | undefined;
    embedding?: number[] | undefined;
}, {
    status: "sucesso" | "erro";
    id_mensagem: string;
    id_lead: string;
    mensagem_enviada: string;
    erro?: string | undefined;
    embedding?: number[] | undefined;
}>;
export declare const updateFollowupSchema: z.ZodEffects<z.ZodObject<{
    id_mensagem: z.ZodOptional<z.ZodString>;
    id_lead: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["sucesso", "erro"]>>;
    erro: z.ZodOptional<z.ZodString>;
    mensagem_enviada: z.ZodOptional<z.ZodString>;
    embedding: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    erro?: string | undefined;
    status?: "sucesso" | "erro" | undefined;
    id_mensagem?: string | undefined;
    id_lead?: string | undefined;
    mensagem_enviada?: string | undefined;
    embedding?: number[] | undefined;
}, {
    erro?: string | undefined;
    status?: "sucesso" | "erro" | undefined;
    id_mensagem?: string | undefined;
    id_lead?: string | undefined;
    mensagem_enviada?: string | undefined;
    embedding?: number[] | undefined;
}>, {
    erro?: string | undefined;
    status?: "sucesso" | "erro" | undefined;
    id_mensagem?: string | undefined;
    id_lead?: string | undefined;
    mensagem_enviada?: string | undefined;
    embedding?: number[] | undefined;
}, {
    erro?: string | undefined;
    status?: "sucesso" | "erro" | undefined;
    id_mensagem?: string | undefined;
    id_lead?: string | undefined;
    mensagem_enviada?: string | undefined;
    embedding?: number[] | undefined;
}>;
export declare const createLeadSchema: z.ZodObject<{
    nome: z.ZodString;
    telefone: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    empresa: z.ZodOptional<z.ZodString>;
    cargo: z.ZodOptional<z.ZodString>;
    contador: z.ZodOptional<z.ZodString>;
    escritorio: z.ZodOptional<z.ZodString>;
    responsavel: z.ZodOptional<z.ZodString>;
    cnpj: z.ZodOptional<z.ZodString>;
    observacao: z.ZodOptional<z.ZodString>;
    segmento: z.ZodOptional<z.ZodString>;
    erp_atual: z.ZodOptional<z.ZodString>;
    origem_id: z.ZodOptional<z.ZodString>;
    qualificacao_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nome: string;
    telefone: string;
    email?: string | undefined;
    origem_id?: string | undefined;
    empresa?: string | undefined;
    cargo?: string | undefined;
    contador?: string | undefined;
    escritorio?: string | undefined;
    responsavel?: string | undefined;
    cnpj?: string | undefined;
    observacao?: string | undefined;
    segmento?: string | undefined;
    erp_atual?: string | undefined;
    qualificacao_id?: string | undefined;
}, {
    nome: string;
    telefone: string;
    email?: string | undefined;
    origem_id?: string | undefined;
    empresa?: string | undefined;
    cargo?: string | undefined;
    contador?: string | undefined;
    escritorio?: string | undefined;
    responsavel?: string | undefined;
    cnpj?: string | undefined;
    observacao?: string | undefined;
    segmento?: string | undefined;
    erp_atual?: string | undefined;
    qualificacao_id?: string | undefined;
}>;
export type ImportLeadsInput = z.infer<typeof importLeadsSchema>;
export type BulkLeadsInput = z.infer<typeof bulkLeadsSchema>;
export type AgendamentoInput = z.infer<typeof agendamentoSchema>;
export type MensagemInput = z.infer<typeof mensagemSchema>;
export type EtapaInput = z.infer<typeof etapaSchema>;
export type StatusInput = z.infer<typeof statusSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type CreateFollowupInput = z.infer<typeof createFollowupSchema>;
export type UpdateFollowupInput = z.infer<typeof updateFollowupSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export declare const createConfiguracaoSchema: z.ZodObject<{
    chave: z.ZodString;
    valor: z.ZodString;
}, "strip", z.ZodTypeAny, {
    chave: string;
    valor: string;
}, {
    chave: string;
    valor: string;
}>;
export declare const updateConfiguracaoSchema: z.ZodEffects<z.ZodObject<{
    chave: z.ZodOptional<z.ZodString>;
    valor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    chave?: string | undefined;
    valor?: string | undefined;
}, {
    chave?: string | undefined;
    valor?: string | undefined;
}>, {
    chave?: string | undefined;
    valor?: string | undefined;
}, {
    chave?: string | undefined;
    valor?: string | undefined;
}>;
export type CreateConfiguracaoInput = z.infer<typeof createConfiguracaoSchema>;
export type UpdateConfiguracaoInput = z.infer<typeof updateConfiguracaoSchema>;
export declare const createConfiguracaoFollowupSchema: z.ZodObject<{
    horario_inicio: z.ZodString;
    horario_fim: z.ZodString;
    qtd_envio_diario: z.ZodNumber;
    somente_dias_uteis: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    horario_inicio: string;
    horario_fim: string;
    qtd_envio_diario: number;
    somente_dias_uteis: boolean;
}, {
    horario_inicio: string;
    horario_fim: string;
    qtd_envio_diario: number;
    somente_dias_uteis: boolean;
}>;
export declare const updateConfiguracaoFollowupSchema: z.ZodEffects<z.ZodObject<{
    horario_inicio: z.ZodOptional<z.ZodString>;
    horario_fim: z.ZodOptional<z.ZodString>;
    qtd_envio_diario: z.ZodOptional<z.ZodNumber>;
    somente_dias_uteis: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    horario_inicio?: string | undefined;
    horario_fim?: string | undefined;
    qtd_envio_diario?: number | undefined;
    somente_dias_uteis?: boolean | undefined;
}, {
    horario_inicio?: string | undefined;
    horario_fim?: string | undefined;
    qtd_envio_diario?: number | undefined;
    somente_dias_uteis?: boolean | undefined;
}>, {
    horario_inicio?: string | undefined;
    horario_fim?: string | undefined;
    qtd_envio_diario?: number | undefined;
    somente_dias_uteis?: boolean | undefined;
}, {
    horario_inicio?: string | undefined;
    horario_fim?: string | undefined;
    qtd_envio_diario?: number | undefined;
    somente_dias_uteis?: boolean | undefined;
}>;
export type CreateConfiguracaoFollowupInput = z.infer<typeof createConfiguracaoFollowupSchema>;
export type UpdateConfiguracaoFollowupInput = z.infer<typeof updateConfiguracaoFollowupSchema>;
export declare const createProvedorSchema: z.ZodObject<{
    nome: z.ZodString;
    descricao: z.ZodOptional<z.ZodString>;
    ativo: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    nome: string;
    ativo: boolean;
    descricao?: string | undefined;
}, {
    nome: string;
    descricao?: string | undefined;
    ativo?: boolean | undefined;
}>;
export declare const updateProvedorSchema: z.ZodEffects<z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    descricao: z.ZodOptional<z.ZodString>;
    ativo: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    nome?: string | undefined;
    descricao?: string | undefined;
    ativo?: boolean | undefined;
}, {
    nome?: string | undefined;
    descricao?: string | undefined;
    ativo?: boolean | undefined;
}>, {
    nome?: string | undefined;
    descricao?: string | undefined;
    ativo?: boolean | undefined;
}, {
    nome?: string | undefined;
    descricao?: string | undefined;
    ativo?: boolean | undefined;
}>;
export type CreateProvedorInput = z.infer<typeof createProvedorSchema>;
export type UpdateProvedorInput = z.infer<typeof updateProvedorSchema>;
export declare const createTipoAcessoSchema: z.ZodObject<{
    nome: z.ZodString;
    descricao: z.ZodOptional<z.ZodString>;
    ativo: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    nome: string;
    ativo: boolean;
    descricao?: string | undefined;
}, {
    nome: string;
    descricao?: string | undefined;
    ativo?: boolean | undefined;
}>;
export declare const updateTipoAcessoSchema: z.ZodEffects<z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    descricao: z.ZodOptional<z.ZodString>;
    ativo: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    nome?: string | undefined;
    descricao?: string | undefined;
    ativo?: boolean | undefined;
}, {
    nome?: string | undefined;
    descricao?: string | undefined;
    ativo?: boolean | undefined;
}>, {
    nome?: string | undefined;
    descricao?: string | undefined;
    ativo?: boolean | undefined;
}, {
    nome?: string | undefined;
    descricao?: string | undefined;
    ativo?: boolean | undefined;
}>;
export type CreateTipoAcessoInput = z.infer<typeof createTipoAcessoSchema>;
export type UpdateTipoAcessoInput = z.infer<typeof updateTipoAcessoSchema>;
export declare const createRevendedorSchema: z.ZodObject<{
    nome: z.ZodString;
    email: z.ZodString;
    telefone: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    nome: string;
    status: string;
    telefone?: string | undefined;
}, {
    email: string;
    nome: string;
    telefone?: string | undefined;
    status?: string | undefined;
}>;
export declare const updateRevendedorSchema: z.ZodEffects<z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    telefone: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    status?: string | undefined;
}, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    status?: string | undefined;
}>, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    status?: string | undefined;
}, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    status?: string | undefined;
}>;
export type CreateRevendedorInput = z.infer<typeof createRevendedorSchema>;
export type UpdateRevendedorInput = z.infer<typeof updateRevendedorSchema>;
export declare const createClienteSchema: z.ZodObject<{
    nome: z.ZodString;
    email: z.ZodString;
    telefone: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    revendedor_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    nome: string;
    status: string;
    telefone?: string | undefined;
    revendedor_id?: string | undefined;
}, {
    email: string;
    nome: string;
    telefone?: string | undefined;
    status?: string | undefined;
    revendedor_id?: string | undefined;
}>;
export declare const updateClienteSchema: z.ZodEffects<z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    telefone: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    revendedor_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    status?: string | undefined;
    revendedor_id?: string | undefined;
}, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    status?: string | undefined;
    revendedor_id?: string | undefined;
}>, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    status?: string | undefined;
    revendedor_id?: string | undefined;
}, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    status?: string | undefined;
    revendedor_id?: string | undefined;
}>;
export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;
export declare const createUsuarioSchema: z.ZodObject<{
    nome: z.ZodString;
    email: z.ZodString;
    telefone: z.ZodOptional<z.ZodString>;
    provedor_id: z.ZodString;
    tipo_acesso_id: z.ZodString;
    revendedor_id: z.ZodOptional<z.ZodString>;
    ativo: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    nome: string;
    ativo: boolean;
    provedor_id: string;
    tipo_acesso_id: string;
    telefone?: string | undefined;
    revendedor_id?: string | undefined;
}, {
    email: string;
    nome: string;
    provedor_id: string;
    tipo_acesso_id: string;
    telefone?: string | undefined;
    ativo?: boolean | undefined;
    revendedor_id?: string | undefined;
}>;
export declare const updateUsuarioSchema: z.ZodEffects<z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    telefone: z.ZodOptional<z.ZodString>;
    provedor_id: z.ZodOptional<z.ZodString>;
    tipo_acesso_id: z.ZodOptional<z.ZodString>;
    revendedor_id: z.ZodOptional<z.ZodString>;
    ativo: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    ativo?: boolean | undefined;
    revendedor_id?: string | undefined;
    provedor_id?: string | undefined;
    tipo_acesso_id?: string | undefined;
}, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    ativo?: boolean | undefined;
    revendedor_id?: string | undefined;
    provedor_id?: string | undefined;
    tipo_acesso_id?: string | undefined;
}>, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    ativo?: boolean | undefined;
    revendedor_id?: string | undefined;
    provedor_id?: string | undefined;
    tipo_acesso_id?: string | undefined;
}, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    ativo?: boolean | undefined;
    revendedor_id?: string | undefined;
    provedor_id?: string | undefined;
    tipo_acesso_id?: string | undefined;
}>;
export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
export declare const createEvolutionInstanceSchema: z.ZodObject<{
    instanceName: z.ZodString;
    token: z.ZodOptional<z.ZodString>;
    qrcode: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    number: z.ZodOptional<z.ZodString>;
    integration: z.ZodOptional<z.ZodString>;
    webhookUrl: z.ZodOptional<z.ZodString>;
    webhookByEvents: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    webhookBase64: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    webhookEvents: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    instanceName: string;
    qrcode: boolean;
    webhookByEvents: boolean;
    webhookBase64: boolean;
    number?: string | undefined;
    token?: string | undefined;
    integration?: string | undefined;
    webhookUrl?: string | undefined;
    webhookEvents?: string[] | undefined;
}, {
    instanceName: string;
    number?: string | undefined;
    token?: string | undefined;
    qrcode?: boolean | undefined;
    integration?: string | undefined;
    webhookUrl?: string | undefined;
    webhookByEvents?: boolean | undefined;
    webhookBase64?: boolean | undefined;
    webhookEvents?: string[] | undefined;
}>;
export declare const updateEvolutionInstanceSchema: z.ZodEffects<z.ZodObject<{
    instanceName: z.ZodOptional<z.ZodString>;
    token: z.ZodOptional<z.ZodString>;
    qrcode: z.ZodOptional<z.ZodBoolean>;
    number: z.ZodOptional<z.ZodString>;
    integration: z.ZodOptional<z.ZodString>;
    webhookUrl: z.ZodOptional<z.ZodString>;
    webhookByEvents: z.ZodOptional<z.ZodBoolean>;
    webhookBase64: z.ZodOptional<z.ZodBoolean>;
    webhookEvents: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    number?: string | undefined;
    instanceName?: string | undefined;
    token?: string | undefined;
    qrcode?: boolean | undefined;
    integration?: string | undefined;
    webhookUrl?: string | undefined;
    webhookByEvents?: boolean | undefined;
    webhookBase64?: boolean | undefined;
    webhookEvents?: string[] | undefined;
}, {
    number?: string | undefined;
    instanceName?: string | undefined;
    token?: string | undefined;
    qrcode?: boolean | undefined;
    integration?: string | undefined;
    webhookUrl?: string | undefined;
    webhookByEvents?: boolean | undefined;
    webhookBase64?: boolean | undefined;
    webhookEvents?: string[] | undefined;
}>, {
    number?: string | undefined;
    instanceName?: string | undefined;
    token?: string | undefined;
    qrcode?: boolean | undefined;
    integration?: string | undefined;
    webhookUrl?: string | undefined;
    webhookByEvents?: boolean | undefined;
    webhookBase64?: boolean | undefined;
    webhookEvents?: string[] | undefined;
}, {
    number?: string | undefined;
    instanceName?: string | undefined;
    token?: string | undefined;
    qrcode?: boolean | undefined;
    integration?: string | undefined;
    webhookUrl?: string | undefined;
    webhookByEvents?: boolean | undefined;
    webhookBase64?: boolean | undefined;
    webhookEvents?: string[] | undefined;
}>;
export declare const setWebhookSchema: z.ZodObject<{
    url: z.ZodString;
    enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    events: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    webhook_by_events: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    webhook_base64: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    url: string;
    enabled: boolean;
    webhook_by_events: boolean;
    webhook_base64: boolean;
    events?: string[] | undefined;
}, {
    url: string;
    enabled?: boolean | undefined;
    events?: string[] | undefined;
    webhook_by_events?: boolean | undefined;
    webhook_base64?: boolean | undefined;
}>;
export type CreateEvolutionInstanceInput = z.infer<typeof createEvolutionInstanceSchema>;
export type UpdateEvolutionInstanceInput = z.infer<typeof updateEvolutionInstanceSchema>;
export type SetWebhookInput = z.infer<typeof setWebhookSchema>;
//# sourceMappingURL=validators.d.ts.map