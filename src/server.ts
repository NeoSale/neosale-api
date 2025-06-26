// Carregar variáveis de ambiente PRIMEIRO
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import { leadRoutes } from './routes/leadRoutes'
import { errorHandler } from './middleware/errorHandler'

const app = express()
const PORT = process.env.PORT || 3000

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

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NeoSale API',
      version: '1.0.0',
      description: 'API para gerenciamento de leads do NeoSale'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desenvolvimento'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

// Rota raiz com informações da API
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bem-vindo à NeoSale API! 🚀',
    version: '1.0.0',
    endpoints: {
      documentation: `http://localhost:${PORT}/api-docs`,
      health: `http://localhost:${PORT}/health`,
      leads: `http://localhost:${PORT}/api/leads`
    },
    description: 'API para gerenciamento de leads do sistema NeoSale'
  })
})

// Rotas
app.use('/api/leads', leadRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
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
  console.log(`📚 Documentação disponível em http://localhost:${PORT}/api-docs`)
  console.log(`❤️  Health check em http://localhost:${PORT}/health`)
})

export default app