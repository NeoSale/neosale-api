// Utilitário para geração de embeddings para LLM
// Este arquivo contém funções para converter dados em vetores para consulta da LLM

import { createHash } from 'crypto'

/**
 * Interface para dados que podem ser convertidos em embedding
 */
export interface EmbeddableData {
  [key: string]: any
}

/**
 * Gera um embedding simulado baseado no conteúdo dos dados
 * Em produção, isso seria substituído por uma chamada para uma API de embedding real (OpenAI, etc.)
 * 
 * @param data - Dados para gerar o embedding
 * @returns Array de números representando o embedding (1536 dimensões)
 */
export function generateEmbedding(data: EmbeddableData): number[] {
  // Converte os dados em uma string JSON normalizada
  const normalizedData = normalizeDataForEmbedding(data)
  
  // Gera um hash dos dados para criar um embedding determinístico
  const hash = createHash('sha256').update(normalizedData).digest('hex')
  
  // Converte o hash em um array de números (simulando um embedding real)
  const embedding: number[] = []
  
  // Gera 1536 números (dimensão padrão do OpenAI text-embedding-ada-002)
  for (let i = 0; i < 1536; i++) {
    // Usa diferentes partes do hash para gerar números pseudo-aleatórios
    const hashIndex = (i * 2) % hash.length
    const hexPair = hash.substr(hashIndex, 2)
    const value = parseInt(hexPair, 16) / 255 // Normaliza entre 0 e 1
    embedding.push(value)
  }
  
  return embedding
}

/**
 * Normaliza os dados para geração consistente de embedding
 * Remove campos irrelevantes e ordena as chaves
 * 
 * @param data - Dados para normalizar
 * @returns String normalizada dos dados
 */
function normalizeDataForEmbedding(data: EmbeddableData): string {
  // Remove campos que não devem influenciar o embedding
  const excludeFields = ['id', 'created_at', 'updated_at', 'embedding']
  
  const cleanData: EmbeddableData = {}
  
  Object.keys(data)
    .filter(key => !excludeFields.includes(key) && data[key] !== null && data[key] !== undefined)
    .sort() // Ordena as chaves para consistência
    .forEach(key => {
      if (typeof data[key] === 'string') {
        // Normaliza strings: remove espaços extras, converte para lowercase
        cleanData[key] = data[key].trim().toLowerCase()
      } else {
        cleanData[key] = data[key]
      }
    })
  
  return JSON.stringify(cleanData)
}

/**
 * Gera embedding para um lead
 * Combina informações relevantes do lead em um embedding
 */
export function generateLeadEmbedding(lead: any): number[] {
  const leadData = {
    nome: lead.nome,
    telefone: lead.telefone,
    email: lead.email,
    empresa: lead.empresa,
    cargo: lead.cargo,
    segmento: lead.segmento,
    erp_atual: lead.erp_atual,
    observacao: lead.observacao
  }
  
  return generateEmbedding(leadData)
}

/**
 * Gera embedding para uma mensagem
 * Foca no conteúdo da mensagem e configurações
 */
export function generateMensagemEmbedding(mensagem: any): number[] {
  const mensagemData = {
    nome: mensagem.nome,
    texto_mensagem: mensagem.texto_mensagem,
    intervalo_numero: mensagem.intervalo_numero,
    intervalo_tipo: mensagem.intervalo_tipo,
    ordem: mensagem.ordem
  }
  
  return generateEmbedding(mensagemData)
}

/**
 * Gera embedding para um followup (mantido para compatibilidade)
 * Combina informações da mensagem enviada e resultado
 */
export function generateFollowupEmbedding(followup: any): number[] {
  const followupData = {
    mensagem_enviada: followup.mensagem_enviada,
    status: followup.status,
    erro: followup.erro
  }
  
  return generateEmbedding(followupData)
}

/**
 * Gera embedding para uma mensagem automática (automatic_messages)
 * Combina informações da mensagem enviada e resultado
 */
export function generateAutomaticMessageEmbedding(automaticMessage: any): number[] {
  const automaticMessageData = {
    mensagem_enviada: automaticMessage.mensagem_enviada,
    status: automaticMessage.status,
    erro: automaticMessage.erro
  }
  
  return generateEmbedding(automaticMessageData)
}

/**
 * Gera embedding para configurações
 * Combina chave e valor da configuração
 */
export function generateParametroEmbedding(parametro: any): number[] {
  const parametroData = {
    chave: parametro.chave,
    valor: parametro.valor
  }

  return generateEmbedding(parametroData)
}

/**
 * Gera embedding para usuários
 * Combina informações do perfil do usuário
 */
export function generateUsuarioEmbedding(usuario: any): number[] {
  const usuarioData = {
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone,
    ativo: usuario.ativo
  }
  
  return generateEmbedding(usuarioData)
}

/**
 * Gera embedding para relacionamento usuário-revendedor
 * Combina informações do usuário e revendedor
 */
export function generateUsuarioRevendedorEmbedding(usuarioId: string, revendedorId: string): number[] {
  const relationshipData = {
    tipo: 'usuario_revendedor',
    usuario_id: usuarioId,
    revendedor_id: revendedorId
  }
  
  return generateEmbedding(relationshipData)
}

/**
 * Gera embedding para relacionamento usuário-cliente
 * Combina informações do usuário e cliente
 */
export function generateUsuarioClienteEmbedding(usuarioId: string, clienteId: string): number[] {
  const relationshipData = {
    tipo: 'usuario_cliente',
    usuario_id: usuarioId,
    cliente_id: clienteId
  }
  
  return generateEmbedding(relationshipData)
}

/**
 * Gera embedding para permissão de sistema do usuário
 * Combina informações do usuário e permissão
 */
export function generateUsuarioPermissaoSistemaEmbedding(usuarioId: string, permissao: string): number[] {
  const permissionData = {
    tipo: 'usuario_permissao_sistema',
    usuario_id: usuarioId,
    permissao: permissao
  }
  
  return generateEmbedding(permissionData)
}

/**
 * Gera embedding para usuário admin
 * Combina informações do usuário admin
 */
export function generateUsuarioAdminEmbedding(usuarioAdmin: {
  usuario_id: string;
  nivel_admin: string;
  permissoes_especiais: string[];
  ativo: boolean;
}): number[] {
  const data = {
    usuario_id: usuarioAdmin.usuario_id,
    nivel_admin: usuarioAdmin.nivel_admin,
    permissoes_especiais: usuarioAdmin.permissoes_especiais.join(','),
    ativo: usuarioAdmin.ativo
  };
  
  return generateEmbedding(data);
}

/**
 * Gera embedding para clientes
 * Combina informações do cliente
 */
export function generateClienteEmbedding(cliente: any): number[] {
  const clienteData = {
    nome: cliente.nome,
    email: cliente.email,
    telefone: cliente.telefone,
    status: cliente.status
  }
  
  return generateEmbedding(clienteData)
}

/**
 * Gera embedding genérico para qualquer entidade com nome
 * Usado para tabelas simples como origens_leads, etapas_funil, etc.
 */
export function generateGenericNameEmbedding(entity: any): number[] {
  const entityData = {
    nome: entity.nome,
    descricao: entity.descricao || entity.nome // Usa descrição se disponível, senão usa nome
  }
  
  return generateEmbedding(entityData)
}

/**
 * Calcula similaridade de cosseno entre dois embeddings
 * Útil para buscar registros similares
 * 
 * @param embedding1 - Primeiro embedding
 * @param embedding2 - Segundo embedding
 * @returns Valor de similaridade entre -1 e 1 (1 = idênticos)
 */
export function calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings devem ter o mesmo tamanho')
  }
  
  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0
  
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i]
    norm1 += embedding1[i] * embedding1[i]
    norm2 += embedding2[i] * embedding2[i]
  }
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
}