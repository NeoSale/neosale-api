-- Migration: 014_create_evolution_instances_table
-- Description: Create table to store Evolution API instances information linked to clients
-- Dependencies: 013_create_user_management_tables

-- Create evolution_instances table
CREATE TABLE IF NOT EXISTS evolution_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  instance_name varchar(255) NOT NULL UNIQUE,
  instance_id varchar(255),
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
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_evolution_instances_cliente ON evolution_instances(cliente_id);
CREATE INDEX IF NOT EXISTS idx_evolution_instances_name ON evolution_instances(instance_name);
CREATE INDEX IF NOT EXISTS idx_evolution_instances_status ON evolution_instances(status);
CREATE INDEX IF NOT EXISTS idx_evolution_instances_connected ON evolution_instances(is_connected);
CREATE INDEX IF NOT EXISTS idx_evolution_instances_phone ON evolution_instances(phone_number);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_evolution_instances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_evolution_instances_updated_at
    BEFORE UPDATE ON evolution_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_evolution_instances_updated_at();