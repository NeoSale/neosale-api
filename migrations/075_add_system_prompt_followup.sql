-- Migration 075: Add system_prompt_followup parameter
-- Template prompt used by composeFollowUpSystemPrompt with variable substitution

INSERT INTO parametros (chave, valor)
VALUES ('system_prompt_followup', 'Adapte o [template] abaixo a cada envio com o primeiro nome do lead [nome] e continuando a conversa anterior e personalize com as instruções do [contextPrompt]. Depois retorne somente o texto da [template]

[hoje] - {hoje}
[data] - {data}
[hora] - {hora}
[dia_semana] - {dia_semana}
[nome] - {nome}
[telefone] - {telefone}
[contextPrompt] - {contextPrompt}
[template] - {template}')
ON CONFLICT (chave) DO NOTHING;
