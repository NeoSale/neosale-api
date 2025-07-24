-- Migration: 000_create_migrations_table
-- Description: Create migrations control table to track executed migrations
-- Dependencies: none

CREATE TABLE IF NOT EXISTS migrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL UNIQUE,
  executed_at timestamp DEFAULT now()
);

-- Create index on filename for better performance
CREATE INDEX IF NOT EXISTS idx_migrations_filename ON migrations(filename);