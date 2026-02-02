# 🛠️ Setup - NeoSale API

## Pré-requisitos

- Node.js 20+
- npm 10+
- PostgreSQL 14+ (ou Supabase)
- Git

## Instalação

```bash
npm install
```

## Configurar Environment

Crie `.env` na raiz:

```env
# Database (Supabase)
DATABASE_URL=postgresql://user:password@host:5432/neosale
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-service-role

# Auth
JWT_SECRET=sua-senha-secreta-minimo-32-caracteres
JWT_EXPIRY=24h

# OpenAI
OPENAI_API_KEY=sk-proj-sua-chave

# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-chave

# Server
PORT=3000
NODE_ENV=development
```

**Supabase Credentials:**
1. https://app.supabase.com
2. Project Settings → API
3. Copy URL + SERVICE_ROLE_KEY (not ANON_KEY)

## Rodar Migrations

```bash
npm run migrate
```

Cria/atualiza schema do banco de dados.

## Iniciar Servidor

```bash
npm run dev
```

- API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api-docs
- Health: http://localhost:3000/api/health

## Troubleshooting

### Database connection error
```bash
# Verificar variáveis
cat .env | grep DATABASE_URL

# Testar conexão
psql $DATABASE_URL
```

### Port already in use
```bash
PORT=3001 npm run dev
```

### TypeScript errors
```bash
npx tsc --noEmit
```

---

Veja [ENVIRONMENT.md](ENVIRONMENT.md) para variáveis completas.
