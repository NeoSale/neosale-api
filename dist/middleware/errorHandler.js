"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.errorHandler = void 0;
const zod_1 = require("zod");
const errorHandler = (error, req, res, next) => {
    console.error('❌ Erro capturado:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        query: req.query
    });
    // Erro de validação Zod
    if (error instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            error: 'Dados inválidos',
            details: error.errors
        });
    }
    // Erro customizado com status code
    if (error.statusCode) {
        return res.status(error.statusCode).json({
            success: false,
            error: error.message,
            details: error.details
        });
    }
    // Erro interno do servidor
    return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
};
exports.errorHandler = errorHandler;
// Função para criar erros customizados
const createError = (message, statusCode, details) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.details = details;
    return error;
};
exports.createError = createError;
//# sourceMappingURL=errorHandler.js.map