-- Migration 077: Add Anthropic parameters to parametros table
-- Used by LlmConfigService.getOrDefault() as second fallback when no llm_config exists for a client

INSERT INTO parametros (chave, valor)
VALUES ('apikey_anthropic', '')
ON CONFLICT (chave) DO NOTHING;

INSERT INTO parametros (chave, valor)
VALUES ('modelo_anthropic', 'claude-sonnet-4-5-20250929')
ON CONFLICT (chave) DO NOTHING;
