-- Migration: 006_create_followup
-- Description: Create followup table (without foreign key to leads initially)
-- Dependencies: 002_create_mensagens

CREATE TABLE IF NOT EXISTS followup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_mensagem uuid REFERENCES mensagens(id) NOT NULL,
  id_lead uuid, -- Will add foreign key constraint later
  status varchar(20) CHECK (status IN ('sucesso', 'erro')) NOT NULL,
  erro text,
  mensagem_enviada text NOT NULL,
  embedding vector(1536), -- campo para embedding da LLM
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);