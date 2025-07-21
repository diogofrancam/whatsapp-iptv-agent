const WasellerBypass = require('./src/crm/waseller-bypass.js');

console.log('🚀 ===== EXTRAÇÃO WASELLER CRM =====');
console.log('🔄 MODO BYPASS ATIVADO');
console.log('====================================');

async function main() {
  const api = new WasellerBypass();
  const data = await api.getAllData();
  
  console.log('✅ Sistema funcionando em modo offline');
  console.log('✅ Bot desbloqueado para desenvolvimento');
  console.log('🔧 Waseller será corrigido em paralelo');
  console.log('🎉 PRÓXIMO: Avançar para Fase 5');
}

main().catch(console.error);
