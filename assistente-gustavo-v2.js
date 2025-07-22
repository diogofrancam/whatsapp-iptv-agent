const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const InternalCRM = require('./src/crm/internal-crm');

class AssistenteGustavo {
  constructor() {
    console.log('🤖 Inicializando Assistente Gustavo v2.0 - Sistema Avançado...');
    
    this.crm = new InternalCRM();
    this.nome = "Gustavo";
    this.versao = "2.0";
    
    // Configurar WhatsApp
    this.client = new Client({
      authStrategy: new LocalAuth({ clientId: "gustavo-v2" }),
      puppeteer: { 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    // Controle de ofertas (1 por 24h)
    this.ultimasOfertas = new Map();
    
    // Padrões para identificar origem dos leads
    'últimas vagas', 'quantas vagas', 'restam', 'responder', 'mensagem automática'
      'vi seu anúncio', 'vem do facebook', 'vem do instagram', 'vi no face',
      'achei no google', 'vi a propaganda', 'anúncio', 'facebook', 'instagram',
      'primeira vez', 'não conheço', 'como chegou até vocês', 'vocês fazem',
      'quem são vocês', 'conheci por'
    ];
    
    this.padroesListaDisparo = [
      'recebi sua mensagem', 'vi sua promoção', 'oferta', 'promoção',
      'desconto', 'acesso exclusivo', 'planos restantes', 'oportunidade',
      'últimas vagas', 'responder', 'mensagem automática'
    ];

    // Padrões de interesse em compra
    this.padroesInteresseCompra = [
      'preço', 'valor', 'quanto', 'custa', 'plano', 'ativar', 'quero', 
      'como funciona', 'instalar', 'teste', 'promoção', 'interesse',
      'quero assinar', 'como faço', 'me interessa'
    ];

    // Padrões de problemas técnicos
    this.padroesSuporte = [
      'não funciona', 'não carrega', 'não abre', 'problema', 'erro', 
      'parou', 'travando', 'lento', 'ajuda', 'suporte', 'resolver',
      'não consigo', 'não está', 'deu problema', 'falha', 'defeito'
    ];

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.client.on('qr', (qr) => {
      console.log('🔥 ASSISTENTE GUSTAVO V2.0 - INICIANDO...');
      console.log('📱 ESCANEIE O QR CODE NO WHATSAPP:');
      console.log('====================================');
      qrcode.generate(qr, { small: true });
      console.log('====================================');
      console.log('💡 Novidades v2.0:');
      console.log('🎯 Identificação automática de origem dos leads');
      console.log('🧠 Respostas contextuais por tipo de cliente');
      console.log('⏰ Controle inteligente de ofertas (1 por 24h)');
    });

    this.client.on('ready', () => {
      console.log('🎉 ASSISTENTE GUSTAVO V2.0 ONLINE E FUNCIONAL!');
      console.log('👨‍💻 Sistema de identificação de leads: ATIVO');
      console.log('🔥 Diferenciação leads quentes vs frios: ATIVO');
      console.log('💰 Controle de ofertas inteligente: ATIVO');
      console.log('📊 CRM interno avançado: ATIVO');
      console.log('=====================================');
    });

    this.client.on('message', async (message) => {
      await this.processarMensagem(message);
    });

    this.client.on('disconnected', (reason) => {
      console.log('❌ WhatsApp desconectado:', reason);
    });
  }

  async processarMensagem(message) {
    try {
      if (message.fromMe || message.from.includes('@g.us')) return;

      const contato = message.from;
      const mensagem = message.body;
      const nome = message._data.notifyName || 'Cliente';

      console.log(`💬 [${new Date().toLocaleTimeString()}] ${nome}: ${mensagem}`);

      // Registrar no CRM
      await this.registrarConversa(contato, mensagem, 'received', nome);

      // Buscar ou criar contato
      let dadosContato = await this.crm.getContactByPhone(contato);
      const ehNovoContato = !dadosContato;
      
      if (ehNovoContato) {
        dadosContato = await this.criarNovoContato(contato, nome);
      }

      // IDENTIFICAR ORIGEM DO LEAD
      const origemLead = this.identificarOrigemLead(mensagem, dadosContato, ehNovoContato);
      console.log(`🎯 Origem detectada: ${origemLead}`);

      // Atualizar tags baseado na origem
      await this.atualizarTagsOrigem(dadosContato, origemLead);

      // Classificar tipo de atendimento
      const tipoAtendimento = this.classificarAtendimento(mensagem, dadosContato);
      console.log(`🎨 Tipo de atendimento: ${tipoAtendimento}`);
      
      let resposta = '';
      
      if (tipoAtendimento === 'VENDA') {
        resposta = await this.atenderVenda(mensagem, dadosContato, nome, origemLead);
      } else if (tipoAtendimento === 'SUPORTE') {
        resposta = await this.atenderSuporte(mensagem, dadosContato, nome);
      } else {
        resposta = await this.atenderGeral(mensagem, dadosContato, nome, origemLead);
      }

      // Enviar resposta
      await message.reply(resposta);
      await this.registrarConversa(contato, resposta, 'sent');
      
      console.log(`✅ Resposta enviada para ${nome}`);

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
    }
  }

  identificarOrigemLead(mensagem, contato, ehNovoContato) {
    const msg = mensagem.toLowerCase();
    
    // Verificar padrões de campanha externa (leads frios)
    const ehCampanhaExterna = this.padroesCampanhaExterna.some(padrao => 
      msg.includes(padrao)
    );
    
    // Verificar padrões de lista de disparo (leads quentes)
    const ehListaDisparo = this.padroesListaDisparo.some(padrao => 
      msg.includes(padrao)
    );
    
    // Lógica de classificação
    if (ehCampanhaExterna) {
      return 'CAMPANHA_EXTERNA'; // Lead frio
    }
    
    if (ehListaDisparo) {
      return 'LISTA_DISPARO'; // Lead quente
    }
    
    // Se não tem padrão específico, usar análise contextual
    if (ehNovoContato) {
      // Primeiro contato sem indicador específico
      if (msg.includes('quero') || msg.includes('interesse') || msg.includes('preço')) {
        return 'LISTA_DISPARO'; // Provavelmente vem de disparo
      } else {
        return 'CAMPANHA_EXTERNA'; // Provavelmente vem de campanha
      }
    }
    
    // Cliente existente
    return 'CLIENTE_EXISTENTE';
  }

  async atualizarTagsOrigem(contato, origem) {
    const tagsAtuais = contato.tags || [];
    let novaTag = '';
    
    switch (origem) {
      case 'CAMPANHA_EXTERNA':
        novaTag = 'Lead Frio - Campanha';
        break;
      case 'LISTA_DISPARO':
        novaTag = 'Lead Quente - Disparo';
        break;
      case 'CLIENTE_EXISTENTE':
        novaTag = 'Cliente Ativo';
        break;
    }
    
    if (novaTag && !tagsAtuais.includes(novaTag)) {
      const novasTags = [...tagsAtuais, novaTag];
      await this.crm.updateContact(contato.id, { tags: novasTags });
    }
  }

  classificarAtendimento(mensagem, contato) {
    const msg = mensagem.toLowerCase();
    
    const jaEhCliente = contato.tags && contato.tags.some(tag => 
      tag.includes('Cliente') || tag.includes('Ativo')
    );

    // Verificar se é problema técnico
    if (this.padroesSuporte.some(palavra => msg.includes(palavra))) {
      return 'SUPORTE';
    }
    
    // Verificar se é interesse em compra
    if (this.padroesInteresseCompra.some(palavra => msg.includes(palavra)) && !jaEhCliente) {
      return 'VENDA';
    }

    return 'GERAL';
  }

  async atenderVenda(mensagem, contato, nome, origem) {
    // Verificar se já recebeu oferta nas últimas 24h
    if (this.jaRecebeuOfertaHoje(contato.phone)) {
      return await this.respostaVendaFallback(mensagem, nome);
    }

    // Marcar que recebeu oferta hoje
    this.ultimasOfertas.set(contato.phone, new Date());

    const msg = mensagem.toLowerCase();
    let resposta = `Oi ${nome}, tudo bem contigo?\n\n`;
    resposta += `Sou o *Assistente Gustavo* 👨‍💻\n\n`;

    // ABORDAGEM DIFERENCIADA POR ORIGEM
    if (origem === 'CAMPANHA_EXTERNA') {
      // LEAD FRIO - Mais educativo, criar desejo
      resposta += `Que bom que chegou até nós! 😊\n\n`;
      resposta += `Deixa eu te fazer uma pergunta: *quanto você gasta por mês* com Netflix, Amazon Prime, Globoplay? 🤔\n\n`;
      resposta += `A maioria gasta *R$100+ todo mês* e ainda não tem Sky, SporTV, Premiere...\n\n`;
      resposta += `E se eu te falar que você pode ter *TUDO isso* por *menos de R$5/mês*? 😱\n\n`;
      resposta += `✅ Sky, Netflix, Disney+, Combate\n`;
      resposta += `✅ Todos os filmes do cinema\n`;
      resposta += `✅ Futebol completo (Brasileirão, Champions, Copa)\n`;
      resposta += `✅ +65.847 canais nacionais e internacionais\n\n`;
      resposta += `*Como?* Um sistema que *substitui TODAS* as suas assinaturas!\n\n`;
      resposta += `Quer que eu te mostre funcionando? Leva *só 2 minutos* para instalar! 📱`;
      
    } else if (origem === 'LISTA_DISPARO') {
      // LEAD QUENTE - Mais direto, focar na oferta
      if (msg.includes('como funciona')) {
        resposta += `Perfeita pergunta! Você chegou no *momento certo* 🔥\n\n`;
        resposta += `⚡️ *OFERTA EXCLUSIVA HOJE:*\n`;
        resposta += `2 ANOS por apenas *R$99* - ZERO mensalidade!\n\n`;
        resposta += `✅ Sky, Netflix, Disney+, Combate\n`;
        resposta += `✅ Filmes direto do cinema\n`;
        resposta += `✅ Futebol ao vivo + 65.847 canais\n`;
        resposta += `✅ Funciona em 2 telas\n\n`;
        resposta += `⏳ *ÚLTIMOS 3 PLANOS* - hoje (22/07)\n\n`;
        resposta += `Vou liberar *1 hora de teste GRÁTIS* agora mesmo!\n\n`;
        resposta += `Me fala: TV "_marca_" ou Celular? 📱`;
        
      } else {
        resposta += `Que ótimo que respondeu nossa promoção! 🔥\n\n`;
        resposta += `⚡️ *ACESSO EXCLUSIVO: 2 ANOS por R$99!*\n\n`;
        resposta += `➡️ *Pagamento ÚNICO — ZERO mensalidade*\n`;
        resposta += `➡️ *Funciona em 2 telas*\n`;
        resposta += `➡️ *Suporte + Grupo VIP incluso*\n\n`;
        resposta += `⏳ *RESTAM APENAS 3 VAGAS* - HOJE\n\n`;
        resposta += `Quer o teste de *1h GRÁTIS* agora? 🚀\n\n`;
        resposta += `Só me informar: TV "_marca_" ou Celular?`;
      }
    }

    return resposta;
  }

  async atenderSuporte(mensagem, contato, nome) {
    const msg = mensagem.toLowerCase();
    
    let resposta = `Oi ${nome}, tudo bem contigo?\n\n`;
    resposta += `Sou o *Assistente Gustavo* 👨‍💻\n\n`;
    resposta += `Vou te ajudar a resolver isso rapidinho!\n\n`;

    if (msg.includes('não funciona') || msg.includes('não carrega')) {
      resposta += `Primeiro, você já viu as instruções do *Grupo de Suporte Técnico*?\n\n`;
      resposta += `*Grupo de Suporte técnico*\n`;
      resposta += `https://chat.whatsapp.com/KPt32Gfvsi5J8HLTRMvRUU\n\n`;
      resposta += `*É importante que entre no grupo!*\n\n`;
      resposta += `Agora me informa:\n`;
      resposta += `📱 Qual aplicativo está usando?\n`;
      resposta += `📺 Onde instalou? (TV marca, celular, FireStick)\n`;
      resposta += `🔗 Qual URL está usando?`;
    } else {
      resposta += `Para te ajudar melhor, preciso saber:\n\n`;
      resposta += `📱 Qual aplicativo está usando?\n`;
      resposta += `📺 Onde instalou? (TV marca, celular, tvbox, FireStick)\n\n`;
      resposta += `Com essas informações consigo resolver rapidinho! 🚀`;
    }

    return resposta;
  }

  async atenderGeral(mensagem, contato, nome, origem) {
    let resposta = `Oi ${nome}, tudo bem contigo?\n\n`;
    resposta += `Sou o *Assistente Gustavo* 👨‍💻\n\n`;

    if (origem === 'CAMPANHA_EXTERNA') {
      resposta += `Bem-vindo! Vi que chegou até nós 😊\n\n`;
      resposta += `Em que posso te ajudar?\n\n`;
      resposta += `📺 Conhecer nossos planos de IPTV\n`;
      resposta += `💰 Ver nossas promoções\n`;
      resposta += `❓ Tirar suas dúvidas`;
    } else {
      resposta += `Em que posso te ajudar hoje?\n\n`;
      resposta += `📺 Ativar/renovar seu IPTV\n`;
      resposta += `🔧 Resolver problema técnico\n`;
      resposta += `❓ Tirar dúvida sobre os planos`;
    }

    return resposta;
  }

  jaRecebeuOfertaHoje(telefone) {
    const ultimaOferta = this.ultimasOfertas.get(telefone);
    if (!ultimaOferta) return false;
    
    const agora = new Date();
    const diff = agora - ultimaOferta;
    const horas = diff / (1000 * 60 * 60);
    
    return horas < 24;
  }

  async respostaVendaFallback(mensagem, nome) {
    let resposta = `Oi ${nome}! 😊\n\n`;
    resposta += `Vi que você tem interesse nos nossos planos!\n\n`;
    resposta += `Me informa onde gostaria de instalar primeiro:\n`;
    resposta += `TV "_marca_", Celular ou FireStick? 📱`;
    
    return resposta;
  }

  async criarNovoContato(telefone, nome) {
    return await this.crm.addContact({
      name: nome,
      phone: telefone,
      source: 'WhatsApp',
      status: 'new',
      tags: ['Lead Novo']
    });
  }

  async registrarConversa(telefone, mensagem, direção, nome = '') {
    await this.crm.addConversation(telefone, mensagem, direção, {
      type: 'text',
      timestamp: new Date().toISOString(),
      automated: direção === 'sent',
      nome: nome
    });
  }

  async iniciar() {
    console.log('🚀 Conectando Assistente Gustavo v2.0...');
    await this.client.initialize();
  }

  async parar() {
    console.log('🛑 Desligando Assistente Gustavo...');
    await this.client.destroy();
  }

  // Método para estatísticas
  gerarEstatisticas() {
    console.log('📊 ESTATÍSTICAS GUSTAVO V2.0');
    console.log(`🎯 Ofertas controladas: ${this.ultimasOfertas.size}`);
    console.log(`⏰ Sistema ativo desde: ${new Date().toLocaleString()}`);
  }
}

// Instanciar e iniciar o assistente
const gustavo = new AssistenteGustavo();

// Tratamento de sinais do sistema
process.on('SIGINT', async () => {
  console.log('\n🛑 Recebido sinal de interrupção...');
  await gustavo.parar();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Recebido sinal de terminação...');
  await gustavo.parar();
  process.exit(0);
});

// Iniciar o assistente
gustavo.iniciar().catch(error => {
  console.error('❌ Erro fatal ao iniciar:', error);
  process.exit(1);
});

// Estatísticas a cada hora
setInterval(() => {
  gustavo.gerarEstatisticas();
}, 60 * 60 * 1000);

module.exports = AssistenteGustavo;