# Scripts do Docker

Este diretório contém scripts para automatizar o gerenciamento do Docker no projeto.

## Scripts Disponíveis

### 1. `start-docker.js`
Script Node.js multiplataforma que verifica e inicia o Docker automaticamente.

**Uso:**
```bash
node scripts/start-docker.js
```

**Características:**
- ✅ Funciona em Windows, macOS e Linux
- ✅ Verifica se Docker já está rodando
- ✅ Inicia Docker automaticamente se necessário
- ✅ Aguarda Docker ficar disponível
- ✅ Fornece instruções manuais em caso de erro

### 2. `start-docker.ps1`
Script PowerShell específico para Windows com funcionalidades avançadas.

**Uso:**
```powershell
.\scripts\start-docker.ps1
```

**Características:**
- ✅ Detecta automaticamente a instalação do Docker Desktop
- ✅ Inicia Docker Desktop em background
- ✅ Aguarda com timeout configurável
- ✅ Mensagens coloridas e informativas
- ✅ Tratamento robusto de erros

## Scripts NPM Integrados

O `package.json` foi atualizado com novos scripts que automaticamente verificam e iniciam o Docker:

### Scripts com Docker Automático

```bash
# Desenvolvimento com Docker automático
npm run dev:docker

# Produção com Docker automático
npm run start:docker

# Migrações com Docker automático
npm run migrate:docker
```

### Scripts de Verificação

```bash
# Apenas verifica/inicia Docker (Node.js)
npm run docker:check

# Apenas verifica/inicia Docker (PowerShell)
npm run docker:start
```

### Scripts Originais (sem verificação Docker)

```bash
# Scripts originais continuam funcionando
npm run dev
npm start
npm run migrate
```

## Como Funciona

1. **Verificação**: Os scripts primeiro verificam se o Docker está rodando usando `docker info`
2. **Detecção**: Se não estiver rodando, detectam o sistema operacional
3. **Inicialização**: Executam o comando apropriado para iniciar o Docker:
   - **Windows**: Inicia Docker Desktop
   - **macOS**: Abre Docker Desktop
   - **Linux**: Inicia serviço systemctl
4. **Aguardo**: Aguardam o Docker ficar disponível (até 60 segundos)
5. **Confirmação**: Confirmam que o Docker está pronto para uso

## Tratamento de Erros

Em caso de falha, os scripts fornecem:
- ❌ Mensagem de erro clara
- 📋 Instruções manuais específicas do SO
- 🔗 Links para download/instalação
- 💡 Dicas de troubleshooting

## Requisitos

- **Node.js** (para `start-docker.js`)
- **PowerShell** (para `start-docker.ps1` no Windows)
- **Docker Desktop** instalado no sistema

## Exemplos de Uso

### Cenário 1: Desenvolvimento Normal
```bash
# Inicia desenvolvimento com verificação automática do Docker
npm run dev:docker
```

### Cenário 2: Docker Parado
```bash
# Se Docker não estiver rodando, será iniciado automaticamente
npm run docker:check
# Saída: 🚀 Tentando iniciar o Docker...
# Saída: ✅ Docker está pronto!
```

### Cenário 3: Docker Já Rodando
```bash
npm run docker:check
# Saída: 🎯 Docker já está rodando!
```

### Cenário 4: Erro de Instalação
```bash
npm run docker:start
# Saída: ❌ Docker Desktop não foi encontrado!
# Saída: 📥 Por favor, instale o Docker Desktop:
# Saída:    https://www.docker.com/products/docker-desktop
```

## Troubleshooting

### Problema: "Comando não encontrado"
**Solução**: Verifique se Node.js está instalado e no PATH

### Problema: "Permissão negada" (Linux)
**Solução**: Execute com sudo ou adicione usuário ao grupo docker

### Problema: "Docker Desktop não inicia"
**Soluções**:
1. Reinicie o computador
2. Execute como Administrador
3. Verifique se há atualizações do Docker
4. Reinstale o Docker Desktop

### Problema: "Timeout ao aguardar Docker"
**Soluções**:
1. Aguarde mais tempo (Docker pode demorar em sistemas lentos)
2. Reinicie o Docker manualmente
3. Verifique logs do Docker Desktop

## Personalização

Você pode ajustar os timeouts e intervalos editando as constantes nos scripts:

```javascript
// Em start-docker.js
const maxAttempts = 30;  // Máximo de tentativas
const interval = 2000;   // Intervalo entre tentativas (ms)
```

```powershell
# Em start-docker.ps1
$MaxAttempts = 30        # Máximo de tentativas
$IntervalSeconds = 2     # Intervalo entre tentativas (segundos)
```