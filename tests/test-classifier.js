const AssistenteGustavo = require('../assistente-gustavo-v2');

class TestClassifier {
  constructor() {
    this.gustavo = new AssistenteGustavo();
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🧪 INICIANDO TESTES DO CLASSIFICADOR DE LEADS');
    console.log('===============================================');
    
    await this.testCampanhaExterna();
    await this.testListaDisparo();
    await this.testClienteExistente();
    await this.testTipoAtendimento();
    
    this.showResults();
  }

  async testCampanhaExterna() {
    console.log('\n🔍 Testando classificação: CAMPANHA EXTERNA (Leads Frios)');
    
    const testCases = [
      {
        mensagem: "Oi, vi seu anúncio no Facebook",
        esperado: "CAMPANHA_EXTERNA",
        descricao: "Menção direta ao Facebook"
      },
      {
        mensagem: "Achei vocês no Google",
        esperado: "CAMPANHA_EXTERNA", 
        descricao: "Descoberta via Google"
      },
      {
        mensagem: "Vi a propaganda de vocês",
        esperado: "CAMPANHA_EXTERNA",
        descricao: "Referência a propaganda"
      },
      {
        mensagem: "É a primeira vez que falo com vocês",
        esperado: "CAMPANHA_EXTERNA",
        descricao: "Primeiro contato"
      },
      {
        mensagem: "Como chegou até vocês?",
        esperado: "CAMPANHA_EXTERNA",
        descricao: "Pergunta sobre origem"
      }
    ];

    for (const testCase of testCases) {
      const resultado = this.gustavo.identificarOrigemLead(testCase.mensagem, {}, true);
      const passou = resultado === testCase.esperado;
      
      this.testResults.push({
        categoria: 'Campanha Externa',
        teste: testCase.descricao,
        mensagem: testCase.mensagem,
        esperado: testCase.esperado,
        resultado: resultado,
        passou: passou
      });
      
      console.log(`${passou ? '✅' : '❌'} ${testCase.descricao}: ${passou ? 'PASSOU' : 'FALHOU'}`);
      if (!passou) {
        console.log(`   Esperado: ${testCase.esperado}, Recebido: ${resultado}`);
      }
    }
  }

  async testListaDisparo() {
    console.log('\n🔥 Testando classificação: LISTA DISPARO (Leads Quentes)');
    
    const testCases = [
      {
        mensagem: "Recebi sua mensagem sobre IPTV",
        esperado: "LISTA_DISPARO",
        descricao: "Resposta a mensagem"
      },
      {
        mensagem: "Vi sua promoção especial",
        esperado: "LISTA_DISPARO",
        descricao: "Menção a promoção"
      },
      {
        mensagem: "Quero aproveitar a oferta",
        esperado: "LISTA_DISPARO",
        descricao: "Interesse direto em oferta"
      },
      {
        mensagem: "Ainda tem o desconto?",
        esperado: "LISTA_DISPARO",
        descricao: "Pergunta sobre desconto"
      },
      {
        mensagem: "Restam quantas vagas?",
        esperado: "LISTA_DISPARO",
        descricao: "Urgência em vagas"
      }
    ];

    for (const testCase of testCases) {
      const resultado = this.gustavo.identificarOrigemLead(testCase.mensagem, {}, true);
      const passou = resultado === testCase.esperado;
      
      this.testResults.push({
        categoria: 'Lista Disparo',
        teste: testCase.descricao,
        mensagem: testCase.mensagem,
        esperado: testCase.esperado,
        resultado: resultado,
        passou: passou
      });
      
      console.log(`${passou ? '✅' : '❌'} ${testCase.descricao}: ${passou ? 'PASSOU' : 'FALHOU'}`);
      if (!passou) {
        console.log(`   Esperado: ${testCase.esperado}, Recebido: ${resultado}`);
      }
    }
  }

  async testClienteExistente() {
    console.log('\n👤 Testando classificação: CLIENTE EXISTENTE');
    
    const clienteExistente = {
      tags: ['Cliente Ativo'],
      phone: '5511999999999',
      name: 'João da Silva'
    };

    const testCases = [
      {
        mensagem: "Oi, tudo bem?",
        esperado: "CLIENTE_EXISTENTE",
        descricao: "Saudação simples de cliente existente"
      },
      {
        mensagem: "Preciso de ajuda com o IPTV",
        esperado: "CLIENTE_EXISTENTE",
        descricao: "Pedido de ajuda de cliente"
      }
    ];

    for (const testCase of testCases) {
      const resultado = this.gustavo.identificarOrigemLead(testCase.mensagem, clienteExistente, false);
      const passou = resultado === testCase.esperado;
      
      this.testResults.push({
        categoria: 'Cliente Existente',
        teste: testCase.descricao,
        mensagem: testCase.mensagem,
        esperado: testCase.esperado,
        resultado: resultado,
        passou: passou
      });
      
      console.log(`${passou ? '✅' : '❌'} ${testCase.descricao}: ${passou ? 'PASSOU' : 'FALHOU'}`);
    }
  }

  async testTipoAtendimento() {
    console.log('\n🎨 Testando classificação: TIPO DE ATENDIMENTO');
    
    const testCases = [
      {
        mensagem: "Qual é o preço do IPTV?",
        contato: { tags: ['Lead Novo'] },
        esperado: "VENDA",
        descricao: "Pergunta sobre preço = VENDA"
      },
      {
        mensagem: "Meu IPTV não funciona",
        contato: { tags: ['Cliente Ativo'] },
        esperado: "SUPORTE",
        descricao: "Problema técnico = SUPORTE"
      },
      {
        mensagem: "Oi, tudo bem?",
        contato: { tags: ['Lead Novo'] },
        esperado: "GERAL",
        descricao: "Mensagem neutra = GERAL"
      },
      {
        mensagem: "Quero instalar o sistema",
        contato: { tags: ['Lead Novo'] },
        esperado: "VENDA",
        descricao: "Interesse em instalação = VENDA"
      },
      {
        mensagem: "Está travando muito",
        contato: { tags: ['Cliente Ativo'] },
        esperado: "SUPORTE",
        descricao: "Problema de performance = SUPORTE"
      }
    ];

    for (const testCase of testCases) {
      const resultado = this.gustavo.classificarAtendimento(testCase.mensagem, testCase.contato);
      const passou = resultado === testCase.esperado;
      
      this.testResults.push({
        categoria: 'Tipo Atendimento',
        teste: testCase.descricao,
        mensagem: testCase.mensagem,
        esperado: testCase.esperado,
        resultado: resultado,
        passou: passou
      });
      
      console.log(`${passou ? '✅' : '❌'} ${testCase.descricao}: ${passou ? 'PASSOU' : 'FALHOU'}`);
    }
  }

  showResults() {
    console.log('\n📊 RESULTADO DOS TESTES');
    console.log('========================');
    
    const totalTestes = this.testResults.length;
    const testesPassaram = this.testResults.filter(t => t.passou).length;
    const testesFalharam = totalTestes - testesPassaram;
    const porcentagemSucesso = ((testesPassaram / totalTestes) * 100).toFixed(2);
    
    console.log(`✅ Testes que passaram: ${testesPassaram}`);
    console.log(`❌ Testes que falharam: ${testesFalharam}`);
    console.log(`📈 Taxa de sucesso: ${porcentagemSucesso}%`);
    
    if (testesFalharam > 0) {
      console.log('\n❌ TESTES QUE FALHARAM:');
      this.testResults
        .filter(t => !t.passou)
        .forEach(teste => {
          console.log(`- ${teste.categoria}: ${teste.teste}`);
          console.log(`  Mensagem: "${teste.mensagem}"`);
          console.log(`  Esperado: ${teste.esperado}, Recebido: ${teste.resultado}`);
        });
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (porcentagemSucesso >= 90) {
      console.log('🎉 EXCELENTE! Sistema funcionando perfeitamente!');
    } else if (porcentagemSucesso >= 80) {
      console.log('👍 BOM! Algumas melhorias podem ser feitas.');
    } else {
      console.log('⚠️ ATENÇÃO! Sistema precisa de ajustes.');
    }
  }
}

// Executar testes se o arquivo for chamado diretamente
if (require.main === module) {
  const tester = new TestClassifier();
  tester.runAllTests().catch(console.error);
}

module.exports = TestClassifier;