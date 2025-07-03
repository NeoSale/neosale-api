create table origens_leads (
  id uuid primary key default gen_random_uuid(),
  nome text unique
);

insert into origens_leads (id, nome) values
  (gen_random_uuid(), 'inbound'),
  (gen_random_uuid(), 'outbound');

create table mensagem_status (
  id uuid primary key default gen_random_uuid(),
  mensagem_1_enviada boolean default false,
  mensagem_1_data timestamp,
  mensagem_2_enviada boolean default false,
  mensagem_2_data timestamp,
  mensagem_3_enviada boolean default false,
  mensagem_3_data timestamp
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
  mensagem_status_id uuid references mensagem_status(id),
  etapa_funil_id uuid references etapas_funil(id),
  status_negociacao_id uuid references status_negociacao(id),
  qualificacao_id uuid references qualificacao(id),
  deletado boolean DEFAULT false,
  created_at timestamp default now()
);

-- Inserir dados fake para popular a tabela de leads
insert into mensagem_status (mensagem_1_enviada, mensagem_1_data, mensagem_2_enviada, mensagem_2_data, mensagem_3_enviada, mensagem_3_data) values
  (true, '2024-01-15 10:30:00', false, null, false, null),
  (true, '2024-01-16 14:20:00', true, '2024-01-17 09:15:00', false, null),
  (false, null, false, null, false, null),
  (true, '2024-01-18 16:45:00', true, '2024-01-19 11:30:00', true, '2024-01-20 08:20:00'),
  (true, '2024-01-20 13:10:00', false, null, false, null),
  (false, null, false, null, false, null),
  (true, '2024-01-21 15:25:00', true, '2024-01-22 10:40:00', false, null),
  (true, '2024-01-22 12:15:00', false, null, false, null),
  (true, '2024-01-23 09:30:00', true, '2024-01-24 14:20:00', true, '2024-01-25 11:10:00'),
  (false, null, false, null, false, null);

insert into leads (nome, telefone, email, empresa, cargo, origem_id, status_agendamento, mensagem_status_id, etapa_funil_id, status_negociacao_id, created_at) values
  ('João Silva', '(11) 99999-1234', 'joao.silva@email.com', 'TechCorp', 'Desenvolvedor', (select id from origens_leads where nome = 'inbound'), true, (select id from mensagem_status limit 1 offset 0), (select id from etapas_funil where nome = 'reuniao'), (select id from status_negociacao where nome = 'em_andamento'), '2024-01-15 08:30:00'),
  ('Maria Santos', '(11) 98888-5678', 'maria.santos@empresa.com', 'InnovaTech', 'Gerente de TI', (select id from origens_leads where nome = 'outbound'), false, (select id from mensagem_status limit 1 offset 1), (select id from etapas_funil where nome = 'qualificacao'), (select id from status_negociacao where nome = 'em_aberto'), '2024-01-16 10:15:00'),
  ('Pedro Oliveira', '(11) 97777-9012', 'pedro.oliveira@gmail.com', 'StartupXYZ', 'CTO', (select id from origens_leads where nome = 'inbound'), false, (select id from mensagem_status limit 1 offset 2), (select id from etapas_funil where nome = 'lead'), (select id from status_negociacao where nome = 'em_aberto'), '2024-01-17 14:20:00'),
  ('Ana Costa', '(11) 96666-3456', 'ana.costa@hotmail.com', 'DigitalSoft', 'Analista de Sistemas', (select id from origens_leads where nome = 'inbound'), true, (select id from mensagem_status limit 1 offset 3), (select id from etapas_funil where nome = 'apresentacao'), (select id from status_negociacao where nome = 'em_andamento'), '2024-01-18 09:45:00'),
  ('Carlos Ferreira', '(11) 95555-7890', 'carlos.ferreira@yahoo.com', 'CloudTech', 'Diretor de Tecnologia', (select id from origens_leads where nome = 'outbound'), false, (select id from mensagem_status limit 1 offset 4), (select id from etapas_funil where nome = 'negociacao'), (select id from status_negociacao where nome = 'em_andamento'), '2024-01-19 16:30:00'),
  ('Lucia Rodrigues', '(11) 94444-2345', 'lucia.rodrigues@outlook.com', 'DataCorp', 'Cientista de Dados', (select id from origens_leads where nome = 'inbound'), false, (select id from mensagem_status limit 1 offset 5), (select id from etapas_funil where nome = 'lead'), (select id from status_negociacao where nome = 'em_aberto'), '2024-01-20 11:10:00'),
  ('Roberto Lima', '(11) 93333-6789', 'roberto.lima@empresa.com.br', 'SoftwarePlus', 'Arquiteto de Software', (select id from origens_leads where nome = 'outbound'), true, (select id from mensagem_status limit 1 offset 6), (select id from etapas_funil where nome = 'reuniao'), (select id from status_negociacao where nome = 'em_andamento'), '2024-01-21 13:25:00'),
  ('Fernanda Alves', '(11) 92222-0123', 'fernanda.alves@gmail.com', 'WebSolutions', 'Product Manager', (select id from origens_leads where nome = 'inbound'), false, (select id from mensagem_status limit 1 offset 7), (select id from etapas_funil where nome = 'qualificacao'), (select id from status_negociacao where nome = 'em_aberto'), '2024-01-22 15:40:00'),
  ('Marcos Pereira', '(11) 91111-4567', 'marcos.pereira@hotmail.com', 'TechVision', 'CEO', (select id from origens_leads where nome = 'inbound'), true, (select id from mensagem_status limit 1 offset 8), (select id from etapas_funil where nome = 'fechamento'), (select id from status_negociacao where nome = 'fechado'), '2024-01-23 08:15:00'),
  ('Juliana Souza', '(11) 90000-8901', 'juliana.souza@yahoo.com.br', 'DevOps Inc', 'Engenheira DevOps', (select id from origens_leads where nome = 'outbound'), false, (select id from mensagem_status limit 1 offset 9), (select id from etapas_funil where nome = 'lead'), (select id from status_negociacao where nome = 'perdido'), '2024-01-24 12:50:00');

create table controle_envios_diarios (
  id uuid primary key default gen_random_uuid(),
  data date not null unique, -- uma linha por dia
  quantidade_enviada integer default 0,
  limite_diario integer not null,
  created_at timestamp default now()
);
