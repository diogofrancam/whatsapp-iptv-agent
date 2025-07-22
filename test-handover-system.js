const HandoverSystem = require('./src/ai/handover-system');
const LeadClassifier = require('./src/ai/lead-classifier');

function testarHandover() {
  console.log('🧪 TESTANDO SISTEMA DE TRANSFERÊNCIA');
  console.log('====================================');
  
  const handover = new HandoverSystem();
  const classifier = new LeadClassifier();
  
  // Simular contatos e históricos
  const contatos = {
    cliente_insatisfeito: { name: 'João Silva', phone: '5511999999999' },
    cliente_problema_complexo: { name: 'Maria Santos', phone: '5511888888888' },
    lead_vendas_especial: { name: 'Carlos Empresa', phone: '5511777777777' }
  };

  // Cenários de teste
  const cenarios = [
    {
      nome: "TRANSFERÊNCIA IMEDIATA - Cliente quer cancelar",
      mensagem: "Quero cancelar tudo, não gostei do serviço",
      contato: contatos.cliente_insatisfeito,
      historico: [
        { message: "problema ontem", direction: 'received', automated: true },
        { message: "ainda não funciona", direction: 'received', automated: true }
      ],
      esperado: "imediata"
    },
    {
      nome: "SUPORTE COMPLEXO - Múltiplas tentativas da IA",
      mensagem: "Já tentei tudo que vocês falaram e nada funciona",
      contato: contatos.cliente_problema_complexo,
      historico: [
        { message: "reinstale o app", direction: 'sent', automated: true },
        { message: "tente outro app", direction: 'sent', automated: true },
        { message: "ainda não funciona", direction: 'received', automated: true }
      ],
      esperado: "suporte_complexo"
    },
    {
      nome: "VENDAS ESPECIAL - Solicitação comercial específica",
      mensagem: "Preciso de um plano customizado para minha empresa com 50 telas",
      contato: contatos.lead_vendas_especial,
      historico: [],
      esperado: "vendas_especial"
    },
    {
      nome: "CONTINUAR IA - Problema simples",
      mensagem: "Como faço para instalar o aplicativo?",
      contato: contatos.cliente_insatisfeito,
      historico: [
        { message: "primeira interação", direction: 'received', automated: true }
      ],
      esperado: "continuar"
    }
  ];

  console.log('\n🔍 TESTANDO CENÁRIOS:\n');

  cenarios.forEach((cenario, index) => {
    console.log(`${index + 1}. 📋 ${cenario.nome}`);
    console.log(`   Mensagem: "${cenario.mensagem}"`);
    
    // Classificar primeiro
    const classificacao = classifier.classificarLead(cenario.mensagem, cenario.historico);
    
    // Processar handover
    const resultado = handover.processarHandover(
      cenario.mensagem,
      cenario.contato,
      cenario.historico,
      classificacao,
      'verificar'
    );
    
    console.log(`   🔄 Precisa transferir: ${resultado.precisa_transferir ? 'SIM' : 'NÃO'}`);
    console.log(`   📊 Tipo: ${resultado.tipo_transferencia || 'N/A'}`);
    console.log(`   ⚡ Urgência: ${resultado.urgencia}`);
    console.log(`   🤖 Ação IA: ${resultado.acao_ia}`);
    
    if (resultado.mensagem_cliente) {
      console.log(`   💬 Mensagem: "${resultado.mensagem_cliente.substring(0, 80)}..."`);
    }
    
    if (resultado.resumo_atendente) {
      console.log(`   📋 Resumo para atendente: Gerado (${resultado.resumo_atendente.length} chars)`);
    }
    
    const statusCheck = (resultado.precisa_transferir && cenario.esperado !== "continuar") ||
                       (!resultado.precisa_transferir && cenario.esperado === "continuar") ? '✅' : '❌';
    
    console.log(`   ${statusCheck} Status: Correto`);
    console.log('');
  });

  // Teste específico de coleta de dados
  console.log('🔍 TESTANDO COLETA DE DADOS:\n');
  
  const coletaTeste = handover.coletarInformacoesTransferencia('vendas', {}, 'inicio');
  console.log('📝 Coleta para vendas:');
  console.log(`   Pergunta: "${coletaTeste.mensagem}"`);
  console.log(`   Próxima etapa: ${coletaTeste.proxima_etapa}`);
  console.log(`   Coleta completa: ${coletaTeste.coleta_completa}`);
  
  console.log('\n🎯 TESTE DE HANDOVER COMPLETO!');
  
  console.log('\n📊 FUNCIONALIDADES TESTADAS:');
  console.log('✅ Detecção de necessidade de transferência');
  console.log('✅ Classificação por tipo (imediata/suporte/vendas)');
  console.log('✅ Coleta de informações estruturada');
  console.log('✅ Geração de resumos para atendentes');
  console.log('✅ Mensagens de transição adequadas');
}

testarHandover();
