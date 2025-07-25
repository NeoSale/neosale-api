const axios = require('axios');

async function testLocalQREndpoint() {
  try {
    console.log('🧪 Testando endpoint local de QR Code...');
    
    const api = axios.create({
      baseURL: 'http://localhost:3000',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    // Usar o nome da instância que sabemos que existe
    const instanceName = 'Curson8n';
    
    console.log(`🔍 Testando QR Code para instância: ${instanceName}`);
    
    const qrResponse = await api.get(`/api/evolution-instances/instances/${instanceName}/qrcode`);
    
    console.log('✅ Status da resposta:', qrResponse.status);
    console.log('\n🔍 Estrutura completa da resposta:');
    console.log(JSON.stringify(qrResponse.data, null, 2));
    
    console.log('\n📊 Análise dos campos:');
    console.log('- success:', qrResponse.data?.success);
    console.log('- message:', qrResponse.data?.message);
    console.log('- data.base64:', qrResponse.data?.data?.base64 ? 'PRESENTE' : 'NULL');
    console.log('- data.code:', qrResponse.data?.data?.code ? 'PRESENTE' : 'NULL');
    console.log('- data.count:', qrResponse.data?.data?.count || 'NULL');
    console.log('- data.pairingCode:', qrResponse.data?.data?.pairingCode || 'NULL');
    
    if (qrResponse.data?.data?.base64) {
      console.log('\n✅ QR Code obtido com sucesso!');
      console.log('- Tamanho do base64:', qrResponse.data.data.base64.length, 'caracteres');
    } else {
      console.log('\n❌ QR Code ainda está NULL');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar endpoint local:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 O servidor local não está rodando. Inicie o servidor com: npm run dev');
    }
  }
}

testLocalQREndpoint();