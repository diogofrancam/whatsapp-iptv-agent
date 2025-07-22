const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const InternalCRM = require('./src/crm/internal-crm');
const LeadClassifier = require('./src/ai/lead-classifier');
const ContextualResponses = require('./src/ai/contextual-responses');
const HandoverSystem = require('./src/ai/handover-system');
const AnalyticsSystem = require('./src/ai/analytics-system');

class WhatsAppIPTVBot {
  constructor() {
    console.log('🤖 Inicializando WhatsApp IPTV Bot...');
    
    // Inicializar componentes
    this.crm = new InternalCRM();
    this.classifier = new LeadClassifier();
    this.responses = new ContextualResponses();
    this.handover = new HandoverSystem();
    this.analytics = new AnalyticsSystem();
    
    // Configurar WhatsApp Client
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: false, // Mostra o navegador
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    // Estados de conversação
    this.estadosConversa = new Map();
    
    // Métricas em tempo real
    this.metricas = {
      mensagensHoje: 0,
      leadsCriados: 0,
      clientesAtendidos: 0,
      transferenciasRealizadas: 0,
      tempoInicioBot: new Date()
    };

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // QR Code para autenticação
    this.client.on('qr', (qr) => {
      console.log('📱 ESCANEIE O QR CODE NO SEU CELULAR:');
      console.log('=====================================');
      qrcode.generate(qr, { small: true });
      console.log('=====================================');
      console.log('1. Abra o WhatsApp no seu celular');
      console.log('2. Toque em Menu > WhatsApp Web');
      console.log('3. Escaneie o código acima');
    });

    // Bot conectado e pronto
    this.client.on('ready', () => {
      console.log('');
      console.log('🎉 ===== BOT CONECTADO COM SUCESSO! =====');
      console.log('🤖 WhatsApp IPTV Agent está ONLINE!');
      console.log('🔥 Sistema de IA 100% funcional!');
      console.log('📊 Analytics ativado!');
      console.log('🎯 Pronto para atender clientes!');
      console.log('=====================================');
      
      // Mostrar métricas iniciais
      this.mostrarDashboard();
      
      // Configurar dashboard atualizado a cada 30 segundos
      setInterval(() => {
        this.mostrarDashboard();
      }, 30000);
    });

    // Mensagem recebida
    this.client.on('message', async (message) => {
      await this.processarMensagem(message);
    });

    // Mensagem criada (enviadas)
    this.client.on('message_create', async (message) => {
      if (message.fromMe) {
        await this.registrarMensagemEnviada(message);
      }
    });

    // Cliente desconectado
    this.client.on('disconnected', (reason) => {
      console.log('⚠️ Bot desconectado:', reason);
    });

    // Erro de autenticação
    this.client.on('auth_failure', (msg) => {
      console.log('❌ Falha na autenticação:', msg);
    });
  }

  async processarMensagem(message) {
    try {
      // Ignorar mensagens do próprio bot
      if (message.fromMe) return;
      
      // Ignorar grupos (opcional)
      if (message.from.includes('@g.us')) return;

      const contato = message.from;
      const mensagem = message.body;
      const nomeContato = message._data.notifyName || 'Cliente';

      console.log(`\n📩 NOVA MENSAGEM: ${nomeContato} (${contato})`);
      console.log(`💬 Mensagem: "${mensagem}"`);

      this.metricas.mensagensHoje++;

      // Registrar no CRM
      await this.crm.addConversation(contato, mensagem, 'received', {
        type: message.type,
        timestamp: new Date(message.timestamp * 1000).toISOString(),
        nomeContato: nomeContato
      });

      // Buscar ou criar contato
      let dadosContato = await this.crm.getContactByPhone(contato);
      if (!dadosContato) {
        dadosContato = await this.crm.addContact({
          name: nomeContato,
          phone: contato,
          source: 'WhatsApp',
          status: 'new'
        });
        this.metricas.leadsCriados++;
        console.log(`👤 Novo contato criado: ${nomeContato}`);
      }

      // Buscar histórico de conversas
      const historico = await this.crm.getConversationsByPhone(contato);

      // Verificar se precisa de transferência primeiro
      const estadoAtual = this.estadosConversa.get(contato) || 'verificar';
      
      if (estadoAtual.startsWith('transferencia_')) {
        await this.processarTransferencia(message, dadosContato, historico);
        return;
      }

      // Processar com sistema de handover
      const handoverResult = this.handover.processarHandover(
        mensagem, 
        dadosContato, 
        historico,
        { tipo: 'verificacao', confianca: 80 },
        'verificar'
      );

      if (handoverResult.precisa_transferir) {
        console.log(`🔄 TRANSFERÊNCIA DETECTADA: ${handoverResult.tipo_transferencia}`);
        await this.iniciarProcessoTransferencia(message, dadosContato, handoverResult);
        return;
      }

      // Processar com IA normal
      await this.processarComIA(message, dadosContato, historico);

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      await message.reply('Desculpe, houve um erro interno. Em instantes um atendente entrará em contato!');
    }
  }

  async processarComIA(message, dadosContato, historico) {
    console.log('🧠 Processando com IA...');

    // Gerar resposta contextual
    const resposta = this.responses.gerarResposta(
      message.body,
      dadosContato,
      historico
    );

    console.log(`🎯 Classificação: ${resposta.classificacao.tipo} (${resposta.classificacao.confianca}%)`);
    console.log(`⚡ Prioridade: ${resposta.prioridade}`);
    console.log(`📊 Dados coletados: ${JSON.stringify(resposta.dados_coletados)}`);

    // Atualizar tags do contato
    if (resposta.tags_sugeridas.length > 0) {
      const tagsAtuais = dadosContato.tags || [];
      const novasTags = [...new Set([...tagsAtuais, ...resposta.tags_sugeridas])];
      await this.crm.updateContact(dadosContato.id, { tags: novasTags });
    }

    // Enviar resposta
    await message.reply(resposta.mensagem);
    
    // Registrar resposta no CRM
    await this.crm.addConversation(dadosContato.phone, resposta.mensagem, 'sent', {
      type: 'text',
      automated: true,
      confidence: resposta.classificacao.confianca,
      classificacao: resposta.classificacao.tipo
    });

    console.log('✅ Resposta enviada com sucesso!');

    // Enviar pergunta de follow-up se houver
    if (resposta.proxima_pergunta) {
      setTimeout(async () => {
        await message.reply(resposta.proxima_pergunta);
        await this.crm.addConversation(dadosContato.phone, resposta.proxima_pergunta, 'sent', {
          type: 'text',
          automated: true,
          followUp: true
        });
      }, 2000);
    }

    // Atualizar métricas
    if (resposta.classificacao.tipo === 'CLIENTE') {
      this.metricas.clientesAtendidos++;
    }
  }

  async iniciarProcessoTransferencia(message, dadosContato, handoverResult) {
    console.log(`🔄 Iniciando transferência: ${handoverResult.tipo_transferencia}`);
    
    this.metricas.transferenciasRealizadas++;
    
    // Salvar estado da conversa
    this.estadosConversa.set(message.from, `transferencia_${handoverResult.tipo_transferencia}`);
    
    // Enviar mensagem de coleta
    await message.reply(handoverResult.mensagem_cliente);
    
    // Registrar no CRM
    await this.crm.addConversation(dadosContato.phone, handoverResult.mensagem_cliente, 'sent', {
      type: 'text',
      automated: true,
      transferencia: handoverResult.tipo_transferencia
    });
    
    // Simular notificação para atendente (implementar conforme necessário)
    console.log('📞 NOTIFICAÇÃO PARA ATENDENTE:');
    console.log(`Tipo: ${handoverResult.tipo_transferencia}`);
    console.log(`Cliente: ${dadosContato.name}`);
    console.log(`Urgência: ${handoverResult.urgencia}`);
  }

  async processarTransferencia(message, dadosContato, historico) {
    // Processar dados coletados para transferência
    const estadoTransferencia = this.estadosConversa.get(message.from);
    
    // Simular coleta completada
    console.log('📝 Coletando dados para transferência...');
    
    // Finalizar transferência
    const mensagemFinal = "Perfeito! Agora vou conectar você com nosso especialista que vai cuidar do seu caso pessoalmente. Aguarde um momento! 👨‍💻";
    
    await message.reply(mensagemFinal);
    
    // Limpar estado
    this.estadosConversa.delete(message.from);
    
    console.log('✅ Transferência realizada com sucesso!');
  }

  async registrarMensagemEnviada(message) {
    // Registrar mensagens enviadas manualmente
    if (!message.body.startsWith('[BOT]')) {
      await this.crm.addConversation(message.to, message.body, 'sent', {
        type: message.type,
        automated: false,
        timestamp: new Date(message.timestamp * 1000).toISOString()
      });
    }
  }

  mostrarDashboard() {
    console.clear();
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║                 🤖 WHATSAPP IPTV BOT DASHBOARD           ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║ 📊 Status: ONLINE 🟢        Uptime: ${this.getUptime()}    ║`);
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║ 📩 Mensagens hoje: ${String(this.metricas.mensagensHoje).padEnd(8)} 🎯 Leads criados: ${String(this.metricas.leadsCriados).padEnd(8)} ║`);
    console.log(`║ 👥 Clientes atendidos: ${String(this.metricas.clientesAtendidos).padEnd(4)} 🔄 Transferências: ${String(this.metricas.transferenciasRealizadas).padEnd(6)} ║`);
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║ 🧠 IA: ATIVA | 📊 Analytics: ATIVA | 🔄 Handover: ATIVO  ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║ 💡 Comandos:                                              ║');
    console.log('║ - Ctrl+C: Parar bot                                      ║');
    console.log('║ - Digite "stats": Ver estatísticas completas             ║');
    console.log('║ - Digite "relatorio": Gerar relatório                    ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
  }

  getUptime() {
    const uptime = Date.now() - this.metricas.tempoInicioBot.getTime();
    const horas = Math.floor(uptime / (1000 * 60 * 60));
    const minutos = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${horas}h${minutos}m`;
  }

  async gerarRelatorioCompleto() {
    console.log('📊 Gerando relatório completo...');
    const relatorio = await this.analytics.gerarRelatorioCompleto();
    
    console.log('\n📈 RELATÓRIO EXECUTIVO:');
    console.log('======================');
    console.log(`📞 Total contatos: ${relatorio.resumo_executivo.total_contatos}`);
    console.log(`🆕 Novos leads: ${relatorio.resumo_executivo.novos_leads}`);
    console.log(`👥 Clientes ativos: ${relatorio.resumo_executivo.clientes_ativos}`);
    console.log(`💬 Total interações: ${relatorio.resumo_executivo.total_interacoes}`);
    console.log(`🤖 Taxa automação: ${relatorio.metricas_detalhadas.performance_bot.taxa_automacao}`);
    
    return relatorio;
  }

  async iniciar() {
    console.log('🚀 Iniciando conexão com WhatsApp...');
    await this.client.initialize();
  }

  async parar() {
    console.log('🛑 Parando bot...');
    await this.client.destroy();
    process.exit(0);
  }
}

// Inicializar bot
const bot = new WhatsAppIPTVBot();

// Handlers de processo
process.on('SIGINT', async () => {
  await bot.parar();
});

// Comandos via terminal
process.stdin.on('data', async (data) => {
  const comando = data.toString().trim();
  
  if (comando === 'stats') {
    console.log('\n📊 ESTATÍSTICAS DETALHADAS:');
    console.log(`Mensagens processadas: ${bot.metricas.mensagensHoje}`);
    console.log(`Leads criados: ${bot.metricas.leadsCriados}`);
    console.log(`Clientes atendidos: ${bot.metricas.clientesAtendidos}`);
    console.log(`Transferências: ${bot.metricas.transferenciasRealizadas}`);
    console.log('');
  } else if (comando === 'relatorio') {
    await bot.gerarRelatorioCompleto();
  }
});

// Iniciar o bot
bot.iniciar().catch(console.error);
