-- =====================================================
-- Migration 052: LinkedIn API Configuration (per-client)
-- =====================================================

CREATE TABLE IF NOT EXISTS linkedin_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL,

  -- OAuth 2.0 App Credentials
  client_id VARCHAR(255) NOT NULL,
  client_secret VARCHAR(500) NOT NULL,
  redirect_uri VARCHAR(500) NOT NULL,
  scopes VARCHAR(500) DEFAULT 'r_liteprofile r_emailaddress w_member_social',

  -- OAuth 2.0 Tokens (populated after authorization)
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ,

  -- LinkedIn User Info (populated after first auth)
  linkedin_user_id VARCHAR(255),
  linkedin_user_name VARCHAR(255),

  -- Prospecting Settings
  daily_search_limit INTEGER DEFAULT 25,
  daily_invite_limit INTEGER DEFAULT 25,
  search_keywords JSONB DEFAULT '[]',
  target_industries JSONB DEFAULT '[]',
  target_locations JSONB DEFAULT '[]',

  -- Status
  ativo BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT uq_linkedin_config_cliente UNIQUE (cliente_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_linkedin_config_cliente ON linkedin_config(cliente_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_config_ativo ON linkedin_config(ativo) WHERE ativo = true;

-- Trigger para auto-update de updated_at
CREATE TRIGGER trg_linkedin_config_timestamps
BEFORE UPDATE ON linkedin_config
FOR EACH ROW EXECUTE FUNCTION update_prospect_timestamps();
