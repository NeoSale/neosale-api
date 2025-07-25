require('dotenv').config();
const axios = require('axios');

async function testQRCode() {
  try {
    console.log('🧪 Testando QR Code diretamente...');
    
    const api = axios.create({
      baseURL: process.env.EVOLUTION_API_BASE_URL,
      headers: {
        'apikey': process.env.EVOLUTION_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Usar o nome da instância que identificamos
    const instanceName = 'Curson8n';
    
    console.log(`🔍 Testando QR Code para instância: ${instanceName}`);
    
    const qrResponse = await api.get(`/instance/connect/${instanceName}`);
    
    console.log('✅ Status da resposta:', qrResponse.status);
    console.log('\n🔍 Estrutura completa da resposta:');
    console.log(JSON.stringify(qrResponse.data, null, 2));
    
    console.log('\n📊 Análise dos campos:');
    console.log('- base64:', qrResponse.data?.base64 ? 'PRESENTE' : 'NULL');
    console.log('- qrcode:', qrResponse.data?.qrcode ? 'PRESENTE' : 'NULL');
    console.log('- code:', qrResponse.data?.code || 'NULL');
    console.log('- count:', qrResponse.data?.count || 'NULL');
    console.log('- pairingCode:', qrResponse.data?.pairingCode || 'NULL');
    
    // Verificar se há outros campos relacionados ao QR
    const allKeys = Object.keys(qrResponse.data || {});
    console.log('\n🔑 Todas as chaves na resposta:', allKeys);
    
    if (!qrResponse.data?.base64 && !qrResponse.data?.qrcode) {
      console.log('\n⚠️  QR Code está NULL. Possíveis causas:');
      console.log('1. A instância já está conectada (status: open)');
      console.log('2. Precisa desconectar a instância primeiro');
      console.log('3. Endpoint incorreto para obter QR Code');
      
      // Tentar outros endpoints possíveis
      console.log('\n🔄 Tentando outros endpoints...');
      
      try {
        const qrResponse2 = await api.get(`/instance/qrcode/${instanceName}`);
        console.log('✅ Endpoint /qrcode - Status:', qrResponse2.status);
        console.log('📊 Dados:', JSON.stringify(qrResponse2.data, null, 2));
      } catch (err) {
        console.log('❌ Endpoint /qrcode não funciona:', err.response?.status || err.message);
      }
      
      try {
        const qrResponse3 = await api.get(`/instance/qr/${instanceName}`);
        console.log('✅ Endpoint /qr - Status:', qrResponse3.status);
        console.log('📊 Dados:', JSON.stringify(qrResponse3.data, null, 2));
      } catch (err) {
        console.log('❌ Endpoint /qr não funciona:', err.response?.status || err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testQRCode();