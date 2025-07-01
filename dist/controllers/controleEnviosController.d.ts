import { Request, Response } from 'express';
export declare class ControleEnviosController {
    private static handleError;
    static getAllControleEnvios(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getControleEnvioByDate(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getStatusEnvio(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static incrementarQuantidade(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getControleEnvioHoje(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=controleEnviosController.d.ts.map