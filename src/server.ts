// Carregar variáveis de ambiente PRIMEIRO
import dotenv from 'dotenv'
dotenv.config()

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
import configuracaoRoutes from './routes/configuracaoRoutes'
import mensagemRoutes from './routes/mensagemRoutes'
import followupRoutes from './routes/followupRoutes'
import configuracaoFollowupRoutes from './routes/configuracaoFollowupRoutes'
import provedorRoutes from './routes/provedorRoutes'
import tipoAcessoRoutes from './routes/tipoAcessoRoutes'
import revendedorRoutes from './routes/revendedorRoutes'
import clienteRoutes from './routes/clienteRoutes'
import usuarioRoutes from './routes/usuarioRoutes'
import evolutionInstancesRoutes from './routes/evolution-instances.routes'
import { errorHandler } from './middleware/errorHandler'
import { migrationRunner } from './lib/migrations'
import packageJson from '../package.json'

const app = express()
const PORT = process.env.PORT || 8080

// Detectar automaticamente a URL base
let BASE_URL = process.env.API_BASE_URL
if (!BASE_URL) {
  // Se não estiver explicitamente em desenvolvimento local, usar URL de produção
  const isLocalDev = process.env.NODE_ENV === 'development' || 
                     process.env.npm_lifecycle_event === 'dev'
  
  if (isLocalDev) {
    BASE_URL = `http://localhost:${PORT}`
  } else {
    BASE_URL = 'https://evolution-api-neosale-api.mrzt3w.easypanel.host'
  }
}

// Middleware de segurança
app.use(helmet())

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}))

// Logging
app.use(morgan('combined'))

// Parse JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

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
      configuracoes: `${BASE_URL}/api/configuracoes`,
      mensagens: `${BASE_URL}/api/mensagens`,
      followups: `${BASE_URL}/api/followups`,
      configuracoesFollowup: `${BASE_URL}/api/configuracoes-followup`,
      provedores: `${BASE_URL}/api/provedores`,
      tiposAcesso: `${BASE_URL}/api/tipos-acesso`,
      revendedores: `${BASE_URL}/api/revendedores`,
      clientes: `${BASE_URL}/api/clientes`,
      usuarios: `${BASE_URL}/api/usuarios`,
      evolutionInstances: `${BASE_URL}/api/evolution-instances`
    },
    description: 'API para gerenciamento de leads do sistema NeoSale'
  })
})

// Rotas
app.use('/api/leads', leadRoutes)
app.use('/api/controle-envios', controleEnviosRoutes)
app.use('/api/referencias', referenciaRoutes)
app.use('/api/configuracoes', configuracaoRoutes)
app.use('/api/mensagens', mensagemRoutes)
app.use('/api/followups', followupRoutes)
app.use('/api/configuracoes-followup', configuracaoFollowupRoutes)
app.use('/api/provedores', provedorRoutes)
app.use('/api/tipos-acesso', tipoAcessoRoutes)
app.use('/api/revendedores', revendedorRoutes)
app.use('/api/clientes', clienteRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/evolution-instances', evolutionInstancesRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

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
    console.log('🔄 Executando migrations...')
    await migrationRunner.runMigrations()
    await migrationRunner.markMigrationsAsExecuted()
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`)
      console.log(`📚 Documentação disponível em ${BASE_URL}/api-docs`)
      console.log(`❤️  Health check em ${BASE_URL}/health`)
    })
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error)
    process.exit(1)
  }
}

// Inicializar servidor
startServer()

export default app