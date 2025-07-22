const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const InternalCRM = require('./src/crm/internal-crm');

class AssistenteGustavo {
  constructor() {
    console.log('🤖 Inicializando Assistente Gustavo...');
    
    this.crm = new InternalCRM();
    this.nome = "Gustavo";
    this.cargo = "Assistente";
    
    // Configurar WhatsApp
    this.client = new Client({
      authStrategy: new LocalAuth({ clientId: "gustavo-bot" }),
      puppeteer: { 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    // Controle de ofertas (1 por 24h)
    this.ultimasOfertas = new Map();
    
    // Dados dos servidores
    this.servidores = {
      'onetv': {
        nome: 'ONE TV',
        apps: {
          smart_tv: ['ABSOLUTO PLAYER'],
          android: ['CANALPLAY', 'Via http://lojaplay.in', 'Downloader: 9223108'],
          ios: ['IPTV SMARTERS PRO'],
          firestick: ['CANALPLAY']
        }
      },
      'gohtube': {
        nome: 'GOHTUBE', 
        apps: {
          smart_tv: ['BOB Player (pago R$57)', 'Smart One', 'Duplex Player'],
          android: ['9xtream', 'xpiptv', 'vu iptv', 'absolut play'],
          ios: ['IPTV SMARTERS PRO'],
          firestick: ['9Xtream Player']
        }
      }
    };

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.client.on('qr', (qr) => {
      console.log('📱 ESCANEIE O QR CODE:');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('🎉 ASSISTENTE GUSTAVO ONLINE!');
      console.log('👨‍💻 Pronto para atender com excelência!');
    });

    this.client.on('message', async (message) => {
      await this.processarMensagem(message);
    });
  }

  async processarMensagem(message) {
    if (message.fromMe || message.from.includes('@g.us')) return;

    const contato = message.from;
    const mensagem = message.body;
    const nome = message._data.notifyName || 'Cliente';

    console.log(`💬 ${nome}: ${mensagem}`);

    // Registrar no CRM
    await this.registrarConversa(contato, mensagem, 'received', nome);

    // Buscar ou criar contato
    let dadosContato = await this.crm.getContactByPhone(contato);
    if (!dadosContato) {
      dadosContato = await this.criarNovoContato(contato, nome);
    }

    // Classificar tipo de atendimento
    const tipoAtendimento = this.classificarAtendimento(mensagem, dadosContato);
    
    let resposta = '';
    
    if (tipoAtendimento === 'VENDA') {
      resposta = await this.atenderVenda(mensagem, dadosContato, nome);
    } else if (tipoAtendimento === 'SUPORTE') {
      resposta = await this.atenderSuporte(mensagem, dadosContato, nome);
    } else {
      resposta = await this.atenderGeral(mensagem, dadosContato, nome);
    }

    // Enviar resposta
    await message.reply(resposta);
    await this.registrarConversa(contato, resposta, 'sent');
  }

  classificarAtendimento(mensagem, contato) {
    const msg = mensagem.toLowerCase();
    
    // Indicadores de problemas técnicos
    const problemasTecnicos = [
      'não funciona', 'não carrega', 'não abre', 'problema', 'erro', 
      'parou', 'travando', 'lento', 'ajuda', 'suporte', 'resolver'
    ];
    
    // Indicadores de interesse em compra
    const interesseCompra = [
      'preço', 'valor', 'quanto', 'plano', 'ativar', 'quero', 
      'como funciona', 'instalar', 'teste', 'promoção'
    ];

    // Verificar se já é cliente (tem histórico)
    const jaEhCliente = contato.tags && contato.tags.some(tag => 
      tag.includes('Cliente') || tag.includes('Ativo')
    );

    if (problemasTecnicos.some(palavra => msg.includes(palavra))) {
      return 'SUPORTE';
    }
    
    if (interesseCompra.some(palavra => msg.includes(palavra)) && !jaEhCliente) {
      return 'VENDA';
    }

    return 'GERAL';
  }

  async atenderVenda(mensagem, contato, nome) {
    // Verificar se já recebeu oferta nas últimas 24h
    if (this.jaRecebeuOfertaHoje(contato.phone)) {
      return await this.respostaVendaFallback(mensagem, nome);
    }

    // Marcar que recebeu oferta hoje
    this.ultimasOfertas.set(contato.phone, new Date());

    const msg = mensagem.toLowerCase();
    
    // Apresentação com gatilhos mentais
    let resposta = `Oi ${nome}, tudo bem contigo?\n\n`;
    resposta += `Sou o *Assistente Gustavo* 👨‍💻\n\n`;

    if (msg.includes('como funciona')) {
      // Estratégia: Mostrar problema que não conhece → Solução → Teste
      resposta += `Vou te explicar como funciona, mas antes... você sabia que está *perdendo dinheiro* pagando várias mensalidades? 💸\n\n`;
      resposta += `Netflix R$55 + Amazon Prime R$20 + Globoplay R$25 = *R$100/mês* só em 3 plataformas! 😱\n\n`;
      resposta += `Nossa solução: *TODOS os canais e streamings* em um só lugar:\n`;
      resposta += `✅ Sky, Netflix, Disney+, Combate\n`;
      resposta += `✅ Filmes direto do cinema\n`;  
      resposta += `✅ Futebol ao vivo (todos os campeonatos)\n`;
      resposta += `✅ +65.847 canais\n\n`;
      
      resposta += `⚡️ *OFERTA EXCLUSIVA HOJE:*\n`;
      resposta += `2 ANOS por apenas *R$99* - ZERO mensalidade!\n\n`;
      resposta += `Me informa onde quer instalar primeiro:\n`;
      resposta += `TV "_marca_" ou Celular? 📱`;
      
    } else if (msg.includes('preço') || msg.includes('valor') || msg.includes('quanto')) {
      resposta += `Que bom que perguntou! Você está no momento *PERFEITO* 🔥\n\n`;
      resposta += `⚡️ *ACESSO EXCLUSIVO: 2 ANOS por R$99!*\n\n`;
      resposta += `👉 Sky, Netflix, Disney+, Combate, filmes direto do cinema, futebol ao vivo!\n\n`;
      resposta += `➡️ *Funciona em 2 telas*\n`;
      resposta += `➡️ *Pagamento ÚNICO — ZERO mensalidade*\n`;
      resposta += `➡️ *Suporte Incluso + Grupo VIP*\n\n`;
      resposta += `⏳ *PLANOS RESTANTES:* 4 - HOJE (22/07)\n\n`;
      resposta += `✅ Vai perder essa? 🤔\n\n`;
      resposta += `Me informa onde quer instalar: TV "_marca_" ou Celular?`;
      
    } else {
      // Resposta padrão para interesse geral
      resposta += `Vou te ajudar a ter *TODOS os canais e streamings* sem pagar mensalidade! 🔥\n\n`;
      resposta += `Antes de te explicar, me informa:\n`;
      resposta += `Onde quer instalar? TV "_marca_" ou Celular? 📱`;
    }

    return resposta;
  }

  async atenderSuporte(mensagem, contato, nome) {
    const msg = mensagem.toLowerCase();
    
    let resposta = `Oi ${nome}, tudo bem contigo?\n\n`;
    resposta += `Sou o *Assistente Gustavo* 👨‍💻\n\n`;
    resposta += `Vou te ajudar a resolver isso rapidinho!\n\n`;

    // Verificar se mencionou servidor específico ou tentar descobrir
    const servidor = this.identificarServidor(contato);
    
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

  async atenderGeral(mensagem, contato, nome) {
    let resposta = `Oi ${nome}, tudo bem contigo?\n\n`;
    resposta += `Sou o *Assistente Gustavo* 👨‍💻\n\n`;

    if (mensagem.toLowerCase().includes('oi') || mensagem.toLowerCase().includes('olá')) {
      resposta += `Em que posso te ajudar hoje?\n\n`;
      resposta += `📺 Ativar/renovar seu IPTV\n`;
      resposta += `🔧 Resolver problema técnico\n`;
      resposta += `❓ Tirar dúvida sobre os planos`;
    } else {
      resposta += `Como posso te ajudar? 😊\n\n`;
      resposta += `Se tiver algum problema técnico ou quiser conhecer nossos planos, só falar!`;
    }

    return resposta;
  }

  async respostaVendaFallback(mensagem, nome) {
    // Resposta para quando já recebeu oferta hoje
    let resposta = `Oi ${nome}! 😊\n\n`;
    resposta += `Vi que você tem interesse nos nossos planos!\n\n`;
    resposta += `Me informa onde gostaria de instalar primeiro:\n`;
    resposta += `TV "_marca_", Celular ou FireStick? 📱`;
    
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

  identificarServidor(contato) {
    // Lógica para identificar servidor baseado no histórico
    if (contato.tags) {
      if (contato.tags.includes('ONE TV')) return 'onetv';
      if (contato.tags.includes('GOHTUBE')) return 'gohtube';
    }
    return 'onetv'; // Padrão é ONE TV
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
    console.log('🚀 Conectando Assistente Gustavo ao WhatsApp...');
    await this.client.initialize();
  }

  async parar() {
    console.log('🛑 Desligando Assistente Gustavo...');
    await this.client.destroy();
  }
}

// Inicializar Assistente Gustavo
const gustavo = new AssistenteGustavo();

// Handlers
process.on('SIGINT', async () => {
  await gustavo.parar();
  process.exit(0);
});

// Iniciar
gustavo.iniciar().catch(console.error);
