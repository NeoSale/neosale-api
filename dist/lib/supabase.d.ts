export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", any> | null;
export interface Lead {
    id: string;
    nome: string;
    telefone: string;
    email?: string;
    empresa?: string;
    cargo?: string;
    origem_id: string;
    status_agendamento: boolean;
    agendado_em?: string;
    followup_id: string;
    etapa_funil_id?: string;
    status_negociacao_id?: string;
    qualificacao_id?: string;
    deletado: boolean;
    created_at: string;
}
export interface Followup {
    id: string;
    id_mensagem: string;
    id_lead: string;
    status: 'sucesso' | 'erro';
    erro?: string;
    mensagem_enviada: string;
    embedding?: number[];
    created_at?: string;
    updated_at?: string;
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