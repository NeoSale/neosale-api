# 🎯 Teste Final - NeoSale API no EasyPanel

## 🌐 **Seu Domínio Identificado:**

```
https://evolution-api-neosale-api.mrzt3w.easypanel.host
```

## 🧪 **Testes com URLs Reais**

### 1️⃣ **Health Check**
```bash
curl https://evolution-api-neosale-api.mrzt3w.easypanel.host/health
```

**Resposta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2025-06-26T...",
  "uptime": "..."
}
```

### 2️⃣ **Documentação da API (Swagger)**
Acesse no navegador:
```
https://evolution-api-neosale-api.mrzt3w.easypanel.host/api-docs
```

### 3️⃣ **Criar um Lead (POST)**
```bash
curl -X POST https://evolution-api-neosale-api.mrzt3w.easypanel.host/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "phone": "11999999999",
    "message": "Teste da API em produção"
  }'
```

**Resposta esperada:**
```json
{
  "id": "uuid-gerado",
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "phone": "11999999999",
  "message": "Teste da API em produção",
  "created_at": "2025-06-26T...",
  "updated_at": "2025-06-26T..."
}
```

### 4️⃣ **Listar Leads (GET)**
```bash
curl https://evolution-api-neosale-api.mrzt3w.easypanel.host/api/leads
```

**Resposta esperada:**
```json
[
  {
    "id": "uuid-1",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "phone": "11999999999",
    "message": "Teste da API em produção",
    "created_at": "2025-06-26T...",
    "updated_at": "2025-06-26T..."
  }
]
```

### 5️⃣ **Buscar Lead por ID (GET)**
```bash
# Substitua {id} pelo ID real retornado no POST
curl https://evolution-api-neosale-api.mrzt3w.easypanel.host/api/leads/{id}
```

### 6️⃣ **Atualizar Lead (PUT)**
```bash
# Substitua {id} pelo ID real
curl -X PUT https://evolution-api-neosale-api.mrzt3w.easypanel.host/api/leads/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva Atualizado",
    "email": "joao.novo@exemplo.com",
    "phone": "11888888888",
    "message": "Lead atualizado via API"
  }'
```

### 7️⃣ **Deletar Lead (DELETE)**
```bash
# Substitua {id} pelo ID real
curl -X DELETE https://evolution-api-neosale-api.mrzt3w.easypanel.host/api/leads/{id}
```

## 🔍 **Verificação de Status**

### ✅ **Se tudo funcionar:**
- ✅ Health check retorna status 200
- ✅ API docs carrega no navegador
- ✅ POST cria leads no Supabase
- ✅ GET lista leads corretamente
- ✅ PUT/DELETE funcionam

### ❌ **Se houver problemas:**

#### **"Service is not reachable"**
**Possíveis causas:**
1. Container parou de funcionar
2. Erro nas variáveis de ambiente
3. Problema de conectividade

**Soluções:**
1. Verifique logs no EasyPanel
2. Reinicie a aplicação
3. Confirme variáveis de ambiente

#### **Erro 500 (Internal Server Error)**
**Possíveis causas:**
1. Problema com Supabase
2. Erro na aplicação

**Soluções:**
1. Verifique logs detalhados
2. Confirme credenciais do Supabase
3. Teste conexão com banco

#### **Erro 404 (Not Found)**
**Possíveis causas:**
1. Rota incorreta
2. Aplicação não iniciou corretamente

**Soluções:**
1. Confirme se usou `/api/leads` (não `/leads`)
2. Teste health check primeiro

## 🎯 **Teste Completo em Sequência**

```bash
# Defina a URL base
API_URL="https://evolution-api-neosale-api.mrzt3w.easypanel.host"

# 1. Health check
echo "=== HEALTH CHECK ==="
curl $API_URL/health
echo "\n"

# 2. Criar lead
echo "=== CRIAR LEAD ==="
LEAD_RESPONSE=$(curl -s -X POST $API_URL/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste API",
    "email": "teste@exemplo.com",
    "phone": "11999999999",
    "message": "Teste completo da API"
  }')
echo $LEAD_RESPONSE
echo "\n"

# 3. Listar leads
echo "=== LISTAR LEADS ==="
curl $API_URL/api/leads
echo "\n"

# 4. Documentação (abrir no navegador)
echo "=== DOCUMENTAÇÃO ==="
echo "Acesse: $API_URL/api-docs"
```

## 📊 **Monitoramento Contínuo**

### 🔄 **Health Check Automático**
```bash
# Verificação a cada 30 segundos
while true; do
  echo "$(date): Verificando API..."
  curl -s https://evolution-api-neosale-api.mrzt3w.easypanel.host/health | jq '.status'
  sleep 30
done
```

### 📈 **Métricas no EasyPanel**
- **CPU Usage:** Deve estar baixo (<50%)
- **Memory Usage:** Deve estar estável
- **Network:** Tráfego de entrada/saída
- **Logs:** Sem erros críticos

## 🎊 **Resultado Final**

**Sua NeoSale API está rodando em:**
```
🌐 Base URL: https://evolution-api-neosale-api.mrzt3w.easypanel.host
📚 Docs: https://evolution-api-neosale-api.mrzt3w.easypanel.host/api-docs
❤️ Health: https://evolution-api-neosale-api.mrzt3w.easypanel.host/health
🔗 Leads: https://evolution-api-neosale-api.mrzt3w.easypanel.host/api/leads
```

## 🚀 **Próximos Passos**

1. **Teste todas as funcionalidades** acima
2. **Integre com seu frontend** usando a URL base
3. **Configure monitoramento** se necessário
4. **Documente** para sua equipe
5. **Backup** das configurações

---

**💡 Sua API está pronta para uso em produção!** 🎯