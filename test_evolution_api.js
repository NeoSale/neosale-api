const axios = require('axios');
require('dotenv').config();

const evolutionConfig = {
  baseUrl: process.env.EVOLUTION_API_BASE_URL,
  apiKey: process.env.EVOLUTION_API_KEY,
  timeout: parseInt(process.env.EVOLUTION_API_TIMEOUT || '30000')
};

async function testEvolutionAPI() {
  console.log('🧪 Testando conectividade com Evolution API...');
  console.log('🔧 Configuração:');
  console.log('- Base URL:', evolutionConfig.baseUrl);
  console.log('- API Key configurada:', !!evolutionConfig.apiKey);
  console.log('- Timeout:', evolutionConfig.timeout);
  
  if (!evolutionConfig.baseUrl || !evolutionConfig.apiKey) {
    console.error('❌ Configuração incompleta da Evolution API!');
    console.error('- EVOLUTION_API_BASE_URL:', evolutionConfig.baseUrl || 'NÃO CONFIGURADA');
    console.error('- EVOLUTION_API_KEY:', evolutionConfig.apiKey ? 'CONFIGURADA' : 'NÃO CONFIGURADA');
    return;
  }
  
  const api = axios.create({
    baseURL: evolutionConfig.baseUrl,
    timeout: evolutionConfig.timeout,
    headers: {
      'Content-Type': 'application/json',
      'apikey': evolutionConfig.apiKey
    }
  });
  
  try {
    // 1. Testar conectividade básica
    console.log('\n📡 Testando conectividade básica...');
    const healthResponse = await api.get('/instance/fetchInstances');
    console.log('✅ Conectividade OK - Status:', healthResponse.status);
    
    console.log('\n🔍 Estrutura da resposta completa:');
    console.log(JSON.stringify(healthResponse.data, null, 2));
    
    // Verificar se é um array ou objeto com propriedades
    let instances = healthResponse.data;
    if (healthResponse.data && typeof healthResponse.data === 'object' && !Array.isArray(healthResponse.data)) {
      // Se for um objeto, pode ter uma propriedade como 'instances', 'data', etc.
      instances = healthResponse.data.instances || healthResponse.data.data || healthResponse.data.response || [];
    }
    
    console.log('📊 Instâncias encontradas:', Array.isArray(instances) ? instances.length : 'Formato não reconhecido');
    
    if (Array.isArray(instances) && instances.length > 0) {
      console.log('\n📱 Primeira instância encontrada:');
      const firstInstance = instances[0];
      console.log('- Estrutura completa:', JSON.stringify(firstInstance, null, 2));
      
      // Tentar identificar o nome da instância
      const instanceName = firstInstance.instanceName || firstInstance.name || firstInstance.instance_name || firstInstance.instance;
      
      console.log('- Nome identificado:', instanceName);
      console.log('- Status:', firstInstance.status);
      console.log('- ID:', firstInstance.instanceId);
      
      // 2. Testar obtenção de QR Code da primeira instância
      if (instanceName && typeof instanceName === 'string') {
        console.log('\n🔍 Testando QR Code da instância:', instanceName);
        try {
          const qrResponse = await api.get(`/instance/connect/${instanceName}`);
          console.log('✅ Resposta QR Code - Status:', qrResponse.status);
          console.log('\n🔍 Estrutura completa da resposta QR Code:');
          console.log(JSON.stringify(qrResponse.data, null, 2));
          
          console.log('\n📊 Dados do QR Code:');
          console.log('- Base64:', qrResponse.data?.base64 ? 'PRESENTE' : 'NULL');
          console.log('- QRCode:', qrResponse.data?.qrcode ? 'PRESENTE' : 'NULL');
          console.log('- Code:', qrResponse.data?.code || 'NULL');
          console.log('- Count:', qrResponse.data?.count || 'NULL');
          console.log('- PairingCode:', qrResponse.data?.pairingCode || 'NULL');
          
          if (!qrResponse.data?.base64 && !qrResponse.data?.qrcode) {
            console.log('\n⚠️  QR Code está NULL. Possíveis causas:');
            console.log('1. A instância já está conectada');
            console.log('2. A instância precisa ser reiniciada');
            console.log('3. Problema na Evolution API');
            console.log('4. Endpoint incorreto ou formato de resposta diferente');
          }
        } catch (qrError) {
          console.error('❌ Erro ao obter QR Code:', qrError.response?.data || qrError.message);
          if (qrError.response?.status === 404) {
            console.error('💡 A instância não foi encontrada. Verifique se o nome está correto.');
          }
        }
      } else {
        console.log('\n❌ Nome da instância não identificado ou inválido:', typeof instanceName, instanceName);
        console.log('\n🔍 Tentando usar o nome diretamente da resposta...');
        
        // Tentar usar o nome diretamente se estiver disponível
        if (firstInstance.instanceName) {
          try {
            const qrResponse = await api.get(`/instance/connect/${firstInstance.instanceName}`);
            console.log('✅ Resposta QR Code - Status:', qrResponse.status);
            console.log('\n🔍 Estrutura completa da resposta QR Code:');
            console.log(JSON.stringify(qrResponse.data, null, 2));
          } catch (qrError) {
            console.error('❌ Erro ao obter QR Code:', qrError.response?.data || qrError.message);
          }
        }
      }
    } else {
      console.log('\n⚠️  Nenhuma instância encontrada na Evolution API.');
      console.log('💡 Você precisa criar uma instância primeiro.');
    }
    
  } catch (error) {
    console.error('\n❌ Erro de conectividade:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n🚨 Conexão recusada!');
      console.error('💡 Verifique se a Evolution API está rodando na URL:', evolutionConfig.baseUrl);
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n🚨 URL não encontrada!');
      console.error('💡 Verifique se a EVOLUTION_API_BASE_URL está correta:', evolutionConfig.baseUrl);
    } else if (error.response?.status === 401) {
      console.error('\n🚨 Não autorizado!');
      console.error('💡 Verifique se a EVOLUTION_API_KEY está correta.');
    }
  }
}

// Executar teste
testEvolutionAPI();