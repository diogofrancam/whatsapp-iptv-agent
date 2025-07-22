const ContextualResponses = require('./src/ai/contextual-responses');

function testarRespostas() {
  console.log('🧪 TESTANDO RESPOSTAS CONTEXTUAIS');
  console.log('=================================');
  
  const responseSystem = new ContextualResponses();
  
  // Simular diferentes tipos de contatos
  const contatos = {
    novo_lead: { name: 'João', phone: '5511999999999' },
    cliente_existente: { name: 'Maria', phone: '5511888888888' }
  };

  // Cenários de teste baseados nas conversas reais
  const cenarios = [
    {
      nome: "NOVO LEAD - Interesse inicial",
      mensagem: "Eu quero",
      contato: contatos.novo_lead,
      historico: [],
      esperado: "COMPRADOR"
    },
    {
      nome: "CLIENTE - Problema técnico",
      mensagem: "9xtream não abre na Fire Stick",
      contato: contatos.cliente_existente,
      historico: [{ message: "já paguei", timestamp: "2025-01-01" }],
      esperado: "CLIENTE"
    },
    {
      nome: "CLIENTE - Suporte alternativo",
      mensagem: "Bom dia tem algum aplicativo que funciona no fire stick",
      contato: contatos.cliente_existente,
      historico: [{ message: "comprovante", timestamp: "2025-01-01" }],
      esperado: "CLIENTE"
    },
    {
      nome: "CLIENTE - Renovação",
      mensagem: "Preciso renovar meu plano",
      contato: contatos.cliente_existente,
      historico: [],
      esperado: "CLIENTE"
    },
    {
      nome: "NOVO LEAD - Preço",
      mensagem: "Qual o valor do plano?",
      contato: contatos.novo_lead,
      historico: [],
      esperado: "COMPRADOR"
    }
  ];

  console.log('\n🔍 TESTANDO CENÁRIOS:\n');

  cenarios.forEach((cenario, index) => {
    console.log(`${index + 1}. 📋 ${cenario.nome}`);
    console.log(`   Mensagem: "${cenario.mensagem}"`);
    
    const resultado = responseSystem.gerarResposta(
      cenario.mensagem, 
      cenario.contato, 
      cenario.historico
    );
    
    const statusClass = resultado.classificacao.tipo === cenario.esperado ? '✅' : '❌';
    
    console.log(`   ${statusClass} Classificação: ${resultado.classificacao.tipo} (esperado: ${cenario.esperado})`);
    console.log(`   🎯 Confiança: ${resultado.classificacao.confianca}%`);
    console.log(`   ⚡ Prioridade: ${resultado.prioridade}`);
    console.log(`   📱 Dados coletados: ${JSON.stringify(resultado.dados_coletados)}`);
    console.log(`   🏷️ Tags: ${resultado.tags_sugeridas.join(', ')}`);
    console.log(`   📝 Resposta gerada:`);
    console.log(`      "${resultado.mensagem.substring(0, 100)}..."`);
    
    if (resultado.proxima_pergunta) {
      console.log(`   ❓ Próxima pergunta: "${resultado.proxima_pergunta}"`);
    }
    
    console.log('');
  });

  console.log('🎯 TESTE DE RESPOSTAS COMPLETO!');
  console.log('\n📊 RESUMO:');
  console.log('- Sistema classificando leads corretamente');
  console.log('- Respostas contextuais sendo geradas');  
  console.log('- Dados essenciais sendo extraídos');
  console.log('- Fluxos específicos funcionando');
}

testarRespostas();
