const LeadClassifier = require('./src/ai/lead-classifier');

function testarClassificador() {
  console.log('🧪 TESTANDO CLASSIFICADOR DE LEADS');
  console.log('==================================');
  
  const classifier = new LeadClassifier();
  
  // Mensagens de teste baseadas nas conversas reais
  const testes = [
    // COMPRADORES (leads novos)
    { msg: "Eu quero", esperado: "COMPRADOR" },
    { msg: "Qual o preço do plano?", esperado: "COMPRADOR" },
    { msg: "Como funciona esse IPTV?", esperado: "COMPRADOR" },
    
    // CLIENTES (existentes)
    { msg: "Não está funcionando o aplicativo", esperado: "CLIENTE" },
    { msg: "Preciso renovar meu plano", esperado: "CLIENTE" },
    { msg: "9xtream não abre na Fire Stick", esperado: "CLIENTE" },
    
    // Mensagens reais das conversas
    { msg: "Quero", esperado: "COMPRADOR" },
    { msg: "Bom dia tem algum aplicativo que funciona no fire stick", esperado: "CLIENTE" }
  ];
  
  console.log('\n🔍 RESULTADOS DOS TESTES:');
  console.log('========================\n');
  
  testes.forEach((teste, index) => {
    const resultado = classifier.classificarLead(teste.msg, []);
    
    const status = resultado.tipo === teste.esperado ? '✅' : '❌';
    
    console.log(`${index + 1}. ${status} "${teste.msg}"`);
    console.log(`   Tipo: ${resultado.tipo} (esperado: ${teste.esperado})`);
    console.log(`   Confiança: ${resultado.confianca}%`);
    console.log(`   Dados: ${JSON.stringify(resultado.dados_coletados)}`);
    console.log(`   Próxima ação: ${resultado.proxima_acao}`);
    console.log('');
  });
  
  console.log('🎯 TESTE COMPLETO!');
}

testarClassificador();
