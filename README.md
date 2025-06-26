# NeoSale API - Express

API REST para gerenciamento de leads do sistema NeoSale, construída com Express.js e TypeScript.

## 🚀 Tecnologias

- **Express.js** - Framework web para Node.js
- **TypeScript** - Superset tipado do JavaScript
- **Supabase** - Backend as a Service (BaaS)
- **Zod** - Validação de schemas
- **Swagger** - Documentação da API
- **Helmet** - Middleware de segurança
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - Logger HTTP

## 📁 Estrutura do Projeto

```
src/
├── controllers/     # Controladores da aplicação
├── services/        # Lógica de negócio
├── routes/          # Definição das rotas
├── middleware/      # Middlewares customizados
├── lib/            # Utilitários e configurações
├── types/          # Definições de tipos TypeScript
└── server.ts       # Arquivo principal do servidor
```

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd neosale-api
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
FRONTEND_URL=http://localhost:3001
PORT=3000
```

## 🚀 Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 📚 Documentação da API

Após iniciar o servidor, a documentação Swagger estará disponível em:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## 🛣️ Endpoints Principais

### Leads
- `GET /api/leads` - Lista todos os leads
- `GET /api/leads/paginated` - Lista leads com paginação
- `POST /api/leads/import` - Importa leads
- `GET /api/leads/import/info` - Informações de importação
- `POST /api/leads/:id/agendar` - Agenda um lead
- `POST /api/leads/:id/mensagem` - Envia mensagem
- `PUT /api/leads/:id/etapa` - Atualiza etapa do funil
- `PUT /api/leads/:id/status` - Atualiza status de negociação

### Parâmetros de Paginação

- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10, máximo: 100)
- `search` (opcional): Termo de busca para nome, email ou telefone

**Exemplo:**
```
GET /api/leads/paginated?page=2&limit=20&search=joão
```

## 🔒 Segurança

- **Helmet**: Configuração de headers de segurança
- **CORS**: Controle de acesso entre origens
- **Validação**: Schemas Zod para validação de entrada
- **Variáveis de ambiente**: Configuração segura de credenciais

## 🗄️ Banco de Dados

O projeto utiliza Supabase como backend, com as seguintes tabelas principais:

- `leads` - Informações dos leads
- `mensagem_status` - Status das mensagens
- `origem` - Origem dos leads
- `etapa_funil` - Etapas do funil de vendas
- `status_negociacao` - Status de negociação

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila o TypeScript para JavaScript
- `npm start` - Inicia o servidor em modo produção
- `npm run lint` - Executa o linter

## 📝 Logs

O sistema utiliza Morgan para logging HTTP e console.log para logs customizados com emojis para melhor visualização:

- 🔄 Operações em andamento
- ✅ Operações bem-sucedidas
- ❌ Erros
- 📋 Listagens
- 🚀 Inicialização do servidor

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
