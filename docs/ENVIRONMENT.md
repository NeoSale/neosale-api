# 🔐 Variáveis de Ambiente - NeoSale API

## `.env` (Desenvolvimento & Produção)

```env
# ==================== DATABASE ====================
DATABASE_URL=postgresql://user:password@localhost:5432/neosale
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # SERVICE_ROLE_KEY

# ==================== JWT ====================
JWT_SECRET=sua-chave-super-secreta-minimo-32-caracteres
JWT_EXPIRY=24h

# ==================== OPENAI ====================
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini

# ==================== EVOLUTION API (WHATSAPP) ====================
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-chave-api

# ==================== SERVER ====================
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# ==================== CORS ====================
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:5000

# ==================== RATE LIMITING ====================
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# ==================== EMAIL (OPCIONAL) ====================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
```

## Credenciais por Ambiente

### Desenvolvimento

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/neosale_dev
NODE_ENV=development
```

### Produção

```env
DATABASE_URL=postgresql://user:secure-pass@prod-db-host:5432/neosale
NODE_ENV=production
```

## Como Obter Credenciais

### Supabase
1. Acesse https://app.supabase.com
2. Selecione projeto
3. Settings → API
4. Copie:
   - `Project URL` → SUPABASE_URL
   - `service_role` secret → SUPABASE_KEY

### OpenAI
1. https://platform.openai.com/api-keys
2. Create new secret key
3. Copie como OPENAI_API_KEY

### Evolution API
1. Documentação: https://evolution-api.com
2. Obtenha API Key no painel
3. Configure EVOLUTION_API_URL (seu servidor)

## Segurança

- ✅ Nunca commitar `.env` (use `.env.example`)
- ✅ JWT_SECRET mínimo 32 caracteres
- ✅ DATABASE_URL nunca em repositório
- ✅ Usar gestor de senhas (1Password, LastPass)
- ✅ Diferentes credenciais por ambiente

## `.env.example` (Versionado)

```env
# Exemplo (não contém valores reais)
DATABASE_URL=postgresql://user:password@localhost:5432/neosale
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-service-role
JWT_SECRET=sua-chave-secreta-minimo-32-chars
OPENAI_API_KEY=sk-proj-...
PORT=3000
NODE_ENV=development
```

---

Veja [SETUP.md](SETUP.md) para setup completo.
