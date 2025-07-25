require('dotenv').config();
const axios = require('axios');

async function testDisconnectAndConnect() {
  try {
    console.log('🧪 Testando desconexão e reconexão para obter QR Code...');
    
    const api = axios.create({
      baseURL: process.env.EVOLUTION_API_BASE_URL,
      headers: {
        'apikey': process.env.EVOLUTION_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const instanceName = 'Curson8n';
    
    console.log(`🔍 Verificando status atual da instância: ${instanceName}`);
    
    // 1. Verificar status atual
    try {
      const statusResponse = await api.get(`/instance/fetchInstances`);
      const instance = statusResponse.data.find(inst => inst.instance?.instanceName === instanceName);
      console.log('📊 Status atual:', instance?.instance?.state || 'não encontrado');
    } catch (err) {
      console.log('⚠️  Erro ao verificar status:', err.response?.status || err.message);
    }
    
    // 2. Tentar desconectar a instância
    console.log('\n🔌 Tentando desconectar a instância...');
    try {
      const disconnectResponse = await api.delete(`/instance/logout/${instanceName}`);
      console.log('✅ Desconexão - Status:', disconnectResponse.status);
      console.log('📊 Resposta:', JSON.stringify(disconnectResponse.data, null, 2));
      
      // Aguardar um pouco para a desconexão ser processada
      console.log('⏳ Aguardando 3 segundos...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (disconnectError) {
      console.log('❌ Erro na desconexão:', disconnectError.response?.data || disconnectError.message);
      
      // Tentar outros endpoints de desconexão
      try {
        console.log('🔄 Tentando endpoint alternativo de desconexão...');
        const disconnectResponse2 = await api.post(`/instance/disconnect/${instanceName}`);
        console.log('✅ Desconexão alternativa - Status:', disconnectResponse2.status);
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (err2) {
        console.log('❌ Endpoint alternativo também falhou:', err2.response?.status || err2.message);
      }
    }
    
    // 3. Tentar obter QR Code após desconexão
    console.log('\n🔍 Tentando obter QR Code após desconexão...');
    try {
      const qrResponse = await api.get(`/instance/connect/${instanceName}`);
      console.log('✅ QR Code - Status:', qrResponse.status);
      console.log('\n🔍 Estrutura da resposta:');
      console.log(JSON.stringify(qrResponse.data, null, 2));
      
      console.log('\n📊 Análise dos campos:');
      console.log('- base64:', qrResponse.data?.base64 ? 'PRESENTE' : 'NULL');
      console.log('- qrcode:', qrResponse.data?.qrcode ? 'PRESENTE' : 'NULL');
      console.log('- code:', qrResponse.data?.code || 'NULL');
      console.log('- count:', qrResponse.data?.count || 'NULL');
      console.log('- pairingCode:', qrResponse.data?.pairingCode || 'NULL');
      
    } catch (qrError) {
      console.error('❌ Erro ao obter QR Code:', qrError.response?.data || qrError.message);
    }
    
    // 4. Verificar se há documentação da API
    console.log('\n📚 Verificando endpoints disponíveis...');
    try {
      const docsResponse = await api.get('/');
      console.log('✅ Documentação disponível - Status:', docsResponse.status);
    } catch (err) {
      console.log('❌ Sem documentação disponível:', err.response?.status || err.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

testDisconnectAndConnect();