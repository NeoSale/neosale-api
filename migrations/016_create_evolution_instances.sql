-- Migration: 016_create_evolution_instances
-- Description: Create evolution_instances table
-- Dependencies: 004_create_clientes

CREATE TABLE IF NOT EXISTS evolution_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  instance_name varchar(255) NOT NULL UNIQUE,
  status varchar(50) NOT NULL DEFAULT 'disconnected',
  qr_code text,
  webhook_url varchar(500),
  phone_number varchar(20),
  profile_name varchar(255),
  profile_picture_url varchar(500),
  is_connected boolean NOT NULL DEFAULT false,
  last_connection timestamp,
  api_key varchar(255),
  settings jsonb DEFAULT '{}',
  always_online boolean DEFAULT false,
  groups_ignore boolean DEFAULT false,
  msg_call boolean DEFAULT false,
  read_messages boolean DEFAULT false,
  read_status boolean DEFAULT false,
  reject_call boolean DEFAULT false,
  sync_full_history boolean DEFAULT false,
  embedding vector(1536), -- campo para embedding da LLM
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_evolution_instances_cliente_id ON evolution_instances(cliente_id);
CREATE INDEX IF NOT EXISTS idx_evolution_instances_instance_name ON evolution_instances(instance_name);
CREATE INDEX IF NOT EXISTS idx_evolution_instances_status ON evolution_instances(status);
CREATE INDEX IF NOT EXISTS idx_evolution_instances_is_connected ON evolution_instances(is_connected);
CREATE INDEX IF NOT EXISTS idx_evolution_instances_phone_number ON evolution_instances(phone_number);
CREATE INDEX IF NOT EXISTS idx_evolution_instances_always_online ON evolution_instances(always_online);
CREATE INDEX IF NOT EXISTS idx_evolution_instances_read_messages ON evolution_instances(read_messages);
CREATE INDEX IF NOT EXISTS idx_evolution_instances_embedding ON evolution_instances USING ivfflat (embedding vector_cosine_ops);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_evolution_instances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_evolution_instances_updated_at
  BEFORE UPDATE ON evolution_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_evolution_instances_updated_at();