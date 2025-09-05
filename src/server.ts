// Carregar variáveis de ambiente PRIMEIRO
import dotenv from 'dotenv'
dotenv.config()

// Configurar Node.js para aceitar certificados SSL auto-assinados
// Isso resolve problemas de conectividade com alguns serviços em ambientes corporativos
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

console.log('🚀 Iniciando servidor...') // Restart

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './lib/swagger'
import http from 'http'
import path from 'path'
import { leadRoutes } from './routes/leadRoutes'
import { controleEnviosRoutes } from './routes/controleEnviosRoutes'
import referenciaRoutes from './routes/referenciaRoutes'
import parametroRoutes from './routes/parametroRoutes'
import mensagemRoutes from './routes/mensagemRoutes'
import followupRoutes from './routes/followupRoutes'
import configuracoesRoutes from './routes/configuracoesRoutes'
import configuracaoFollowupRoutes from './routes/configuracaoFollowupRoutes'
import provedorRoutes from './routes/provedorRoutes'
import tipoAcessoRoutes from './routes/tipoAcessoRoutes'
import tipoAgenteRoutes from './routes/tipoAgenteRoutes'
import agenteRoutes from './routes/agenteRoutes'
import historicoPromptRoutes from './routes/historicoPromptRoutes'
import revendedorRoutes from './routes/revendedorRoutes'
import clienteRoutes from './routes/clienteRoutes'
import usuarioRoutes from './routes/usuarioRoutes'
import usuarioAdminRoutes from './routes/usuarioAdminRoutes'
import evolutionApiRoutes from './routes/evolution-api.routes'
import n8nChatHistoriesRoutes from './routes/n8nChatHistoriesRoutes'
import chatRoutes from './routes/chatRoutes'

import adminRoutes from './routes/adminRoutes'
import { errorHandler } from './middleware/errorHandler'
import packageJson from '../package.json'
import websocketService from './services/websocketService'

const app = express()
const PORT = process.env.NEXT_PUBLIC_PORT

// Criar servidor HTTP para anexar o WebSocket
const server = http.createServer(app)

// Detectar automaticamente a URL base
let BASE_URL = process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_API_BASE_URL : `${process.env.NEXT_PUBLIC_API_BASE_URL}:${PORT}`

// Middleware de segurança
app.use(helmet())

// CORS
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'cliente_id', 'X-Requested-With']
}))

// Logging
app.use(morgan('combined'))

// Middleware para processar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para processar text/plain como JSON (fix para frontend)
app.use('/api/leads', (req, res, next) => {
  if (req.headers['content-type'] === 'text/plain;charset=UTF-8' && req.method === 'POST') {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        req.body = JSON.parse(body)
        next()
      } catch (error) {
        console.error('❌ Erro ao parsear JSON do text/plain:', error)
        res.status(400).json({ error: 'Invalid JSON in request body' })
      }
    })
  } else {
    next()
  }
})

// Swagger configurado em ./lib/swagger.ts

// Rota raiz com informações da API
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bem-vindo à NeoSale API! 🚀',
    version: packageJson.version,
    endpoints: {
      documentation: `${BASE_URL}/api-docs`,
      health: `${BASE_URL}/health`,
      leads: `${BASE_URL}/api/leads`,
      controleEnvios: `${BASE_URL}/api/controle-envios`,
      referencias: `${BASE_URL}/api/referencias`,
      parametros: `${BASE_URL}/api/parametros`,
      mensagens: `${BASE_URL}/api/mensagens`,
      followup: `${BASE_URL}/api/followup`,
      configuracoes: `${BASE_URL}/api/configuracoes`,
      configuracoesFollowup: `${BASE_URL}/api/configuracoes-followup`,
      provedores: `${BASE_URL}/api/provedores`,
      tiposAcesso: `${BASE_URL}/api/tipos-acesso`,
      tiposAgente: `${BASE_URL}/api/tipo-agentes`,
      agentes: `${BASE_URL}/api/agentes`,
      revendedores: `${BASE_URL}/api/revendedores`,
      clientes: `${BASE_URL}/api/clientes`,
      usuarios: `${BASE_URL}/api/usuarios`,
      evolutionApi: `${BASE_URL}/api/evolution-api`,
      chat: `${BASE_URL}/api/chat`,

    },
    description: 'API para gerenciamento de leads do sistema NeoSale'
  })
})

// Rotas
app.use('/api/leads', leadRoutes)
app.use('/api/controle-envios', controleEnviosRoutes)
app.use('/api/referencias', referenciaRoutes)
app.use('/api/parametros', parametroRoutes)
app.use('/api/mensagens', mensagemRoutes)
app.use('/api/followup', followupRoutes)
app.use('/api/configuracoes', configuracoesRoutes)
app.use('/api/configuracoes-followup', configuracaoFollowupRoutes)
app.use('/api/provedores', provedorRoutes)
app.use('/api/tipos-acesso', tipoAcessoRoutes)
app.use('/api/tipo-agentes', tipoAgenteRoutes)
app.use('/api/agentes', agenteRoutes)
app.use('/api/historico-prompt', historicoPromptRoutes)
app.use('/api/revendedores', revendedorRoutes)
app.use('/api/clientes', clienteRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/usuarios-admin', usuarioAdminRoutes)
app.use('/api/evolution-api', evolutionApiRoutes)
app.use('/api/n8n_chat_histories', n8nChatHistoriesRoutes)
app.use('/api/chat', chatRoutes)

app.use('/api/admin', adminRoutes)
app.use('/api-docs', cors(), swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rota de health check
app.get('/health', (req, res) => {
  // Usar fuso horário do Brasil para timestamp (formato pt-BR)
  const agora = new Date()
  const brasilTime = agora.toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo", year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'})
  
  res.json({ 
    status: 'OK', 
    timestamp: brasilTime,
    timezone: 'America/Sao_Paulo',
    uptime: process.uptime()
  })
})

// Middleware de tratamento de erros
app.use(errorHandler)

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.originalUrl
  })
})

// Função para inicializar o servidor com migrations
async function startServer() {
  try {
    // Executar migrations automaticamente no startup
    // console.log('🔄 Executando migrations...')
    // await migrationRunner.runMigrations()
    // await migrationRunner.markMigrationsAsExecuted()
    
    // Iniciar servidor HTTP
    server.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`)
      console.log(`📚 Documentação disponível em ${BASE_URL}/api-docs`)
      console.log(`❤️ Health check em ${BASE_URL}/health`)
      console.log(`🔌 WebSocket disponível em ws://localhost:${PORT}`)
      
      // Inicializar serviço WebSocket
      websocketService.initialize(server)
    })
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error)
    process.exit(1)
  }
}

// Inicializar servidor
startServer()

// Configurar encerramento gracioso
process.on('SIGINT', () => {
  console.log('🛑 Encerrando servidor...')
  websocketService.shutdown()
  server.close(() => {
    console.log('🛑 Servidor HTTP encerrado')
    process.exit(0)
  })
})

export default app