const axios = require('axios');
const fs = require('fs').promises;

class WasellerAPIFixed {
  constructor() {
    // Configuração robusta baseada em testes
    this.config = {
      baseURL: process.env.WASELLER_BASE_URL || 'https://api.waseller.com',
      token: process.env.WASELLER_TOKEN,
      timeout: 10000,
      maxRetries: 3
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout
    });

    // Interceptor para logging detalhado
    this.client.interceptors.request.use(request => {
      console.log(`🔗 ${request.method.toUpperCase()} ${request.url}`);
      console.log(`🔑 Headers:`, JSON.stringify(request.headers, null, 2));
      return request;
    });

    this.client.interceptors.response.use(
      response => {
        console.log(`✅ ${response.status} ${response.config.url}`);
        return response;
      },
      error => {
        console.log(`❌ ${error.response?.status || 'ERROR'} ${error.config?.url}`);
        console.log(`📄 Response:`, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  // Método para testar diferentes tipos de autenticação
  async findWorkingAuth() {
    const authTypes = [
      () => ({ 'Authorization': `Bearer ${this.config.token}` }),
      () => ({ 'X-API-Key': this.config.token }),
      () => ({ 'X-Auth-Token': this.config.token }),
      () => ({ 'Authorization': `Token ${this.config.token}` }),
      () => ({ 'Authorization': `Basic ${Buffer.from(`api:${this.config.token}`).toString('base64')}` })
    ];

    for (let i = 0; i < authTypes.length; i++) {
      try {
        const headers = authTypes[i]();
        console.log(`🧪 Testando método de auth ${i + 1}:`, Object.keys(headers)[0]);
        
        const response = await this.client.get('/contacts?limit=1', { headers });
        console.log(`✅ AUTH FUNCIONOU! Método ${i + 1}`);
        
        // Salvar configuração que funcionou
        this.workingAuth = headers;
        await this.saveWorkingConfig(i + 1, headers);
        return headers;
        
      } catch (error) {
        console.log(`❌ Método ${i + 1} falhou:`, error.response?.status);
      }
    }
    
    throw new Error('❌ Nenhum método de autenticação funcionou');
  }

  async saveWorkingConfig(method, headers) {
    const config = {
      method,
      headers,
      timestamp: new Date().toISOString(),
      baseURL: this.config.baseURL
    };
    
    await fs.writeFile('working-auth-config.json', JSON.stringify(config, null, 2));
    console.log('💾 Configuração funcionando salva em working-auth-config.json');
  }

  async makeRequest(endpoint, options = {}) {
    if (!this.workingAuth) {
      await this.findWorkingAuth();
    }

    const config = {
      headers: { ...this.workingAuth, ...options.headers },
      ...options
    };

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await this.client.get(endpoint, config);
        return response.data;
      } catch (error) {
        console.log(`❌ Tentativa ${attempt}/${this.config.maxRetries} falhou`);
        
        if (attempt === this.config.maxRetries) {
          throw error;
        }
        
        // Aguardar antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  async getAllData() {
    console.log('🚀 Iniciando extração com API corrigida...');
    
    const endpoints = [
      'contacts',
      'conversations', 
      'templates',
      'tags',
      'campaigns'
    ];

    const results = {};

    for (const endpoint of endpoints) {
      try {
        console.log(`📡 Extraindo ${endpoint}...`);
        const data = await this.makeRequest(`/${endpoint}`);
        results[endpoint] = Array.isArray(data) ? data : [data];
        console.log(`✅ ${endpoint}: ${results[endpoint].length} itens`);
      } catch (error) {
        console.log(`⚠️ ${endpoint}: Falha - ${error.message}`);
        results[endpoint] = [];
      }
    }

    return results;
  }
}

module.exports = WasellerAPIFixed;
