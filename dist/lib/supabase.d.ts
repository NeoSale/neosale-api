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
    mensagem_status_id: string;
    etapa_funil_id?: string;
    status_negociacao_id?: string;
    qualificacao_id?: string;
    deletado: boolean;
    created_at: string;
}
export interface MensagemStatus {
    id: string;
    id_mensagem: string;
    status: 'sucesso' | 'erro';
    erro?: string;
    mensagem_enviada: string;
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