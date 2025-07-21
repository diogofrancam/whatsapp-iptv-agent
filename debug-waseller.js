const axios = require('axios');

class WasellerDiagnostic {
  constructor() {
    this.baseUrls = [
      'https://api.waseller.com',
      'https://app.waseller.com/api',
      'https://waseller.com/api/v1',
      'https://api.waseller.com/v1'
    ];
    
    this.authMethods = [
      { type: 'Bearer', header: 'Authorization', format: 'Bearer TOKEN' },
      { type: 'API-Key', header: 'X-API-Key', format: 'TOKEN' },
      { type: 'Token', header: 'X-Auth-Token', format: 'TOKEN' },
      { type: 'Basic', header: 'Authorization', format: 'Basic BASE64' }
    ];
  }

  async testEndpoints() {
    console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO...\n');
    
    for (const baseUrl of this.baseUrls) {
      console.log(`\n🔗 Testando URL base: ${baseUrl}`);
      await this.testBaseUrl(baseUrl);
    }
  }

  async testBaseUrl(baseUrl) {
    // Teste 1: Verificar se URL existe
    try {
      const response = await axios.get(baseUrl, { timeout: 5000 });
      console.log(`✅ URL acessível - Status: ${response.status}`);
    } catch (error) {
      console.log(`❌ URL inacessível: ${error.message}`);
      return;
    }

    // Teste 2: Endpoints comuns sem auth
    const publicEndpoints = ['/ping', '/health', '/status', '/version'];
    for (const endpoint of publicEndpoints) {
      try {
        const response = await axios.get(`${baseUrl}${endpoint}`, { timeout: 3000 });
        console.log(`✅ Endpoint público ${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`❌ Endpoint ${endpoint}: ${error.response?.status || error.message}`);
      }
    }

    // Teste 3: Testar diferentes métodos de auth
    await this.testAuthMethods(baseUrl);
  }

  async testAuthMethods(baseUrl) {
    const token = process.env.WASELLER_TOKEN || 'test_token';
    const testEndpoint = '/contacts';

    for (const auth of this.authMethods) {
      try {
        const headers = {};
        if (auth.type === 'Basic') {
          headers[auth.header] = `Basic ${Buffer.from(`api:${token}`).toString('base64')}`;
        } else {
          headers[auth.header] = auth.format.replace('TOKEN', token);
        }

        const response = await axios.get(`${baseUrl}${testEndpoint}`, { 
          headers,
          timeout: 5000 
        });
        console.log(`✅ Auth ${auth.type} funciona: ${response.status}`);
        return { baseUrl, auth, headers };
      } catch (error) {
        console.log(`❌ Auth ${auth.type}: ${error.response?.status || error.message}`);
      }
    }
  }
}

// Executar diagnóstico
const diagnostic = new WasellerDiagnostic();
diagnostic.testEndpoints().then(() => {
  console.log('\n🎉 DIAGNÓSTICO COMPLETO!');
}).catch(console.error);
