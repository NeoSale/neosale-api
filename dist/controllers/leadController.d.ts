import { Request, Response } from 'express';
export declare class LeadController {
    private static extractIdFromUrl;
    private static handleError;
    static criarLead(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static importLeads(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static bulkImportLeads(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getImportInfo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static agendarLead(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAgendamentoInfo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static enviarMensagem(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getMensagensInfo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static atualizarEtapa(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getEtapaInfo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static atualizarStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getStatusInfo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static buscarLead(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static buscarPorTelefone(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static listarLeads(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static listarLeadsPaginados(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static obterEstatisticas(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static atualizarLead(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static excluirLead(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static atualizarMensagem(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=leadController.d.ts.map