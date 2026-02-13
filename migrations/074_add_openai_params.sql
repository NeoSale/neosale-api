-- Migration 074: Add OpenAI parameters to parametros table
-- Used by LlmConfigService.getOrDefault() as first fallback when no llm_config exists for a client

INSERT INTO parametros (chave, valor)
VALUES ('apikey_openai', '')
ON CONFLICT (chave) DO NOTHING;

INSERT INTO parametros (chave, valor)
VALUES ('modelo_openai', 'gpt-4.1-mini')
ON CONFLICT (chave) DO NOTHING;
    