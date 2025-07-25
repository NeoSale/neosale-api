export interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export const evolutionConfig: EvolutionConfig = {
  baseUrl: process.env.EVOLUTION_API_BASE_URL || 'http://localhost:8080',
  apiKey: process.env.EVOLUTION_API_KEY || '',
  timeout: parseInt(process.env.EVOLUTION_API_TIMEOUT || '30000'),
  retryAttempts: parseInt(process.env.EVOLUTION_API_RETRY_ATTEMPTS || '3'),
  retryDelay: parseInt(process.env.EVOLUTION_API_RETRY_DELAY || '1000')
};

// Validar configurações obrigatórias
if (!evolutionConfig.apiKey) {
  console.warn('⚠️  EVOLUTION_API_KEY não configurada. Algumas funcionalidades podem não funcionar.');
}

if (!evolutionConfig.baseUrl) {
  console.warn('⚠️  EVOLUTION_API_BASE_URL não configurada. Usando URL padrão.');
}

console.log('🔧 Evolution API configurada:', {
  baseUrl: evolutionConfig.baseUrl,
  timeout: evolutionConfig.timeout,
  retryAttempts: evolutionConfig.retryAttempts,
  retryDelay: evolutionConfig.retryDelay,
  apiKeyConfigured: !!evolutionConfig.apiKey
});