# Deploy Automático - NeoSale API

## Configuração do Deploy Automático no EasyPanel

O script `build-and-push.sh` foi atualizado para incluir deploy automático no EasyPanel após o push bem-sucedido para o Docker Hub.

### Pré-requisitos

1. **Token do EasyPanel**: Você precisa de um token de API do EasyPanel
2. **Variável de ambiente**: Configure a variável `EASYPANEL_TOKEN`

### Como configurar

#### 1. Obter o Token do EasyPanel

1. Acesse seu painel do EasyPanel
2. Vá para as configurações de API
3. Gere um novo token de acesso
4. Copie o token gerado

#### 2. Configurar a Variável de Ambiente

**No Windows (PowerShell):**
```powershell
$env:EASYPANEL_TOKEN="seu_token_aqui"
```

**No Windows (CMD):**
```cmd
set EASYPANEL_TOKEN=seu_token_aqui
```

**No Linux/macOS:**
```bash
export EASYPANEL_TOKEN="seu_token_aqui"
```

#### 3. Para tornar permanente (opcional)

**Windows:**
- Adicione a variável nas variáveis de ambiente do sistema
- Ou adicione no seu perfil do PowerShell

**Linux/macOS:**
```bash
echo 'export EASYPANEL_TOKEN="seu_token_aqui"' >> ~/.bashrc
source ~/.bashrc
```

### Como usar

1. Execute o script normalmente:
   ```bash
   ./build-and-push.sh
   ```

2. O script irá:
   - Fazer build da imagem Docker
   - Fazer push para o Docker Hub
   - **Automaticamente fazer deploy no EasyPanel** (se o token estiver configurado)

### Configurações do EasyPanel

As seguintes configurações estão definidas no script:

- **URL do EasyPanel**: `https://evolution-api-neosale-api.mrzt3w.easypanel.host`
- **Projeto**: `neosale-api`

Se precisar alterar essas configurações, edite as variáveis no arquivo `build-and-push.sh`:

```bash
EASYPANEL_URL="sua_url_do_easypanel"
EASYPANEL_PROJECT="seu_projeto"
```

### Troubleshooting

#### Deploy automático não funciona

1. **Verifique se o token está configurado:**
   ```bash
   echo $EASYPANEL_TOKEN
   ```

2. **Verifique se a URL do EasyPanel está correta**

3. **Verifique se o token tem as permissões necessárias**

#### Deploy manual

Se o deploy automático falhar, você pode fazer o deploy manual:

1. Acesse o painel do EasyPanel
2. Vá para o projeto `neosale-api`
3. Atualize a imagem para a nova versão
4. Faça o deploy manual

### Logs

O script fornece logs detalhados durante o processo:

- ✅ **Verde**: Operações bem-sucedidas
- ⚠️ **Amarelo**: Avisos e informações
- ❌ **Vermelho**: Erros

### Exemplo de Execução

```bash
🚀 Iniciando build da imagem Docker do NeoSale API
📦 Fazendo build da imagem...
✅ Build concluído com sucesso!
🏷️ Criando tags para o Docker Hub...
✅ Tags criadas: 0.1.6 e latest
📤 Enviando imagem versionada para o Docker Hub...
✅ Versão 0.1.6 enviada com sucesso!
📤 Enviando tag latest para o Docker Hub...
🎉 Imagens enviadas com sucesso para o Docker Hub!
📋 Versões disponíveis:
   - brunobspaiva/neosale-api:0.1.6
   - brunobspaiva/neosale-api:latest
🚀 Para executar: docker run -p 3000:3000 brunobspaiva/neosale-api:0.1.6
🚀 Iniciando deploy automático no EasyPanel...
📡 Fazendo deploy da versão 0.1.6 no EasyPanel...
✅ Deploy iniciado com sucesso no EasyPanel!
🌐 URL: https://evolution-api-neosale-api.mrzt3w.easypanel.host
📦 Versão deployada: 0.1.6
✨ Processo concluído!
```