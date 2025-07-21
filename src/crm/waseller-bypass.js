// 🔄 BYPASS TEMPORÁRIO - Waseller em modo offline
class WasellerBypass {
  constructor() {
    console.log('🔄 MODO OFFLINE: Waseller temporariamente desabilitado');
    this.mockData = {
      contacts: [],
      conversations: [],
      templates: [],
      success: true,
      message: 'Dados simulados - Waseller offline'
    };
  }
  
  async getAllData() {
    return this.mockData;
  }
  
  async testConnection() {
    console.log('✅ BYPASS: Conexão simulada com sucesso');
    return true;
  }
}

module.exports = WasellerBypass;
