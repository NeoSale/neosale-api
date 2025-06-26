# 📚 Exemplos de Uso da API

## 🚀 Testando a API

### 1. Primeiro, obtenha os IDs das origens disponíveis

Execute o script SQL no Supabase e anote os UUIDs gerados para as origens.

Ou consulte diretamente no banco:
```sql
SELECT * FROM origens_leads;
```

### 2. Exemplo Completo de Fluxo

#### Passo 1: Importar um lead

```bash
curl -X POST http://localhost:3000/api/leads/import \
  -H "Content-Type: application/json" \
  -d '{
    "leads": [{
      "nome": "João Silva",
      "telefone": "11999999999",
      "email": "joao.silva@email.com",
      "origem_id": "COLE_AQUI_O_UUID_DA_ORIGEM_INBOUND"
    }]
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "1 leads importados com sucesso",
  "data": [{
    "id": "uuid-do-lead-criado",
    "nome": "João Silva",
    "telefone": "11999999999",
    "email": "joao.silva@email.com",
    "origem_id": "uuid-origem",
    "status_agendamento": false,
    "mensagem_status_id": "uuid-mensagem-status",
    "created_at": "2024-01-15T10:00:00Z"
  }]
}
```

#### Passo 2: Agendar o lead

```bash
curl -X POST http://localhost:3000/api/leads/UUID_DO_LEAD/agendamento \
  -H "Content-Type: application/json" \
  -d '{
    "agendado_em": "2024-01-20T14:30:00Z"
  }'
```

#### Passo 3: Enviar primeira mensagem

```bash
curl -X POST http://localhost:3000/api/leads/UUID_DO_LEAD/mensagens \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_mensagem": "mensagem_1"
  }'
```

#### Passo 4: Atualizar etapa do funil

Primeiro, obtenha os UUIDs das etapas:
```sql
SELECT * FROM etapas_funil;
```

```bash
curl -X PATCH http://localhost:3000/api/leads/UUID_DO_LEAD/etapa \
  -H "Content-Type: application/json" \
  -d '{
    "etapa_funil_id": "UUID_DA_ETAPA_QUALIFICACAO"
  }'
```

#### Passo 5: Atualizar status de negociação

Obtenha os UUIDs dos status:
```sql
SELECT * FROM status_negociacao;
```

```bash
curl -X PATCH http://localhost:3000/api/leads/UUID_DO_LEAD/status \
  -H "Content-Type: application/json" \
  -d '{
    "status_negociacao_id": "UUID_DO_STATUS_EM_ANDAMENTO"
  }'
```

#### Passo 6: Consultar o lead atualizado

```bash
curl http://localhost:3000/api/leads/UUID_DO_LEAD
```

### 3. Testando com JavaScript/Fetch

```javascript
// Importar lead
const importarLead = async () => {
  const response = await fetch('/api/leads/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      leads: [{
        nome: 'Maria Santos',
        telefone: '11888888888',
        email: 'maria@email.com',
        origem_id: 'uuid-origem-outbound'
      }]
    })
  })
  
  const data = await response.json()
  console.log('Lead importado:', data)
  return data.data[0].id // Retorna o ID do lead criado
}

// Agendar lead
const agendarLead = async (leadId) => {
  const response = await fetch(`/api/leads/${leadId}/agendamento`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agendado_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Amanhã
    })
  })
  
  const data = await response.json()
  console.log('Lead agendado:', data)
}

// Enviar mensagem
const enviarMensagem = async (leadId, tipoMensagem) => {
  const response = await fetch(`/api/leads/${leadId}/mensagens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tipo_mensagem: tipoMensagem
    })
  })
  
  const data = await response.json()
  console.log('Mensagem enviada:', data)
}

// Exemplo de uso completo
const exemploCompleto = async () => {
  try {
    // 1. Importar lead
    const leadId = await importarLead()
    
    // 2. Agendar
    await agendarLead(leadId)
    
    // 3. Enviar mensagens em sequência
    await enviarMensagem(leadId, 'mensagem_1')
    
    // Aguardar um tempo antes da próxima mensagem
    setTimeout(async () => {
      await enviarMensagem(leadId, 'mensagem_2')
    }, 5000)
    
    console.log('Fluxo completo executado!')
  } catch (error) {
    console.error('Erro no fluxo:', error)
  }
}
```

### 4. Testando Validações

#### Email inválido:
```bash
curl -X POST http://localhost:3000/api/leads/import \
  -H "Content-Type: application/json" \
  -d '{
    "leads": [{
      "nome": "Teste",
      "telefone": "11999999999",
      "email": "email-invalido",
      "origem_id": "uuid-origem"
    }]
  }'
```

**Resposta esperada (400):**
```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": [{
    "code": "invalid_string",
    "validation": "email",
    "message": "Email inválido",
    "path": ["leads", 0, "email"]
  }]
}
```

#### UUID inválido:
```bash
curl -X POST http://localhost:3000/api/leads/import \
  -H "Content-Type: application/json" \
  -d '{
    "leads": [{
      "nome": "Teste",
      "telefone": "11999999999",
      "email": "teste@email.com",
      "origem_id": "uuid-invalido"
    }]
  }'
```

### 5. Monitoramento via Logs

Todos os endpoints geram logs no console do servidor. Observe a saída do terminal onde está rodando `npm run dev` para acompanhar:

```
🔄 Iniciando importação de leads: 1 leads
✅ Lead criado com sucesso: uuid-do-lead
✅ Importação concluída: 1 leads criados
🔄 Agendando lead: uuid-do-lead
✅ Lead agendado com sucesso: uuid-do-lead
🔄 Enviando mensagem para lead: uuid-do-lead tipo: mensagem_1
✅ Mensagem enviada com sucesso: mensagem_1
```

### 6. Endpoints de Informação (GET)

Todos os endpoints POST/PATCH têm uma versão GET que retorna informações sobre como usar:

```bash
# Informações sobre importação
curl http://localhost:3000/api/leads/import

# Informações sobre agendamento
curl http://localhost:3000/api/leads/qualquer-id/agendamento

# Informações sobre mensagens
curl http://localhost:3000/api/leads/qualquer-id/mensagens

# Informações sobre etapa
curl http://localhost:3000/api/leads/qualquer-id/etapa

# Informações sobre status
curl http://localhost:3000/api/leads/qualquer-id/status
```