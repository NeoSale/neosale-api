"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControleEnviosController = void 0;
const controleEnviosService_1 = require("../services/controleEnviosService");
const zod_1 = require("zod");
class ControleEnviosController {
    // Utilitário para tratamento de erros
    static handleError(res, error) {
        console.error('❌ Erro no controller:', error);
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Dados inválidos',
                details: error.errors
            });
        }
        if (error.code === 'PGRST301') {
            return res.status(404).json({
                success: false,
                error: 'Registro não encontrado'
            });
        }
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
    // GET /api/controle-envios - Buscar todos os registros
    static async getAllControleEnvios(req, res) {
        try {
            console.log('📋 GET /api/controle-envios - Buscando todos os registros');
            const controleEnvios = await controleEnviosService_1.ControleEnviosService.getAllControleEnvios();
            return res.json({
                success: true,
                data: controleEnvios,
                total: controleEnvios.length,
                message: 'Registros de controle de envios encontrados com sucesso'
            });
        }
        catch (error) {
            return ControleEnviosController.handleError(res, error);
        }
    }
    // GET /api/controle-envios/:data - Buscar por data específica
    static async getControleEnvioByDate(req, res) {
        try {
            const { data } = req.params;
            console.log('📋 GET /api/controle-envios/:data - Buscando por data:', data);
            // Validar formato da data (YYYY-MM-DD)
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(data)) {
                return res.status(400).json({
                    success: false,
                    error: 'Formato de data inválido. Use YYYY-MM-DD'
                });
            }
            // Validar se é uma data válida
            const dataObj = new Date(data + 'T00:00:00.000Z');
            if (isNaN(dataObj.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: 'Data inválida'
                });
            }
            const controleEnvio = await controleEnviosService_1.ControleEnviosService.getControleEnvioByDate(data);
            return res.json({
                success: true,
                data: controleEnvio,
                message: 'Controle de envio encontrado com sucesso'
            });
        }
        catch (error) {
            return ControleEnviosController.handleError(res, error);
        }
    }
    // GET /api/controle-envios/:data/status - Verificar se pode enviar mensagem
    static async getStatusEnvio(req, res) {
        try {
            const { data } = req.params;
            console.log('📋 GET /api/controle-envios/:data/status - Verificando status para data:', data);
            // Validar formato da data (YYYY-MM-DD)
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(data)) {
                return res.status(400).json({
                    success: false,
                    error: 'Formato de data inválido. Use YYYY-MM-DD'
                });
            }
            const status = await controleEnviosService_1.ControleEnviosService.podeEnviarMensagem(data);
            return res.json({
                success: true,
                data: status,
                message: 'Status de envio verificado com sucesso'
            });
        }
        catch (error) {
            return ControleEnviosController.handleError(res, error);
        }
    }
    // POST /api/controle-envios/:data/incrementar - Incrementar quantidade enviada
    static async incrementarQuantidade(req, res) {
        try {
            const { data } = req.params;
            const { incremento = 1 } = req.body;
            console.log('📋 POST /api/controle-envios/:data/incrementar - Data:', data, 'Incremento:', incremento);
            // Validar formato da data
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(data)) {
                return res.status(400).json({
                    success: false,
                    error: 'Formato de data inválido. Use YYYY-MM-DD'
                });
            }
            // Validar incremento
            if (typeof incremento !== 'number' || incremento < 1) {
                return res.status(400).json({
                    success: false,
                    error: 'Incremento deve ser um número positivo'
                });
            }
            const controleAtualizado = await controleEnviosService_1.ControleEnviosService.incrementarQuantidadeEnviada(data, incremento);
            return res.json({
                success: true,
                data: controleAtualizado,
                message: 'Quantidade enviada incrementada com sucesso'
            });
        }
        catch (error) {
            return ControleEnviosController.handleError(res, error);
        }
    }
    // GET /api/controle-envios/hoje - Buscar controle de hoje
    static async getControleEnvioHoje(req, res) {
        try {
            // Obter data atual no fuso horário do Brasil (UTC-3)
            const agora = new Date();
            const brasilTime = agora.toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" });
            const hoje = brasilTime.split(' ')[0]; // YYYY-MM-DD
            console.log('📋 GET /api/controle-envios/hoje - Buscando controle para hoje (Brasil):', hoje);
            const controleEnvio = await controleEnviosService_1.ControleEnviosService.getControleEnvioByDate(hoje);
            return res.json({
                success: true,
                data: controleEnvio,
                message: 'Controle de envio de hoje encontrado com sucesso'
            });
        }
        catch (error) {
            return ControleEnviosController.handleError(res, error);
        }
    }
}
exports.ControleEnviosController = ControleEnviosController;
//# sourceMappingURL=controleEnviosController.js.map