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
import { errorHandler } from './middleware/errorHandler'
import packageJson from '../package.json'

const app = express()
const PORT = process.env.PORT || 3000

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
      configuracoes: `${BASE_URL}/api/configuracoes`
    },
    description: 'API para gerenciamento de leads do sistema NeoSale'
  })
})

// Rotas
app.use('/api/leads', leadRoutes)
app.use('/api/controle-envios', controleEnviosRoutes)
app.use('/api/referencias', referenciaRoutes)
app.use('/api/configuracoes', configuracaoRoutes)
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📚 Documentação disponível em ${BASE_URL}/api-docs`)
  console.log(`❤️  Health check em ${BASE_URL}/health`)
})

export default app