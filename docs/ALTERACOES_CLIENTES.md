# Alterações na Tabela Clientes

## Resumo
Este documento descreve as alterações realizadas na tabela `clientes` para incluir novos campos conforme solicitado.

## Novos Campos Adicionados

### 1. Informações do Responsável
- **nome_responsavel_principal** (varchar(255)): Nome do responsável principal da empresa

### 2. Documentação
- **cnpj** (varchar(18)): CNPJ da empresa

### 3. Endereço Completo
- **cep** (varchar(10)): Código postal
- **logradouro** (varchar(255)): Nome da rua/avenida
- **numero** (varchar(20)): Número do endereço
- **complemento** (varchar(100)): Complemento (sala, andar, etc.)
- **cidade** (varchar(100)): Cidade
- **estado** (varchar(50)): Estado/UF
- **pais** (varchar(50)): País (padrão: 'Brasil')

### 4. Características da Empresa
- **espaco_fisico** (boolean): Indica se a empresa possui espaço físico (padrão: false)
- **site_oficial** (varchar(255)): URL do site oficial

### 5. Dados Estruturados (JSON)
- **redes_sociais** (jsonb): Links das redes sociais no formato chave-valor
- **horario_funcionamento** (jsonb): Horários de funcionamento por dia da semana

### 6. Área de Atuação
- **regioes_atendidas** (text): Descrição das regiões/cidades atendidas

## Arquivos Alterados

### 1. Migração: `migrations/004_create_clientes.sql`
- Migração de criação da tabela clientes atualizada para incluir todos os novos campos
- Inclui criação de índices para melhor performance
- Adiciona comentários para documentar campos JSON

### 2. Validadores
- **src/lib/validators.ts**: Atualização dos schemas `createClienteSchema` e `updateClienteSchema`

## Estrutura dos Campos JSON

### Redes Sociais
```json
{
  "facebook": "https://facebook.com/empresa",
  "instagram": "https://instagram.com/empresa",
  "linkedin": "https://linkedin.com/company/empresa",
  "twitter": "https://twitter.com/empresa"
}
```

### Horário de Funcionamento
```json
{
  "segunda": "08:00-18:00",
  "terca": "08:00-18:00",
  "quarta": "08:00-18:00",
  "quinta": "08:00-18:00",
  "sexta": "08:00-18:00",
  "sabado": "08:00-12:00",
  "domingo": "fechado"
}
```

## Índices Criados

Para otimizar consultas, foram criados os seguintes índices:
- `idx_clientes_cnpj`: Para busca por CNPJ
- `idx_clientes_cep`: Para busca por CEP
- `idx_clientes_cidade`: Para busca por cidade
- `idx_clientes_estado`: Para busca por estado
- `idx_clientes_espaco_fisico`: Para filtrar por espaço físico

## Validações

### Campos Obrigatórios
Todos os novos campos são **opcionais**, mantendo a compatibilidade com registros existentes.

### Validações Específicas
- **redes_sociais**: URLs devem ser válidas
- **cnpj**: Máximo 18 caracteres
- **cep**: Máximo 10 caracteres
- **espaco_fisico**: Valor booleano (padrão: false)
- **pais**: Padrão 'Brasil'

## Exemplo de Uso

### Criação de Cliente
```javascript
const novoCliente = {
  nome: 'Empresa Exemplo LTDA',
  email: 'contato@exemplo.com',
  telefone: '11999999999',
  revendedor_id: 'uuid-do-revendedor',
  // Novos campos
  nome_responsavel_principal: 'João Silva',
  cnpj: '12.345.678/0001-90',
  cep: '01234-567',
  logradouro: 'Rua das Flores',
  numero: '123',
  cidade: 'São Paulo',
  estado: 'SP',
  espaco_fisico: true,
  site_oficial: 'https://www.exemplo.com',
  redes_sociais: {
    facebook: 'https://facebook.com/exemplo',
    instagram: 'https://instagram.com/exemplo'
  },
  horario_funcionamento: {
    segunda: '08:00-18:00',
    terca: '08:00-18:00',
    // ...
  },
  regioes_atendidas: 'São Paulo, ABC, Interior'
};
```

## Status
✅ Migration executada com sucesso  
✅ Validadores atualizados  
✅ Testes de validação aprovados  
✅ Índices criados  

## Como Aplicar as Alterações

1. Para novos bancos de dados, execute a migração:
```bash
npm run migrate
```

2. A migração `004_create_clientes.sql` já inclui todos os campos necessários

3. Para bancos existentes que já possuem a tabela clientes, use o script manual:
```bash
# Execute o script SQL diretamente no banco
scripts/alter_clientes_table.sql
```

## Data da Alteração