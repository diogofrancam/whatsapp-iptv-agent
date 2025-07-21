require('dotenv').config();
const WasellerAPIFixed = require('./src/crm/waseller-api-fixed.js');

async function testComplete() {
  console.log('🧪 TESTE COMPLETO DA CORREÇÃO');
  console.log('=============================');
  
  // Verificar se token está configurado
  if (!process.env.WASELLER_TOKEN) {
    console.log('❌ WASELLER_TOKEN não configurado!');
    console.log('💡 Configure com: export WASELLER_TOKEN="seu_token"');
    return;
  }

  try {
    const api = new WasellerAPIFixed();
    
    console.log('1. Testando autenticação...');
    await api.findWorkingAuth();
    
    console.log('2. Extraindo dados...');
    const data = await api.getAllData();
    
    console.log('3. Resultados:');
    Object.entries(data).forEach(([key, value]) => {
      console.log(`   ${key}: ${value.length} itens`);
    });
    
    console.log('🎉 CORREÇÃO BEM-SUCEDIDA!');
    
  } catch (error) {
    console.log('❌ ERRO PERSISTENTE:', error.message);
    console.log('\n🔍 PRÓXIMOS PASSOS:');
    console.log('1. Verificar token na conta Waseller');
    console.log('2. Confirmar permissões de API');
    console.log('3. Verificar plano da conta');
  }
}

testComplete();
