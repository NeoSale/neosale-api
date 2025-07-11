export interface ControleEnvio {
    id: string;
    data: string;
    quantidade_enviada: number;
    limite_diario: number;
    created_at: string;
}
export declare class ControleEnviosService {
    private static checkSupabaseConnection;
    static getAllControleEnvios(): Promise<ControleEnvio[]>;
    static getControleEnvioByDate(data: string): Promise<ControleEnvio>;
    static createControleEnvio(data: string): Promise<ControleEnvio>;
    static updateQuantidadeEnviada(data: string, novaQuantidade: number): Promise<ControleEnvio>;
    static incrementarQuantidadeEnviada(data: string, incremento?: number): Promise<ControleEnvio>;
    static podeEnviarMensagem(data: string): Promise<{
        podeEnviar: boolean;
        quantidadeRestante: number;
        limite: number;
        enviadas: number;
    }>;
    static alterarQuantidadeEnviada(data: string, novaQuantidade: number): Promise<ControleEnvio>;
    static alterarLimiteDiario(novoLimite: number): Promise<ControleEnvio>;
}
//# sourceMappingURL=controleEnviosService.d.ts.map