import { ImportLeadsInput, BulkLeadsInput, AgendamentoInput, MensagemInput, EtapaInput, StatusInput, PaginationInput, UpdateLeadInput, AtualizarMensagemInput } from '../lib/validators';
export declare class LeadService {
    static importLeads(data: ImportLeadsInput): Promise<any[]>;
    static bulkImportLeads(data: BulkLeadsInput): Promise<any[]>;
    static agendarLead(id: string, data: AgendamentoInput): Promise<any>;
    static enviarMensagem(id: string, data: MensagemInput): Promise<any>;
    static atualizarMensagem(id: string, data: AtualizarMensagemInput): Promise<any>;
    static atualizarEtapa(id: string, data: EtapaInput): Promise<any>;
    static atualizarStatus(id: string, data: StatusInput): Promise<any>;
    static buscarPorId(id: string): Promise<any>;
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
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=leadService.d.ts.map