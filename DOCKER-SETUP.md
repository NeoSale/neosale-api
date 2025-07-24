# Configuração Automática do Docker

Este projeto agora inclui scripts para verificar e iniciar o Docker automaticamente quando necessário.

## 🚀 Scripts Disponíveis

### Verificação Rápida
```bash
# Verifica se Docker está instalado e rodando
npm run docker:check
```

### Inicialização Automática
```bash
# Inicia Docker Desktop (Windows)
npm run docker:start

# Inicialização multiplataforma (experimental)
npm run docker:auto
```

### Desenvolvimento com Docker Automático
```bash
# Inicia desenvolvimento garantindo que Docker está rodando
npm run dev:docker

# Inicia produção garantindo que Docker está rodando
npm run start:docker

# Executa migrações garantindo que Docker está rodando
npm run migrate:docker
```

## 📋 Como Funciona

### 1. Verificação (`docker:check`)
- ✅ Verifica se Docker está instalado
- ✅ Verifica se o daemon está rodando
- ❌ **NÃO** tenta iniciar automaticamente
- 💡 Fornece instruções se houver problemas

### 2. Inicialização (`docker:start`)
- 🔍 Detecta instalação do Docker Desktop
- 🚀 Inicia Docker Desktop se necessário
- ⏳ Aguarda até ficar disponível (60s timeout)
- ✅ Confirma que está pronto para uso

### 3. Scripts com Auto-Start
- 🔄 Executam `docker:start` automaticamente
- ▶️ Prosseguem com o comando original
- 🛡️ Garantem que Docker está disponível

## 🎯 Cenários de Uso

### Cenário 1: Docker Já Rodando
```bash
$ npm run docker:check
🐳 Verificando se Docker está disponível...
✅ Docker está instalado: Docker version 24.0.7
✅ Docker daemon está rodando
```

### Cenário 2: Docker Parado
```bash
$ npm run docker:check
🐳 Verificando se Docker está disponível...
✅ Docker está instalado: Docker version 24.0.7
❌ Docker daemon não está rodando
🚀 Para iniciar o Docker:
   • Windows: Execute "npm run docker:start"
   • Ou abra o Docker Desktop manualmente
```

### Cenário 3: Docker Não Instalado
```bash
$ npm run docker:check
🐳 Verificando se Docker está disponível...
❌ Docker não está instalado ou não está no PATH
📥 Instale o Docker Desktop: https://www.docker.com/products/docker-desktop
```

### Cenário 4: Inicialização Automática
```bash
$ npm run docker:start
Docker Status Check
Docker Desktop encontrado em: C:\Program Files\Docker\Docker\Docker Desktop.exe
Iniciando Docker Desktop...
Docker Desktop foi iniciado
Aguardando Docker ficar disponivel...
Tentativa 1/30
Docker esta pronto!
Docker esta pronto para uso!
```

## 🛠️ Arquivos Criados

### Scripts
- `scripts/check-docker.js` - Verificação simples (Node.js)
- `scripts/start-docker.js` - Inicialização multiplataforma (Node.js)
- `scripts/start-docker.ps1` - Inicialização robusta (PowerShell/Windows)
- `scripts/README.md` - Documentação detalhada dos scripts

### Configuração
- `package.json` - Novos scripts NPM adicionados
- `DOCKER-SETUP.md` - Este arquivo de documentação

## 🔧 Personalização

### Ajustar Timeouts
Edite os scripts para modificar tempos de espera:

```javascript
// Em check-docker.js ou start-docker.js
const maxAttempts = 30;  // Máximo de tentativas
const interval = 2000;   // Intervalo entre tentativas (ms)
```

```powershell
# Em start-docker.ps1
$MaxAttempts = 30        # Máximo de tentativas
$IntervalSeconds = 2     # Intervalo entre tentativas
```

### Adicionar Novos Comandos
Para criar novos comandos que garantem Docker rodando:

```json
{
  "scripts": {
    "meu-comando:docker": "npm run docker:start && meu-comando-original"
  }
}
```

## 🚨 Troubleshooting

### Problema: Scripts não funcionam
**Soluções:**
1. Verifique se Node.js está instalado
2. Execute `npm install` para garantir dependências
3. Verifique permissões de execução

### Problema: PowerShell bloqueado
**Solução:**
```powershell
# Execute como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problema: Docker não inicia
**Soluções:**
1. Reinicie o computador
2. Execute como Administrador
3. Verifique se há atualizações do Docker
4. Reinstale o Docker Desktop

### Problema: Timeout ao aguardar
**Soluções:**
1. Aguarde mais tempo (sistemas lentos)
2. Aumente o timeout nos scripts
3. Reinicie o Docker manualmente
4. Verifique logs do Docker Desktop

## 📚 Comandos de Referência

```bash
# Verificação
npm run docker:check          # Verifica status
npm run docker:start          # Inicia Docker (PowerShell)
npm run docker:auto           # Inicia Docker (Node.js)

# Desenvolvimento
npm run dev                   # Normal (sem verificação)
npm run dev:docker            # Com verificação automática

# Produção
npm start                     # Normal (sem verificação)
npm run start:docker          # Com verificação automática

# Migrações
npm run migrate               # Normal (sem verificação)
npm run migrate:docker        # Com verificação automática
```

## ✅ Próximos Passos

1. **Teste os scripts** em diferentes cenários
2. **Personalize timeouts** conforme necessário
3. **Adicione verificações** a outros comandos que precisam do Docker
4. **Documente** qualquer configuração específica do seu ambiente

---

**💡 Dica:** Use sempre os comandos `:docker` para desenvolvimento para garantir que o Docker esteja disponível automaticamente!