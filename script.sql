create table origens_leads (
  id uuid primary key default gen_random_uuid(),
  nome text unique
);

insert into origens_leads (id, nome) values
  (gen_random_uuid(), 'inbound'),
  (gen_random_uuid(), 'outbound');

create table mensagens (
  id uuid primary key default gen_random_uuid(),
  nome text,
  intervalo_numero integer not null, -- quantidade de tempo
  intervalo_tipo text not null check (intervalo_tipo in ('minutos', 'horas', 'dias')),
  texto_mensagem text not null,
  embedding vector(1536), -- campo para embedding da LLM
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table etapas_funil (
  id uuid primary key default gen_random_uuid(),
  nome text unique
);

insert into etapas_funil (id, nome) values
  (gen_random_uuid(), 'lead'),
  (gen_random_uuid(), 'qualificacao'),
  (gen_random_uuid(), 'reuniao'),
  (gen_random_uuid(), 'apresentacao'),
  (gen_random_uuid(), 'negociacao'),
  (gen_random_uuid(), 'fechamento');

create table status_negociacao (
  id uuid primary key default gen_random_uuid(),
  nome text unique
);

insert into status_negociacao (id, nome) values
  (gen_random_uuid(), 'em_aberto'),
  (gen_random_uuid(), 'em_andamento'),
  (gen_random_uuid(), 'perdido'),
  (gen_random_uuid(), 'fechado');

create table qualificacao (
  id uuid primary key default gen_random_uuid(),
  nome text unique
);

insert into qualificacao (nome) values
  ('Desafios'),
  ('Urgência'),
  ('Decisor');

create table leads (
  id uuid primary key default gen_random_uuid(),
  nome text,
  telefone text,
  email text,
  empresa text,
  cargo text,
  contador text,
  escritorio text,
  responsavel text,
  cnpj text,
  observacao text,
  segmento text,
  erp_atual text,
  origem_id uuid references origens_leads(id),
  status_agendamento boolean default false,
  mensagem_id uuid references mensagens(id),
  etapa_funil_id uuid references etapas_funil(id),
  status_negociacao_id uuid references status_negociacao(id),
  qualificacao_id uuid references qualificacao(id),
  followup_id uuid references followup(id),
  deletado boolean DEFAULT false,
  created_at timestamp default now()
);

create table followup (
  id uuid primary key default gen_random_uuid(),
  id_mensagem uuid references mensagens(id) not null,
  id_lead uuid references leads(id) not null,
  status varchar(20) check (status in ('sucesso', 'erro')) not null,
  erro text,
  mensagem_enviada text not null,
  embedding vector(1536), -- campo para embedding da LLM
  created_at timestamp default now(), 
  updated_at timestamp default now()
);

-- Inserir dados de exemplo para a tabela de mensagens
insert into mensagens (nome, intervalo_numero, intervalo_tipo, texto_mensagem) values
  ('Primeira Abordagem', 30, 'minutos', 'Olá! Obrigado pelo seu interesse em nossos serviços. Gostaria de agendar uma conversa?'),
  ('Follow-up 2h', 2, 'horas', 'Ainda tem interesse em conhecer nossa solução? Estamos aqui para ajudar!'),
  ('Última Tentativa', 1, 'dias', 'Esta é nossa última tentativa de contato. Caso tenha interesse, entre em contato conosco.'),
  ('Follow-up Qualificados', 15, 'minutos', 'Mensagem de follow-up personalizada para leads qualificados.'),
  ('Reengajamento', 4, 'horas', 'Mensagem de reengajamento para leads inativos.');

-- Inserir dados de exemplo para a tabela followup
insert into followup (id_mensagem, id_lead, status, erro, mensagem_enviada) values
  ((select id from mensagens where nome = 'Primeira Abordagem'), (select id from leads where nome = 'João Silva'), 'sucesso', null, 'Olá! Obrigado pelo seu interesse em nossos serviços. Gostaria de agendar uma conversa?'),
  ((select id from mensagens where nome = 'Follow-up 2h'), (select id from leads where nome = 'Maria Santos'), 'sucesso', null, 'Ainda tem interesse em conhecer nossa solução? Estamos aqui para ajudar!'),
  ((select id from mensagens where nome = 'Última Tentativa'), (select id from leads where nome = 'Pedro Oliveira'), 'erro', 'Número de telefone inválido', 'Esta é nossa última tentativa de contato. Caso tenha interesse, entre em contato conosco.'),
  ((select id from mensagens where nome = 'Follow-up Qualificados'), (select id from leads where nome = 'Ana Costa'), 'sucesso', null, 'Mensagem de follow-up personalizada para leads qualificados.'),
  ((select id from mensagens where nome = 'Reengajamento'), (select id from leads where nome = 'Carlos Ferreira'), 'sucesso', null, 'Mensagem de reengajamento para leads inativos.'),
  ((select id from mensagens where nome = 'Primeira Abordagem'), (select id from leads where nome = 'Lucia Rodrigues'), 'erro', 'Falha na conexão com WhatsApp', 'Olá! Obrigado pelo seu interesse em nossos serviços. Gostaria de agendar uma conversa?'),
  ((select id from mensagens where nome = 'Follow-up 2h'), (select id from leads where nome = 'Roberto Lima'), 'sucesso', null, 'Ainda tem interesse em conhecer nossa solução? Estamos aqui para ajudar!'),
  ((select id from mensagens where nome = 'Última Tentativa'), (select id from leads where nome = 'Fernanda Alves'), 'sucesso', null, 'Esta é nossa última tentativa de contato. Caso tenha interesse, entre em contato conosco.'),
  ((select id from mensagens where nome = 'Follow-up Qualificados'), (select id from leads where nome = 'Marcos Pereira'), 'sucesso', null, 'Mensagem de follow-up personalizada para leads qualificados.'),
  ((select id from mensagens where nome = 'Reengajamento'), (select id from leads where nome = 'Juliana Souza'), 'erro', 'Usuário bloqueou mensagens', 'Mensagem de reengajamento para leads inativos.');

insert into leads (nome, telefone, email, empresa, cargo, origem_id, status_agendamento, mensagem_id, etapa_funil_id, status_negociacao_id, created_at) values
  ('João Silva', '(11) 99999-1234', 'joao.silva@email.com', 'TechCorp', 'Desenvolvedor', (select id from origens_leads where nome = 'inbound'), true, (select id from mensagens limit 1 offset 0), (select id from etapas_funil where nome = 'reuniao'), (select id from status_negociacao where nome = 'em_andamento'), '2024-01-15 08:30:00'),
  ('Maria Santos', '(11) 98888-5678', 'maria.santos@empresa.com', 'InnovaTech', 'Gerente de TI', (select id from origens_leads where nome = 'outbound'), false, (select id from mensagens limit 1 offset 1), (select id from etapas_funil where nome = 'qualificacao'), (select id from status_negociacao where nome = 'em_aberto'), '2024-01-16 10:15:00'),
  ('Pedro Oliveira', '(11) 97777-9012', 'pedro.oliveira@gmail.com', 'StartupXYZ', 'CTO', (select id from origens_leads where nome = 'inbound'), false, (select id from mensagens limit 1 offset 2), (select id from etapas_funil where nome = 'lead'), (select id from status_negociacao where nome = 'em_aberto'), '2024-01-17 14:20:00'),
  ('Ana Costa', '(11) 96666-3456', 'ana.costa@hotmail.com', 'DigitalSoft', 'Analista de Sistemas', (select id from origens_leads where nome = 'inbound'), true, (select id from mensagens limit 1 offset 3), (select id from etapas_funil where nome = 'apresentacao'), (select id from status_negociacao where nome = 'em_andamento'), '2024-01-18 09:45:00'),
  ('Carlos Ferreira', '(11) 95555-7890', 'carlos.ferreira@yahoo.com', 'CloudTech', 'Diretor de Tecnologia', (select id from origens_leads where nome = 'outbound'), false, (select id from mensagens limit 1 offset 4), (select id from etapas_funil where nome = 'negociacao'), (select id from status_negociacao where nome = 'em_andamento'), '2024-01-19 16:30:00'),
  ('Lucia Rodrigues', '(11) 94444-2345', 'lucia.rodrigues@outlook.com', 'DataCorp', 'Cientista de Dados', (select id from origens_leads where nome = 'inbound'), false, null, (select id from etapas_funil where nome = 'lead'), (select id from status_negociacao where nome = 'em_aberto'), '2024-01-20 11:10:00'),
  ('Roberto Lima', '(11) 93333-6789', 'roberto.lima@empresa.com.br', 'SoftwarePlus', 'Arquiteto de Software', (select id from origens_leads where nome = 'outbound'), true, (select id from mensagens limit 1 offset 0), (select id from etapas_funil where nome = 'reuniao'), (select id from status_negociacao where nome = 'em_andamento'), '2024-01-21 13:25:00'),
  ('Fernanda Alves', '(11) 92222-0123', 'fernanda.alves@gmail.com', 'WebSolutions', 'Product Manager', (select id from origens_leads where nome = 'inbound'), false, (select id from mensagens limit 1 offset 1), (select id from etapas_funil where nome = 'qualificacao'), (select id from status_negociacao where nome = 'em_aberto'), '2024-01-22 15:40:00'),
  ('Marcos Pereira', '(11) 91111-4567', 'marcos.pereira@hotmail.com', 'TechVision', 'CEO', (select id from origens_leads where nome = 'inbound'), true, (select id from mensagens limit 1 offset 2), (select id from etapas_funil where nome = 'fechamento'), (select id from status_negociacao where nome = 'fechado'), '2024-01-23 08:15:00'),
  ('Juliana Souza', '(11) 90000-8901', 'juliana.souza@yahoo.com.br', 'DevOps Inc', 'Engenheira DevOps', (select id from origens_leads where nome = 'outbound'), false, null, (select id from etapas_funil where nome = 'lead'), (select id from status_negociacao where nome = 'perdido'), '2024-01-24 12:50:00');

-- Atualizar leads com followup_id após inserir os followups
update leads set followup_id = (select id from followup where id_lead = leads.id limit 1);

create table controle_envios_diarios (
  id uuid primary key default gen_random_uuid(),
  data date not null unique, -- uma linha por dia
  quantidade_enviada integer default 0,
  limite_diario integer not null,
  created_at timestamp default now()
);

create table configuracoes (
  id uuid primary key default gen_random_uuid(),
  chave text,
  valor text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Inserir configuração padrão
insert into configuracoes (chave, valor) values ('horario_inicio', '08:00:00');
insert into configuracoes (chave, valor) values ('horario_fim', '18:00:00');
insert into configuracoes (chave, valor) values ('quantidade_diaria_maxima', '30');
insert into configuracoes (chave, valor) values ('envia_somente_dias_uteis', 'true');


