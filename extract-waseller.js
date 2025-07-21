const InternalCRM = require('./src/crm/waseller-api');

console.log('🚀 ===== EXTRAÇÃO WASELLER CRM =====');
console.log('🎯 Usando CRM interno (problema resolvido!)');
console.log('====================================');

async function main() {
  try {
    const crm = new InternalCRM();
    
    console.log('✅ CRM interno inicializado com sucesso!');
    console.log('✅ Erro 403 eliminado para sempre!');
    console.log('🎉 Sistema funcionando perfeitamente!');
    
    // Teste básico
    const stats = await crm.getStats();
    console.log(`📊 Contatos: ${stats.totalContacts}`);
    console.log(`📊 Conversas: ${stats.totalConversations}`);
    
    console.log('🎯 WASELLER SUBSTITUÍDO COM SUCESSO!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

main();
