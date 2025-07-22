const LeadClassifier = require('./lead-classifier');

class ContextualResponses {
  constructor() {
    this.classifier = new LeadClassifier();
    
    // Templates de resposta por tipo de cliente
    this.templates = {
      // Respostas para COMPRADORES (leads novos)
      COMPRADOR: {
        saudacao: [
          "Olá! 👋 Que bom ter seu interesse nos nossos planos de IPTV!",
          "Oi! Bem-vindo! 😊 Vou te ajudar a conhecer nossos serviços!",
          "Olá! Perfeito timing! Temos ótimas promoções hoje!"
        ],
        
        apresentacao: [
          "Temos acesso completo à *Sky, Netflix, Prime Video, Globo Play e +65.847 canais* direto na sua TV! 📺",
          "Oferecemos *Sky, Netflix, Disney+, Combate, Premiere* e filmes direto do cinema! 🎬",
          "Acesso total: *canais fechados + filmes recém-saídos do cinema + esportes ao vivo!* ⚽"
        ],
        
        teste_gratuito: [
          "Quer fazer um *teste gratuito por 1 hora* primeiro? 🔥",
          "Posso liberar um *acesso de teste* para você experimentar agora mesmo!",
          "Que tal testar *gratuitamente* para ver a qualidade? Demora só 2 minutos para configurar!"
        ],
        
        preco_promocional: [
          "Temos uma *promoção especial hoje*: de R$69,99 por apenas *R$34,99* - sem mensalidade! 💸",
          "Oferta de hoje: *R$47,00* única vez + taxa de manutenção de apenas R$6,99/mês",
          "Plano promocional: *3 meses por R$24,99* ou *12 meses por R$79,99* com 2 telas!"
        ],
        
        call_to_action: [
          "Digite *EU QUERO* para ativar agora! 🚀",
          "Mande *QUERO TESTAR* e vou liberar seu acesso em 2 minutos!",
          "Quer aproveitar? Digite *SIM* que te mando os detalhes!"
        ]
      },

      // Respostas para CLIENTES (existentes)
      CLIENTE: {
        saudacao_suporte: [
          "Oi! Sou o *Téc. Pedro* 👨‍💻 Vou resolver seu problema rapidinho!",
          "Olá! Suporte técnico aqui! Vamos resolver isso para você! 🔧",
          "Oi! Identifiquei que você precisa de ajuda técnica. Estou aqui para isso! ⚡"
        ],
        
        coleta_info: [
          "Para te ajudar melhor, preciso de algumas informações:",
          "Vou fazer umas perguntinhas rápidas para resolver de forma eficiente:",
          "Para resolver rapidamente, me responda:"
        ],
        
        opcoes_dispositivo: [
          "Em qual dispositivo está usando?\n\n1️⃣ Samsung, LG ou Roku\n2️⃣ TV Box ou Celular\n3️⃣ Fire Stick",
          "Qual seu dispositivo?\n\n1️⃣ Smart TV (Samsung/LG)\n2️⃣ Celular/Tablet\n3️⃣ Fire Stick/Chromecast"
        ],
        
        opcoes_aplicativo: [
          "Qual aplicativo está usando?\n\n1️⃣ Absoluto player\n2️⃣ Canal player\n3️⃣ XCiptv, XPiptv, 9Xtream\n4️⃣ BOB player, IBO play\n5️⃣ IPTV Smartars player",
          "Me diga qual app:\n\n1️⃣ IPTV Smarters\n2️⃣ 9Xtream Player\n3️⃣ XP IPTV\n4️⃣ Outro (qual?)"
        ],
        
        renovacao: [
          "Seu acesso está vencendo! 🔔\n\nPara manter seu desconto, renove por apenas *R$6,99*",
          "Oi! Seu plano expira em breve. Quer renovar com desconto especial?",
          "Seu pacote vence hoje! Aproveite: 3 meses por *R$24,99* com +1 mês grátis! 🎁"
        ],
        
        aguarde_resolucao: [
          "Aguarde um momento, vou resolver seu problema! 🔄",
          "Perfeito! Já identifiquei o problema. Deixa comigo! ✅",
          "Entendi! Vou ajustar isso para você agora mesmo! 🛠️"
        ]
      },

      // Respostas para casos INDEFINIDOS
      INDEFINIDO: {
        qualificacao: [
          "Oi! Posso te ajudar com alguma coisa? 😊\n\nVocê:\n🆕 Está conhecendo nossos planos agora\n🔧 Precisa de suporte técnico",
          "Olá! Sou da equipe HobTV. Em que posso ajudar?\n\n• Apresentar nossos planos\n• Resolver problemas técnicos\n• Tirar dúvidas",
          "Oi! Me conta: você já é nosso cliente ou está conhecendo agora? Assim posso te ajudar melhor! 👍"
        ]
      }
    };

    // Fluxos de resposta por situação específica
    this.fluxosEspecificos = {
      // Apps específicos mencionados
      '9xtream': {
        problema: "Vi que está com problema no 9Xtream no Fire Stick.\n\nVamos testar estas opções:\n\n✅ Reinstalar o app\n✅ Testar outro app (XP IPTV)\n✅ Verificar seus dados de login\n\nQual prefere tentar primeiro?",
        alternativa: "O 9Xtream às vezes trava no Fire Stick. Recomendo testar:\n\n• *XP IPTV*\n• *Canal Player*\n\nAmbo funcionam melhor. Quer que eu te ajude a configurar?"
      },
      
      'fire_stick': {
        suporte: "Fire Stick identificado! 📺\n\nPara resolver problemas no Fire Stick:\n\n1️⃣ Limpar cache do app\n2️⃣ Testar app alternativo\n3️⃣ Verificar conexão WiFi\n\nMe diga qual está acontecendo exatamente."
      },
      
      'renovacao': {
        urgente: "⚠️ *ATENÇÃO*: Seu acesso expira hoje!\n\nPara não perder seu desconto:\n\n💰 Renove agora por *R$6,99*\n🎁 Ou aproveite: 6 meses por *R$34,99*\n\n*PIX*: hobtiv1@gmail.com"
      }
    };

    // Palavras-chave para diferentes fluxos
    this.palavrasChave = {
      urgencia: ['urgente', 'agora', 'imediato', 'rápido', 'já'],
      satisfacao: ['obrigado', 'valeu', 'funcionou', 'resolveu', 'perfeito'],
      insatisfacao: ['não gostei', 'ruim', 'não funciona', 'problema'],
      despedida: ['tchau', 'obrigado', 'até mais', 'falou']
    };
  }

  // Gerar resposta contextual baseada na classificação
  gerarResposta(mensagem, contato, historico = []) {
    const analise = this.classifier.analisarContexto(mensagem, contato, historico);
    const { classificacao, dados_coletados } = analise;

    let resposta = '';
    let proximaPergunta = '';
    let tags = analise.contexto_completo.tags_sugeridas;

    // Determinar o tipo de resposta necessária
    if (classificacao.tipo === 'COMPRADOR') {
      resposta = this.gerarRespostaComprador(dados_coletados, historico.length === 0);
    } else if (classificacao.tipo === 'CLIENTE') {
      resposta = this.gerarRespostaCliente(dados_coletados, mensagem);
    } else {
      resposta = this.gerarRespostaIndefinido();
    }

    // Adicionar perguntas qualificadoras se necessário
    if (analise.perguntas_sugeridas.length > 0) {
      proximaPergunta = analise.perguntas_sugeridas[0];
    }

    // Verificar fluxos específicos
    const fluxoEspecifico = this.identificarFluxoEspecifico(dados_coletados, mensagem);
    if (fluxoEspecifico) {
      resposta = fluxoEspecifico;
    }

    return {
      mensagem: resposta,
      proxima_pergunta: proximaPergunta,
      classificacao: classificacao,
      dados_coletados: dados_coletados,
      tags_sugeridas: tags,
      acao_sugerida: classificacao.proxima_acao,
      prioridade: classificacao.prioridade
    };
  }

  // Gerar resposta para COMPRADORES
  gerarRespostaComprador(dados, ehNovoContato) {
    let resposta = '';

    // Saudação (se é novo contato)
    if (ehNovoContato) {
      resposta += this.escolherTemplate('COMPRADOR', 'saudacao') + '\n\n';
    }

    // Apresentação do produto
    resposta += this.escolherTemplate('COMPRADOR', 'apresentacao') + '\n\n';

    // Oferecer teste se não tem dispositivo específico mencionado
    if (!dados.dispositivo) {
      resposta += this.escolherTemplate('COMPRADOR', 'teste_gratuito') + '\n\n';
    }

    // Preço promocional
    resposta += this.escolherTemplate('COMPRADOR', 'preco_promocional') + '\n\n';

    // Call to action
    resposta += this.escolherTemplate('COMPRADOR', 'call_to_action');

    return resposta;
  }

  // Gerar resposta para CLIENTES
  gerarRespostaCliente(dados, mensagem) {
    let resposta = '';

    // Identificar se é renovação ou problema técnico
    if (mensagem.toLowerCase().includes('renovar') || 
        mensagem.toLowerCase().includes('vencendo') ||
        mensagem.toLowerCase().includes('pagar')) {
      
      return this.escolherTemplate('CLIENTE', 'renovacao');
    }

    // Saudação de suporte
    resposta += this.escolherTemplate('CLIENTE', 'saudacao_suporte') + '\n\n';

    // Se não tem dados suficientes, coletar informações
    if (!dados.dispositivo || !dados.aplicativo) {
      resposta += this.escolherTemplate('CLIENTE', 'coleta_info') + '\n\n';
      
      if (!dados.dispositivo) {
        resposta += this.escolherTemplate('CLIENTE', 'opcoes_dispositivo');
      } else if (!dados.aplicativo) {
        resposta += this.escolherTemplate('CLIENTE', 'opcoes_aplicativo');
      }
    } else {
      // Já tem dados, pode resolver
      resposta += this.escolherTemplate('CLIENTE', 'aguarde_resolucao');
    }

    return resposta;
  }

  // Gerar resposta para INDEFINIDOS
  gerarRespostaIndefinido() {
    return this.escolherTemplate('INDEFINIDO', 'qualificacao');
  }

  // Escolher template aleatório de uma categoria
  escolherTemplate(tipo, categoria) {
    const templates = this.templates[tipo][categoria];
    if (!templates || templates.length === 0) return '';
    
    const indice = Math.floor(Math.random() * templates.length);
    return templates[indice];
  }

  // Identificar fluxos específicos baseados em dados coletados
  identificarFluxoEspecifico(dados, mensagem) {
    const mensagemLower = mensagem.toLowerCase();

    // Fluxo específico para 9xtream com problema
    if (dados.aplicativo === '9xtream' && dados.problema) {
      return this.fluxosEspecificos['9xtream'].problema;
    }

    // Fluxo para Fire Stick
    if (dados.dispositivo === 'fire stick' && dados.problema) {
      return this.fluxosEspecificos['fire_stick'].suporte;
    }

    // Fluxo de renovação urgente
    if (mensagemLower.includes('vencendo') || mensagemLower.includes('expirou')) {
      return this.fluxosEspecificos['renovacao'].urgente;
    }

    return null;
  }

  // Analisar sentimento da mensagem
  analisarSentimento(mensagem) {
    const mensagemLower = mensagem.toLowerCase();
    
    for (const palavra of this.palavrasChave.satisfacao) {
      if (mensagemLower.includes(palavra)) {
        return 'positivo';
      }
    }
    
    for (const palavra of this.palavrasChave.insatisfacao) {
      if (mensagemLower.includes(palavra)) {
        return 'negativo';
      }
    }
    
    return 'neutro';
  }
}

module.exports = ContextualResponses;
