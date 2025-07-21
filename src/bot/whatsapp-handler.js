const { Client } = require('whatsapp-web.js');
const InternalCRM = require('../crm/internal-crm');
const ResponseEngine = require('../ai/response-engine');

class WhatsAppHandler {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });
    
    this.crm = new InternalCRM();
    this.responseEngine = new ResponseEngine();
    this.isReady = false;
    
    this.setupEventHandlers();
    console.log('🤖 WhatsApp Handler inicializado com CRM interno');
  }

  setupEventHandlers() {
    // Evento: Cliente pronto
    this.client.on('ready', () => {
      console.log('✅ WhatsApp Bot conectado e funcionando!');
      console.log('🔗 Usando CRM interno (substituindo Waseller)');
      this.isReady = true;
    });

    // Evento: QR Code para autenticação
    this.client.on('qr', (qr) => {
      console.log('📱 Escaneie o QR Code no WhatsApp Web:');
      console.log(qr);
    });

    // Evento: Mensagem recebida
    this.client.on('message', async (message) => {
      if (this.isReady) {
        await this.handleMessage(message);
      }
    });

    // Evento: Mensagem enviada
    this.client.on('message_create', async (message) => {
      if (message.fromMe && this.isReady) {
        await this.handleSentMessage(message);
      }
    });

    // Evento: Cliente autenticado
    this.client.on('authenticated', () => {
      console.log('🔐 WhatsApp autenticado com sucesso');
    });

    // Evento: Erro de autenticação
    this.client.on('auth_failure', (msg) => {
      console.error('❌ Falha na autenticação:', msg);
    });

    // Evento: Cliente desconectado
    this.client.on('disconnected', (reason) => {
      console.log('⚠️ WhatsApp desconectado:', reason);
    });
  }

  async handleMessage(message) {
    try {
      const contact = message.from;
      const messageBody = message.body;
      const messageType = message.type;

      console.log(`📩 Mensagem recebida de ${contact}: ${messageBody.substring(0, 50)}...`);

      // Registrar conversa no CRM
      await this.crm.addConversation(contact, messageBody, 'received', {
        type: messageType,
        timestamp: new Date(message.timestamp * 1000).toISOString(),
        messageId: message.id._serialized
      });

      // Verificar se é novo contato
      let contactData = await this.crm.getContactByPhone(contact);
      
      if (!contactData) {
        const whatsappContact = await message.getContact();
        
        contactData = await this.crm.addContact({
          name: whatsappContact.pushname || whatsappContact.shortName || 'Cliente',
          phone: contact,
          source: 'WhatsApp',
          status: 'new'
        });

        console.log(`👤 Novo contato criado: ${contactData.name}`);
      }

      // Gerar resposta inteligente
      const responseData = await this.responseEngine.generateResponse(messageBody, contactData);
      
      if (responseData && responseData.message) {
        await message.reply(responseData.message);
        
        // Registrar resposta no CRM
        await this.crm.addConversation(contact, responseData.message, 'sent', {
          type: 'text',
          automated: true,
          confidence: responseData.confidence || 0,
          intent: responseData.intent || 'unknown'
        });

        // Atualizar status do contato se necessário
        if (responseData.updateContact) {
          await this.crm.updateContact(contactData.id, responseData.updateContact);
        }

        console.log(`🤖 Resposta enviada para ${contact}`);
      }

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
    }
  }

  async handleSentMessage(message) {
    try {
      const contact = message.to;
      const messageBody = message.body;

      // Registrar mensagem enviada manualmente
      await this.crm.addConversation(contact, messageBody, 'sent', {
        type: message.type,
        timestamp: new Date(message.timestamp * 1000).toISOString(),
        messageId: message.id._serialized,
        automated: false
      });

      console.log(`📤 Mensagem enviada para ${contact} registrada no CRM`);

    } catch (error) {
      console.error('❌ Erro ao registrar mensagem enviada:', error);
    }
  }

  async start() {
    console.log('🚀 Iniciando WhatsApp Bot...');
    await this.client.initialize();
  }

  async stop() {
    console.log('🛑 Parando WhatsApp Bot...');
    await this.client.destroy();
  }

  // Métodos de gestão do CRM
  async getCRMStats() {
    return await this.crm.getStats();
  }

  async searchContacts(query) {
    return await this.crm.searchContacts(query);
  }

  async exportCRMData() {
    return await this.crm.exportData();
  }
}

module.exports = WhatsAppHandler;
