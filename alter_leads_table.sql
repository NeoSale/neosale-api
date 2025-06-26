-- Script para adicionar os campos empresa e cargo à tabela leads
-- Execute este script no seu banco de dados para atualizar a estrutura da tabela

ALTER TABLE leads 
ADD COLUMN empresa text,
ADD COLUMN cargo text;

-- Comentários:
-- empresa: Campo para armazenar o nome da empresa do lead
-- cargo: Campo para armazenar o cargo/posição do lead na empresa
-- Ambos os campos são opcionais (podem ser NULL)