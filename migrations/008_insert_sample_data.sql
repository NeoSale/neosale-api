-- Migration: 008_insert_sample_data
-- Description: Insert sample data for leads and followup tables
-- Dependencies: 007_create_leads

-- Insert sample leads data
INSERT INTO leads (nome, telefone, email, empresa, cargo, origem_id, status_agendamento, mensagem_id, etapa_funil_id, status_negociacao_id, created_at) VALUES
  ('João Silva', '(11) 99999-1234', 'joao.silva@email.com', 'TechCorp', 'Desenvolvedor', (SELECT id FROM origens_leads WHERE nome = 'inbound'), true, (SELECT id FROM mensagens LIMIT 1 OFFSET 0), (SELECT id FROM etapas_funil WHERE nome = 'reuniao'), (SELECT id FROM status_negociacao WHERE nome = 'em_andamento'), '2024-01-15 08:30:00'),
  ('Maria Santos', '(11) 98888-5678', 'maria.santos@empresa.com', 'InnovaTech', 'Gerente de TI', (SELECT id FROM origens_leads WHERE nome = 'outbound'), false, (SELECT id FROM mensagens LIMIT 1 OFFSET 1), (SELECT id FROM etapas_funil WHERE nome = 'qualificacao'), (SELECT id FROM status_negociacao WHERE nome = 'em_aberto'), '2024-01-16 10:15:00'),
  ('Pedro Oliveira', '(11) 97777-9012', 'pedro.oliveira@gmail.com', 'StartupXYZ', 'CTO', (SELECT id FROM origens_leads WHERE nome = 'inbound'), false, (SELECT id FROM mensagens LIMIT 1 OFFSET 2), (SELECT id FROM etapas_funil WHERE nome = 'lead'), (SELECT id FROM status_negociacao WHERE nome = 'em_aberto'), '2024-01-17 14:20:00'),
  ('Ana Costa', '(11) 96666-3456', 'ana.costa@hotmail.com', 'DigitalSoft', 'Analista de Sistemas', (SELECT id FROM origens_leads WHERE nome = 'inbound'), true, (SELECT id FROM mensagens LIMIT 1 OFFSET 3), (SELECT id FROM etapas_funil WHERE nome = 'apresentacao'), (SELECT id FROM status_negociacao WHERE nome = 'em_andamento'), '2024-01-18 09:45:00'),
  ('Carlos Ferreira', '(11) 95555-7890', 'carlos.ferreira@yahoo.com', 'CloudTech', 'Diretor de Tecnologia', (SELECT id FROM origens_leads WHERE nome = 'outbound'), false, (SELECT id FROM mensagens LIMIT 1 OFFSET 4), (SELECT id FROM etapas_funil WHERE nome = 'negociacao'), (SELECT id FROM status_negociacao WHERE nome = 'em_andamento'), '2024-01-19 16:30:00'),
  ('Lucia Rodrigues', '(11) 94444-2345', 'lucia.rodrigues@outlook.com', 'DataCorp', 'Cientista de Dados', (SELECT id FROM origens_leads WHERE nome = 'inbound'), false, null, (SELECT id FROM etapas_funil WHERE nome = 'lead'), (SELECT id FROM status_negociacao WHERE nome = 'em_aberto'), '2024-01-20 11:10:00'),
  ('Roberto Lima', '(11) 93333-6789', 'roberto.lima@empresa.com.br', 'SoftwarePlus', 'Arquiteto de Software', (SELECT id FROM origens_leads WHERE nome = 'outbound'), true, (SELECT id FROM mensagens LIMIT 1 OFFSET 0), (SELECT id FROM etapas_funil WHERE nome = 'reuniao'), (SELECT id FROM status_negociacao WHERE nome = 'em_andamento'), '2024-01-21 13:25:00'),
  ('Fernanda Alves', '(11) 92222-0123', 'fernanda.alves@gmail.com', 'WebSolutions', 'Product Manager', (SELECT id FROM origens_leads WHERE nome = 'inbound'), false, (SELECT id FROM mensagens LIMIT 1 OFFSET 1), (SELECT id FROM etapas_funil WHERE nome = 'qualificacao'), (SELECT id FROM status_negociacao WHERE nome = 'em_aberto'), '2024-01-22 15:40:00'),
  ('Marcos Pereira', '(11) 91111-4567', 'marcos.pereira@hotmail.com', 'TechVision', 'CEO', (SELECT id FROM origens_leads WHERE nome = 'inbound'), true, (SELECT id FROM mensagens LIMIT 1 OFFSET 2), (SELECT id FROM etapas_funil WHERE nome = 'fechamento'), (SELECT id FROM status_negociacao WHERE nome = 'fechado'), '2024-01-23 08:15:00'),
  ('Juliana Souza', '(11) 90000-8901', 'juliana.souza@yahoo.com.br', 'DevOps Inc', 'Engenheira DevOps', (SELECT id FROM origens_leads WHERE nome = 'outbound'), false, null, (SELECT id FROM etapas_funil WHERE nome = 'lead'), (SELECT id FROM status_negociacao WHERE nome = 'perdido'), '2024-01-24 12:50:00')
ON CONFLICT (email) DO NOTHING;

-- Insert sample followup data
INSERT INTO followup (id_mensagem, id_lead, status, erro, mensagem_enviada) VALUES
  ((SELECT id FROM mensagens WHERE nome = 'Primeira Abordagem'), (SELECT id FROM leads WHERE nome = 'João Silva'), 'sucesso', null, 'Olá! Obrigado pelo seu interesse em nossos serviços. Gostaria de agendar uma conversa?'),
  ((SELECT id FROM mensagens WHERE nome = 'Follow-up 2h'), (SELECT id FROM leads WHERE nome = 'Maria Santos'), 'sucesso', null, 'Ainda tem interesse em conhecer nossa solução? Estamos aqui para ajudar!'),
  ((SELECT id FROM mensagens WHERE nome = 'Última Tentativa'), (SELECT id FROM leads WHERE nome = 'Pedro Oliveira'), 'erro', 'Número de telefone inválido', 'Esta é nossa última tentativa de contato. Caso tenha interesse, entre em contato conosco.'),
  ((SELECT id FROM mensagens WHERE nome = 'Follow-up Qualificados'), (SELECT id FROM leads WHERE nome = 'Ana Costa'), 'sucesso', null, 'Mensagem de follow-up personalizada para leads qualificados.'),
  ((SELECT id FROM mensagens WHERE nome = 'Reengajamento'), (SELECT id FROM leads WHERE nome = 'Carlos Ferreira'), 'sucesso', null, 'Mensagem de reengajamento para leads inativos.'),
  ((SELECT id FROM mensagens WHERE nome = 'Primeira Abordagem'), (SELECT id FROM leads WHERE nome = 'Lucia Rodrigues'), 'erro', 'Falha na conexão com WhatsApp', 'Olá! Obrigado pelo seu interesse em nossos serviços. Gostaria de agendar uma conversa?'),
  ((SELECT id FROM mensagens WHERE nome = 'Follow-up 2h'), (SELECT id FROM leads WHERE nome = 'Roberto Lima'), 'sucesso', null, 'Ainda tem interesse em conhecer nossa solução? Estamos aqui para ajudar!'),
  ((SELECT id FROM mensagens WHERE nome = 'Última Tentativa'), (SELECT id FROM leads WHERE nome = 'Fernanda Alves'), 'sucesso', null, 'Esta é nossa última tentativa de contato. Caso tenha interesse, entre em contato conosco.'),
  ((SELECT id FROM mensagens WHERE nome = 'Follow-up Qualificados'), (SELECT id FROM leads WHERE nome = 'Marcos Pereira'), 'sucesso', null, 'Mensagem de follow-up personalizada para leads qualificados.'),
  ((SELECT id FROM mensagens WHERE nome = 'Reengajamento'), (SELECT id FROM leads WHERE nome = 'Juliana Souza'), 'erro', 'Usuário bloqueou mensagens', 'Mensagem de reengajamento para leads inativos.')
ON CONFLICT DO NOTHING;

-- Update leads with followup_id after inserting followups
UPDATE leads SET followup_id = (
  SELECT id FROM followup WHERE id_lead = leads.id LIMIT 1
) WHERE followup_id IS NULL;