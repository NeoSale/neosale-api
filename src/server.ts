// Carregar variáveis de ambiente PRIMEIRO
import dotenv from 'dotenv'
import path from 'path'

// Carregar .env do diretório raiz do projeto
// Quando executado via ts-node/nodemon, __dirname é src/
// Quando executado via node (compilado), __dirname é dist/
const envPath = path.resolve(process.cwd(), '.env')
dotenv.config({ path: envPath })

// Configurar Node.js para aceitar certificados SSL auto-assinados
// Isso resolve problemas de conectividade com alguns serviços em ambientes corporativos
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

console.log('🚀 Iniciando servidor...')

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './lib/swagger'
import { leadRoutes } from './routes/leadRoutes'
import { controleEnviosRoutes } from './routes/controleEnviosRoutes'
import referenciaRoutes from './routes/referenciaRoutes'
import parametroRoutes from './routes/parametroRoutes'
import mensagemRoutes from './routes/mensagemRoutes'
import automaticMessagesRoutes from './routes/automaticMessagesRoutes'
import configuracoesRoutes from './routes/configuracoesRoutes'
import provedorRoutes from './routes/provedorRoutes'
import tipoAcessoRoutes from './routes/tipoAcessoRoutes'
import tipoAgenteRoutes from './routes/tipoAgenteRoutes'
import agenteRoutes from './routes/agenteRoutes'
import historicoPromptRoutes from './routes/historicoPromptRoutes'
import revendedorRoutes from './routes/revendedorRoutes'
import clienteRoutes from './routes/clienteRoutes'
import usuarioRoutes from './routes/usuarioRoutes'
import usuarioAdminRoutes from './routes/usuarioAdminRoutes'
import evolutionApiV2Routes from './routes/evolution-api-v2.routes'
import chatRoutes from './routes/chatRoutes'
import documentoRoutes from './routes/documentoRoutes'
import baseRoutes from './routes/baseRoutes'
import origemLeadsRoutes from './routes/origemLeadsRoutes'
import qualificacaoRoutes from './routes/qualificacaoRoutes'
import googleCalendarRoutes from './routes/googleCalendarRoutes'
import perfilRoutes from './routes/perfilRoutes'
import conviteRoutes from './routes/conviteRoutes'
import sessaoRoutes from './routes/sessaoRoutes'
import authRoutes from './routes/authRoutes'
import profileRoutes from './routes/profileRoutes'
import leadAtribuicaoRoutes from './routes/leadAtribuicaoRoutes'
import notificationSettingsRoutes from './routes/notificationSettingsRoutes'
import distributionReportRoutes from './routes/distributionReportRoutes'

import llmConfigRoutes from './routes/llmConfigRoutes'
import promptConfigRoutes from './routes/promptConfigRoutes'
import followupRoutes from './routes/followupRoutes'
import prospectingRoutes from './routes/prospectingRoutes'
import linkedinRoutes from './routes/linkedinRoutes'
import adminRoutes from './routes/adminRoutes'
import { errorHandler } from './middleware/errorHandler'
import { ProspectingScheduler } from './schedulers/prospectingScheduler'
import { EventQueueProcessor } from './schedulers/eventQueueProcessor'
import { FollowupService } from './services/followupService'
import packageJson from '../package.json'

const app = express()
const PORT = process.env.NEXT_PUBLIC_PORT

// Detectar automaticamente a URL base
let BASE_URL = process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_API_BASE_URL : `${process.env.NEXT_PUBLIC_API_BASE_URL}:${PORT}`

// Middleware de segurança
app.use(helmet())

// CORS
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'cliente_id', 'cliente_id', 'X-Requested-With']
}))

// Logging
app.use(morgan('combined'))

// Parse JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

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
      prospecting: `${BASE_URL}/api/prospecting`,
      documentation: `${BASE_URL}/api-docs`,
      health: `${BASE_URL}/health`,
      leads: `${BASE_URL}/api/leads`,
      controleEnvios: `${BASE_URL}/api/controle-envios`,
      referencias: `${BASE_URL}/api/referencias`,
      parametros: `${BASE_URL}/api/parametros`,
      mensagens: `${BASE_URL}/api/mensagens`,
      automaticMessages: `${BASE_URL}/api/automatic-messages`,
      configuracoes: `${BASE_URL}/api/configuracoes`,
      provedores: `${BASE_URL}/api/provedores`,
      tiposAcesso: `${BASE_URL}/api/tipos-acesso`,
      tiposAgente: `${BASE_URL}/api/tipos-agente`,
      agentes: `${BASE_URL}/api/agentes`,
      revendedores: `${BASE_URL}/api/revendedores`,
      clientes: `${BASE_URL}/api/clientes`,
      usuarios: `${BASE_URL}/api/usuarios`,
      auth: `${BASE_URL}/api/auth`,
      evolutionApi: `${BASE_URL}/api/evolution-api`,
      chat: `${BASE_URL}/api/chat`,
      origemLeads: `${BASE_URL}/api/origem-leads`,

    },
    description: 'API para gerenciamento de leads do sistema NeoSale'
  })
})

// Rotas da API
app.use('/api/leads', leadRoutes)
app.use('/api/controle-envios', controleEnviosRoutes)
app.use('/api/referencias', referenciaRoutes)
app.use('/api/parametros', parametroRoutes)
app.use('/api/mensagens', mensagemRoutes)
app.use('/api/automatic-messages', automaticMessagesRoutes)
app.use('/api/configuracoes', configuracoesRoutes)
app.use('/api/provedores', provedorRoutes)
app.use('/api/tipos-acesso', tipoAcessoRoutes)
app.use('/api/tipos-agente', tipoAgenteRoutes)
app.use('/api/agentes', agenteRoutes)
app.use('/api/historico-prompt', historicoPromptRoutes)
app.use('/api/revendedores', revendedorRoutes)
app.use('/api/clientes', clienteRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/usuarios-admin', usuarioAdminRoutes)
app.use('/api/evolution-api-v2', evolutionApiV2Routes)
app.use('/api/chat', chatRoutes)
app.use('/api/documentos', documentoRoutes)
app.use('/api/base', baseRoutes)
app.use('/api/origem-leads', origemLeadsRoutes)
app.use('/api/qualificacoes', qualificacaoRoutes)
app.use('/api/google-calendar', googleCalendarRoutes)
app.use('/api/perfis', perfilRoutes)
app.use('/api/convites', conviteRoutes)
app.use('/api/sessoes', sessaoRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/profiles', profileRoutes)
app.use('/api/leads', leadAtribuicaoRoutes) // Rotas de atribuição de leads
app.use('/api/vendedores', leadAtribuicaoRoutes) // Rota de dashboard de carga
app.use('/api/settings/notifications', notificationSettingsRoutes) // Configurações de notificação
app.use('/api/relatorios/distribuicao', distributionReportRoutes) // Relatórios de distribuição

app.use('/api/llm-config', llmConfigRoutes)
app.use('/api/prompt-config', promptConfigRoutes)
app.use('/api/followup', followupRoutes)
app.use('/api/prospecting', prospectingRoutes)
app.use('/api/linkedin', linkedinRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api-docs', cors(), swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    docExpansion: 'none', // Todas as seções fechadas por padrão
    tagsSorter: 'alpha', // Ordenar tags alfabeticamente
    operationsSorter: 'alpha' // Ordenar operações alfabeticamente
  }
}));

// Rota de health check
app.get('/health', (req, res) => {
  // Usar fuso horário do Brasil para timestamp (formato pt-BR)
  const agora = new Date()
  const brasilTime = agora.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })

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

    // Inicializar ProspectingScheduler (node-cron)
    await ProspectingScheduler.init()

    // Register follow-up event handlers
    EventQueueProcessor.registerHandler('ai_message_sent', (event) => FollowupService.handleAiMessageSent(event))
    EventQueueProcessor.registerHandler('lead_message_received', (event) => FollowupService.handleLeadMessageReceived(event))
    EventQueueProcessor.registerHandler('follow_up_send', (event) => FollowupService.handleFollowUpSend(event))
    EventQueueProcessor.registerHandler('follow_up_exhausted', (event) => FollowupService.handleFollowUpExhausted(event))
    EventQueueProcessor.registerHandler('lead_opted_out', (event) => FollowupService.handleLeadOptedOut(event))
    EventQueueProcessor.registerHandler('daily_limit_reached', (event) => FollowupService.handleDailyLimitReached(event))

    // Inicializar EventQueueProcessor
    await EventQueueProcessor.init()

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`)
      console.log(`🌍 Ambiente: ${process.env.NEXT_PUBLIC_NODE_ENV}`)
      console.log(`📚 Documentação disponível em ${BASE_URL}/api-docs`)
      console.log(`❤️ Health check em ${BASE_URL}/health`)
    })
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error)
    process.exit(1)
  }
}

// Inicializar servidor
startServer()

export default app