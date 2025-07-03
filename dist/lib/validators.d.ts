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
    tipo_mensagem: z.ZodEnum<["mensagem_1", "mensagem_2", "mensagem_3"]>;
}, "strip", z.ZodTypeAny, {
    tipo_mensagem: "mensagem_1" | "mensagem_2" | "mensagem_3";
}, {
    tipo_mensagem: "mensagem_1" | "mensagem_2" | "mensagem_3";
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
    origem_id: z.ZodOptional<z.ZodString>;
    status_agendamento: z.ZodOptional<z.ZodBoolean>;
    etapa_funil_id: z.ZodOptional<z.ZodString>;
    status_negociacao_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    origem_id?: string | undefined;
    etapa_funil_id?: string | undefined;
    status_negociacao_id?: string | undefined;
    empresa?: string | undefined;
    cargo?: string | undefined;
    status_agendamento?: boolean | undefined;
}, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    origem_id?: string | undefined;
    etapa_funil_id?: string | undefined;
    status_negociacao_id?: string | undefined;
    empresa?: string | undefined;
    cargo?: string | undefined;
    status_agendamento?: boolean | undefined;
}>, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    origem_id?: string | undefined;
    etapa_funil_id?: string | undefined;
    status_negociacao_id?: string | undefined;
    empresa?: string | undefined;
    cargo?: string | undefined;
    status_agendamento?: boolean | undefined;
}, {
    email?: string | undefined;
    nome?: string | undefined;
    telefone?: string | undefined;
    origem_id?: string | undefined;
    etapa_funil_id?: string | undefined;
    status_negociacao_id?: string | undefined;
    empresa?: string | undefined;
    cargo?: string | undefined;
    status_agendamento?: boolean | undefined;
}>;
export declare const atualizarMensagemSchema: z.ZodObject<{
    tipo_mensagem: z.ZodEnum<["mensagem_1", "mensagem_2", "mensagem_3"]>;
    enviada: z.ZodBoolean;
    data: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tipo_mensagem: "mensagem_1" | "mensagem_2" | "mensagem_3";
    enviada: boolean;
    data?: string | undefined;
}, {
    tipo_mensagem: "mensagem_1" | "mensagem_2" | "mensagem_3";
    enviada: boolean;
    data?: string | undefined;
}>;
export declare const createLeadSchema: z.ZodObject<{
    nome: z.ZodString;
    telefone: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    empresa: z.ZodOptional<z.ZodString>;
    cargo: z.ZodOptional<z.ZodString>;
    origem_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nome: string;
    telefone: string;
    email?: string | undefined;
    origem_id?: string | undefined;
    empresa?: string | undefined;
    cargo?: string | undefined;
}, {
    nome: string;
    telefone: string;
    email?: string | undefined;
    origem_id?: string | undefined;
    empresa?: string | undefined;
    cargo?: string | undefined;
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
export type AtualizarMensagemInput = z.infer<typeof atualizarMensagemSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
//# sourceMappingURL=validators.d.ts.map