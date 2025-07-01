export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", any>;
export interface Lead {
    id: string;
    nome: string;
    telefone: string;
    email: string;
    empresa?: string;
    cargo?: string;
    origem_id: string;
    status_agendamento: boolean;
    agendado_em?: string;
    mensagem_status_id: string;
    etapa_funil_id?: string;
    status_negociacao_id?: string;
    created_at: string;
}
export interface MensagemStatus {
    id: string;
    mensagem_1_enviada: boolean;
    mensagem_1_data?: string;
    mensagem_2_enviada: boolean;
    mensagem_2_data?: string;
    mensagem_3_enviada: boolean;
    mensagem_3_data?: string;
}
export interface OrigemLead {
    id: string;
    nome: string;
}
export interface EtapaFunil {
    id: string;
    nome: string;
}
export interface StatusNegociacao {
    id: string;
    nome: string;
}
//# sourceMappingURL=supabase.d.ts.map