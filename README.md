# 🔌 NeoSale API

Backend REST API com Express.js + TypeScript. Gerencia leads, chats, documentos e integração com agentes IA e Evolution API (WhatsApp).

**Versão:** 1.0.0 | **Status:** Ativo | **Stack:** Express + TypeScript + PostgreSQL (Supabase)

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 20+
- npm 10+
- PostgreSQL (via Supabase) ou local

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Servidor rodando em `http://localhost:3000`
Swagger API Docs: `http://localhost:3000/api-docs`

### Build & Produção

```bash
npm run build
npm start
```

## 📋 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia com nodemon (watch mode) |
| `npm run build` | Compila TypeScript → dist/ |
| `npm start` | Executa código compilado |
| `npm run lint` | ESLint check |
| `npm run migrate` | Executa migrations no banco |
| `npm run migrate:docker` | Migrations em Docker |
| `npm run deploy` | Deploy automático (Docker) |

## 📁 Estrutura do Projeto

```
src/
├── server.ts              # Entry point principal
├── controllers/           # 20+ request handlers
├── services/              # 20+ business logic
├── routes/                # 25+ route definitions
├── middleware/            # Auth, error handling
├── models/                # Database models
├── migrations/            # SQL migrations
├── lib/                   # Utilities, Swagger config
└── types/                 # TypeScript interfaces
```

## 🎯 Principais Endpoints

### Leads
```bash
GET    /api/leads                    # Listar leads
POST   /api/leads                    # Criar lead
PUT    /api/leads/:id                # Atualizar lead
DELETE /api/leads/:id                # Deletar lead
POST   /api/leads/import              # Importar em bulk
GET    /api/leads/search              # Buscar leads
```

### Chat & Mensagens
```bash
GET    /api/chat/sessions             # Listar conversas
POST   /api/chat/messages              # Enviar mensagem
GET    /api/chat/messages/:sessionId   # Histórico
```

### Documentos
```bash
POST   /api/documentos/search          # Busca semântica
POST   /api/documentos/upload          # Upload de arquivo
```

### Agentes IA
```bash
GET    /api/agentes                    # Listar agentes
PATCH  /api/agentes/:id                # Configurar agente
POST   /api/agentes/:id/test            # Testar agente
```

Veja [docs/API.md](docs/API.md) para referência completa.

## 🔧 Configuração

### Environment Variables

Crie `.env` na raiz:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/neosale
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-service-role

# Auth
JWT_SECRET=sua-chave-super-secreta-aqui-min-32-chars
JWT_EXPIRY=24h

# OpenAI (Embeddings para busca semântica)
OPENAI_API_KEY=sk-proj-...

# Evolution API (WhatsApp)
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-chave

# Server
PORT=3000
NODE_ENV=development
```

Veja [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) para completo.

### Database Migrations

```bash
# Rodar migrations
npm run migrate

# Verificar status
npm run migrate:status
```

## 📚 Documentação

- [SETUP.md](docs/SETUP.md) - Setup detalhado
- [ENVIRONMENT.md](docs/ENVIRONMENT.md) - Variáveis de ambiente
- [API.md](docs/API.md) - Referência de endpoints
- [DATABASE.md](docs/DATABASE.md) - Schema e queries

## 🚢 Deployment

### Docker

```bash
npm run deploy              # Auto-detecta versão
npm run deploy:patch        # Force patch
npm run deploy:minor        # Force minor
npm run deploy:major        # Force major
```

Processo:
1. Build Docker image
2. Push para Docker Hub
3. Git commit + tag
4. Deploy em EasyPanel (opcional)

Veja [../../DEPLOYMENT.md](../../neosale-docs/DEPLOYMENT.md) para detalhes.

## 📦 Dependências Principais

- **express:** Web framework
- **typescript:** Type-safe JavaScript
- **@supabase/supabase-js:** Database + Auth
- **openai:** AI embeddings
- **jsonwebtoken:** JWT authentication
- **zod:** Validation
- **swagger:** API documentation
- **nodemon:** Dev server

## 🤝 Contribuindo

```bash
# 1. Crie branch
git checkout -b feature/sua-feature

# 2. Develop
npm run dev

# 3. Lint
npm run lint

# 4. Commit
git commit -m 'feat: descrição'

# 5. Push & PR
git push origin feature/sua-feature
```

## 📊 Monitoramento

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Logs
```bash
# Em desenvolvimento
npm run dev  # Mostra logs de console

# Em produção
docker logs <container-id>
```

### Performance
```bash
# Check response times
curl -w "Time: %{time_total}s\n" http://localhost:3000/api/leads
```

## 🐛 Troubleshooting

### "Database connection error"
```bash
# Verifique DATABASE_URL em .env
# Verifique se Postgres está rodando
```

### "OpenAI API error"
```bash
# Verifique OPENAI_API_KEY em .env
# Verifique saldo da conta OpenAI
```

### "Port 3000 already in use"
```bash
# Use PORT alternativa
PORT=3001 npm run dev
```

## 🔐 Segurança

- ✅ JWT authentication em todos endpoints privados
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Input validation com Zod
- ✅ SQL injection protection (Supabase)
- ✅ LGPD compliance para dados pessoais

## 📝 Licença

MIT

## 📞 Suporte

- **Issues:** GitHub Issues
- **Email:** dev@neosale.io
- **API Docs:** http://localhost:3000/api-docs (Swagger)

---

**Mantido por:** Equipe NeoSale
**Última atualização:** Fevereiro 2026
