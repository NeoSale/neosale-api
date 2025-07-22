"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Carregar variáveis de ambiente PRIMEIRO
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log('🚀 Iniciando servidor...');
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./lib/swagger");
const leadRoutes_1 = require("./routes/leadRoutes");
const controleEnviosRoutes_1 = require("./routes/controleEnviosRoutes");
const referenciaRoutes_1 = __importDefault(require("./routes/referenciaRoutes"));
const configuracaoRoutes_1 = __importDefault(require("./routes/configuracaoRoutes"));
const mensagemRoutes_1 = __importDefault(require("./routes/mensagemRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const package_json_1 = __importDefault(require("../package.json"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Detectar automaticamente a URL base
let BASE_URL = process.env.API_BASE_URL;
if (!BASE_URL) {
    // Se não estiver explicitamente em desenvolvimento local, usar URL de produção
    const isLocalDev = process.env.NODE_ENV === 'development' ||
        process.env.npm_lifecycle_event === 'dev';
    if (isLocalDev) {
        BASE_URL = `http://localhost:${PORT}`;
    }
    else {
        BASE_URL = 'https://evolution-api-neosale-api.mrzt3w.easypanel.host';
    }
}
// Middleware de segurança
app.use((0, helmet_1.default)());
// CORS
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
// Logging
app.use((0, morgan_1.default)('combined'));
// Parse JSON
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Swagger configurado em ./lib/swagger.ts
// Rota raiz com informações da API
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Bem-vindo à NeoSale API! 🚀',
        version: package_json_1.default.version,
        endpoints: {
            documentation: `${BASE_URL}/api-docs`,
            health: `${BASE_URL}/health`,
            leads: `${BASE_URL}/api/leads`,
            controleEnvios: `${BASE_URL}/api/controle-envios`,
            referencias: `${BASE_URL}/api/referencias`,
            configuracoes: `${BASE_URL}/api/configuracoes`,
            mensagens: `${BASE_URL}/api/mensagens`
        },
        description: 'API para gerenciamento de leads do sistema NeoSale'
    });
});
// Rotas
app.use('/api/leads', leadRoutes_1.leadRoutes);
app.use('/api/controle-envios', controleEnviosRoutes_1.controleEnviosRoutes);
app.use('/api/referencias', referenciaRoutes_1.default);
app.use('/api/configuracoes', configuracaoRoutes_1.default);
app.use('/api/mensagens', mensagemRoutes_1.default);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// Rota de health check
app.get('/health', (req, res) => {
    // Usar fuso horário do Brasil para timestamp (formato pt-BR)
    const agora = new Date();
    const brasilTime = agora.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    res.json({
        status: 'OK',
        timestamp: brasilTime,
        timezone: 'America/Sao_Paulo',
        uptime: process.uptime()
    });
});
// Middleware de tratamento de erros
app.use(errorHandler_1.errorHandler);
// Rota 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Rota não encontrada',
        path: req.originalUrl
    });
});
// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📚 Documentação disponível em ${BASE_URL}/api-docs`);
    console.log(`❤️  Health check em ${BASE_URL}/health`);
});
exports.default = app;
//# sourceMappingURL=server.js.map