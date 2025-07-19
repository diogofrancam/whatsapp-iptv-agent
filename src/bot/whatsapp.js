const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Database = require('../database/database');
const Config = require('../config/config');
const Logger = require('../utils/logger');

class WhatsAppBot {
    constructor() {
        this.client = null;
        this.database = new Database();
        this.responses = Config.getBotResponses();
        this.businessInfo = Config.getBusinessInfo();
        this.isReady = false;
        
        this.initializeClient();
    }

    initializeClient() {
        const whatsappConfig = Config.getWhatsAppConfig();
        
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: whatsappConfig.clientId
            }),
            puppeteer: whatsappConfig.puppeteerOptions
        });

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // QR Code para autenticação
        this.client.on('qr', (qr) => {
            Logger.info('QR Code gerado - Escaneie com seu WhatsApp');
            console.log('📱 Escaneie o QR Code com seu WhatsApp:');
            qrcode.generate(qr, { small: true });
        });

        // Autenticação bem-sucedida
        this.client.on('authenticated', () => {
            Logger.success('Autenticação realizada com sucesso');
        });

        // Bot conectado e pronto
        this.client.on('ready', async () => {
            this.isReady = true;
            const info = this.client.info;
            Logger.success('Bot WhatsApp conectado e operacional', {
                number: info.wid.user,
                name: info.pushname
            });
            console.log('✅ Bot WhatsApp conectado com sucesso!');
            console.log('🎯 Aguardando mensagens...');
            console.log('📊 Sistema de banco de dados ativo');
            console.log('⚙️ Configurações carregadas');
        });

        // Receber mensagens
        this.client.on('message', async (message) => {
            if (!this.isReady) return;
            
            try {
                await this.handleMessage(message);
            } catch (error) {
                Logger.error('Erro ao processar mensagem', { error: error.message });
            }
        });

        // Eventos de erro e desconexão
        this.client.on('auth_failure', (msg) => {
            Logger.error('Falha na autenticação', { message: msg });
        });

        this.client.on('disconnected', (reason) => {
            this.isReady = false;
            Logger.warning('Bot desconectado', { reason });
            console.log('⚠️ Bot desconectado:', reason);
        });

        this.client.on('loading_screen', (percent, message) => {
            if (percent % 20 === 0) { // Log a cada 20%
                Logger.debug(`Carregando WhatsApp: ${percent}%`, { message });
            }
        });
    }

    async handleMessage(message) {
        // Filtros básicos
        if (message.fromMe) return;
        if (message.from.includes('@g.us')) return;
        if (!message.body || message.body.trim() === '') return;

        try {
            // Obter informações do contato
            const contact = await message.getContact();
            const phoneNumber = message.from.replace('@c.us', '');
            const userName = contact.pushname || contact.name || 'Usuário';
            const messageText = message.body.toLowerCase().trim();

            // Log da mensagem recebida
            Logger.messageReceived(phoneNumber, userName, message.body);

            // Salvar/atualizar cliente no banco
            await this.database.upsertCustomer(phoneNumber, userName);

            // Processar mensagem e gerar resposta
            const response = this.generateResponse(messageText, userName);

            // Enviar resposta
            await message.reply(response);
            
            // Log da resposta enviada
            Logger.messageSent(phoneNumber, response);

            // Salvar conversa no banco
            await this.database.saveConversation(phoneNumber, userName, message.body, response);

            // Log de sucesso
            Logger.success('Conversa processada', {
                phone: phoneNumber,
                user: userName,
                messageLength: message.body.length,
                responseLength: response.length
            });

        } catch (error) {
            Logger.error('Erro no handleMessage', {
                error: error.message,
                stack: error.stack
            });
            
            // Resposta de erro para o usuário
            try {
                await message.reply('🤖 Ops! Tive um problema técnico. Tente novamente em alguns instantes ou digite "suporte" para falar com um atendente.');
            } catch (replyError) {
                Logger.error('Erro ao enviar mensagem de erro', { error: replyError.message });
            }
        }
    }

    generateResponse(messageText, userName) {
        const responses = this.responses;
        
        // Verificar saudações
        if (this.containsKeywords(messageText, responses.greeting.keywords)) {
            return responses.greeting.response.replace('{{userName}}', userName);
        }

        // Verificar preços
        if (this.containsKeywords(messageText, responses.pricing.keywords)) {
            return responses.pricing.response;
        }

        // Verificar teste grátis
        if (this.containsKeywords(messageText, responses.trial.keywords)) {
            return responses.trial.response;
        }

        // Verificar suporte
        if (this.containsKeywords(messageText, responses.support.keywords)) {
            return responses.support.response;
        }

        // Resposta padrão
        return responses.default.response;
    }

    containsKeywords(text, keywords) {
        return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    }

    async start() {
        try {
            Logger.info('Iniciando sistema...');
            
            // Conectar banco de dados
            await this.database.connect();
            
            // Inicializar WhatsApp
            Logger.info('Inicializando cliente WhatsApp...');
            await this.client.initialize();
            
        } catch (error) {
            Logger.error('Erro ao iniciar bot', { error: error.message });
            throw error;
        }
    }

    async stop() {
        try {
            this.isReady = false;
            
            if (this.client) {
                await this.client.destroy();
                Logger.info('Cliente WhatsApp desconectado');
            }
            
            if (this.database) {
                await this.database.close();
                Logger.info('Banco de dados desconectado');
            }
            
            Logger.success('Bot encerrado com sucesso');
            console.log('🛑 Bot desconectado.');
            
        } catch (error) {
            Logger.error('Erro ao encerrar bot', { error: error.message });
        }
    }

    // Métodos auxiliares para estatísticas
    async getStats() {
        try {
            // Aqui podemos adicionar estatísticas do banco de dados
            return {
                status: this.isReady ? 'online' : 'offline',
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage()
            };
        } catch (error) {
            Logger.error('Erro ao obter estatísticas', { error: error.message });
            return null;
        }
    }
}

module.exports = WhatsAppBot;