import { ImportLeadsInput, BulkLeadsInput, AgendamentoInput, MensagemInput, EtapaInput, StatusInput, PaginationInput, UpdateLeadInput, AtualizarMensagemInput, CreateLeadInput } from '../lib/validators';
export declare class LeadService {
    private static checkSupabaseConnection;
    static criarLead(data: CreateLeadInput): Promise<any>;
    static importLeads(data: ImportLeadsInput): Promise<{
        created: any[];
        skipped: {
            motivo: string;
            email: string;
            nome: string;
            telefone: string;
            origem_id: string;
            empresa?: string | undefined;
            cargo?: string | undefined;
        }[];
    }>;
    static bulkImportLeads(data: BulkLeadsInput): Promise<{
        created: any[];
        skipped: {
            motivo: string;
            nome: string;
            telefone: string;
            email?: string | undefined;
            empresa?: string | undefined;
            cargo?: string | undefined;
        }[];
    }>;
    static agendarLead(id: string, data: AgendamentoInput): Promise<any>;
    static enviarMensagem(id: string, data: MensagemInput): Promise<any>;
    static atualizarMensagem(id: string, data: AtualizarMensagemInput): Promise<any>;
    static atualizarEtapa(id: string, data: EtapaInput): Promise<any>;
    static atualizarStatus(id: string, data: StatusInput): Promise<any>;
    static buscarPorId(id: string): Promise<any>;
    static buscarPorTelefone(telefone: string): Promise<any>;
    static listarTodos(): Promise<any[]>;
    static listarComPaginacao(params: PaginationInput): Promise<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    static obterEstatisticas(): Promise<{
        total: number;
        withEmail: number;
        qualified: number;
        new: number;
        byStatus: Record<string, number>;
    }>;
    static atualizarLead(id: string, data: UpdateLeadInput): Promise<any>;
    static excluirLead(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=leadService.d.ts.map