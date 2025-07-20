// src/bot/whatsapp-handler.js
// Integração WhatsApp com Sistema de IA para IPTV Agent

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const ResponseEngine = require('../ai/response-engine');
const { logger, logWhatsAppMessage, healthMonitor } = require('../utils/logger');
const config = require('../config');

class WhatsAppHandler {
    constructor() {
        this.client = null;
        this.responseEngine = new ResponseEngine();
        this.isReady = false;
        this.qrGenerated = false;
        this.customerDatabase = new Map();
        this.rateLimiter = new Map();
        
        logger.info('📱 WhatsApp Handler inicializando...');
    }

    /**
     * Inicializa o cliente WhatsApp
     */
    async initialize() {
        try {
            // Configurar cliente WhatsApp
            this.client = new Client({
                authStrategy: new LocalAuth({
                    name: config.whatsapp.sessionName
                }),
                puppeteer: {
                    headless: config.whatsapp.headless,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage'
                    ]
                }
            });

            // Configurar eventos
            this.setupEventHandlers();
            
            // Inicializar cliente
            await this.client.initialize();
            
            logger.info('🚀 WhatsApp cliente inicializado com sucesso');
            
        } catch (error) {
            logger.error('❌ Erro ao inicializar WhatsApp:', error);
            throw error;
        }
    }

    /**
     * Configura manipuladores de eventos do WhatsApp
     */
    setupEventHandlers() {
        // QR Code para autenticação
        this.client.on('qr', (qr) => {
            if (!this.qrGenerated) {
                console.log('\n🔗 Escaneie o QR Code abaixo com seu WhatsApp:\n');
                qrcode.generate(qr, { small: true });
                console.log('\n📱 Abra o WhatsApp > Menu (3 pontos) > Aparelhos conectados > Conectar um aparelho\n');
                this.qrGenerated = true;
            }
        });

        // Cliente pronto
        this.client.on('ready', () => {
            this.isReady = true;
            const clientInfo = this.client.info;
            
            logger.info('✅ WhatsApp conectado com sucesso!', {
                number: clientInfo.wid.user,
                name: clientInfo.pushname,
                platform: clientInfo.platform
            });
            
            console.log(`\n🎉 Bot IPTV conectado ao WhatsApp!`);
            console.log(`📞 Número: +${clientInfo.wid.user}`);
            console.log(`👤 Nome: ${clientInfo.pushname}`);
            console.log(`🤖 Status: Aguardando mensagens...\n`);
        });

        // Recebimento de mensagens
        this.client.on('message', async (message) => {
            await this.handleIncomingMessage(message);
        });

        // Mudanças de estado da autenticação
        this.client.on('auth_failure', () => {
            logger.error('❌ Falha na autenticação WhatsApp');
            console.log('\n❌ Falha na autenticação. Delete a pasta .wwebjs_auth e tente novamente.\n');
        });

        this.client.on('authenticated', () => {
            logger.info('🔐 WhatsApp autenticado com sucesso');
            console.log('\n🔐 Autenticação realizada com sucesso!\n');
        });

        // Desconexão
        this.client.on('disconnected', (reason) => {
            logger.warn('🔌 WhatsApp desconectado:', reason);
            this.isReady = false;
            console.log('\n🔌 WhatsApp desconectado. Tentando reconectar...\n');
        });
    }

    /**
     * Manipula mensagens recebidas
     */
    async handleIncomingMessage(message) {
        try {
            // Filtrar mensagens próprias e de grupos
            if (message.fromMe || message.isGroupMsg) {
                return;
            }

            // Extrair informações da mensagem
            const customerId = message.from;
            const messageText = message.body?.trim();
            const contact = await message.getContact();
            
            // Validar mensagem
            if (!messageText || messageText.length === 0) {
                logger.info('📨 Mensagem vazia ignorada', { customerId });
                return;
            }

            // Rate limiting
            if (this.isRateLimited(customerId)) {
                logger.warn('⚠️ Cliente em rate limit', { customerId });
                return;
            }

            // Log da mensagem recebida
            logWhatsAppMessage('incoming', customerId, 'bot', messageText);
            healthMonitor.incrementMessagesReceived();

            logger.info('📨 Mensagem recebida', {
                from: customerId,
                contact: contact.name || contact.pushname || 'Desconhecido',
                message: messageText.substring(0, 100),
                type: message.type
            });

            // Simular digitação
            await this.simulateTyping(message.from);

            // Obter dados do cliente
            const customerData = await this.getCustomerData(customerId, contact);

            // Processar mensagem com IA
            const response = await this.responseEngine.processMessage(
                messageText, 
                customerId, 
                customerData
            );

            // Enviar resposta
            await this.sendResponse(message, response);

            // Verificar se precisa escalar para humano
            if (response.shouldEscalateToHuman) {
                await this.escalateToHuman(message, response);
            }

        } catch (error) {
            logger.error('❌ Erro ao processar mensagem:', error);
            healthMonitor.incrementErrors();
            
            // Enviar mensagem de erro amigável
            try {
                await this.sendErrorMessage(message);
            } catch (sendError) {
                logger.error('❌ Erro ao enviar mensagem de erro:', sendError);
            }
        }
    }

    /**
     * Simula digitação para parecer mais humano
     */
    async simulateTyping(chatId) {
        try {
            const chat = await this.client.getChatById(chatId);
            await chat.sendStateTyping();
            await this.sleep(2000); // 2 segundos
        } catch (error) {
            logger.error('❌ Erro ao simular digitação:', error);
        }
    }

    /**
     * Envia resposta baseada no resultado da IA
     */
    async sendResponse(originalMessage, response) {
        try {
            const chatId = originalMessage.from;
            
            // Delay antes de responder (mais humano)
            await this.sleep(1000);

            // Enviar mensagem principal
            if (response.response.text) {
                await this.client.sendMessage(chatId, response.response.text);
                
                logWhatsAppMessage('outgoing', 'bot', chatId, response.response.text);
                healthMonitor.incrementMessagesSent();
                
                logger.info('📤 Resposta enviada', {
                    to: chatId,
                    intent: response.intent,
                    profile: response.customerProfile,
                    confidence: response.confidence,
                    message: response.response.text.substring(0, 100)
                });
            }

            // Atualizar rate limiter
            this.updateRateLimit(chatId);

        } catch (error) {
            logger.error('❌ Erro ao enviar resposta:', error);
            throw error;
        }
    }

    /**
     * Escalação para atendimento humano
     */
    async escalateToHuman(originalMessage, response) {
        try {
            const chatId = originalMessage.from;
            const contact = await originalMessage.getContact();
            
            logger.info('🚨 Escalando para atendimento humano', {
                customerId: chatId,
                customerName: contact.name || contact.pushname,
                reason: 'Baixa confiança na resposta',
                confidence: response.confidence,
                intent: response.intent
            });

            const escalationMessage = `
🚨 *Transferindo para atendimento especializado*

Olá ${contact.name || 'amigo'}! 

Vou te conectar com um de nossos especialistas para te atender da melhor forma possível.

⏰ *Aguarde um momento que logo alguém irá te atender*

_Horário de atendimento: 08h às 22h_
            `.trim();

            await this.client.sendMessage(chatId, escalationMessage);

        } catch (error) {
            logger.error('❌ Erro ao escalar para humano:', error);
        }
    }

    /**
     * Obtém dados do cliente
     */
    async getCustomerData(customerId, contact) {
        try {
            // Verificar cache primeiro
            const cached = this.customerDatabase.get(customerId);
            if (cached && Date.now() - cached.lastUpdate < 3600000) { // 1 hora
                return cached.data;
            }

            // Coletar dados do contato
            const customerData = {
                id: customerId,
                name: contact.name || contact.pushname || contact.verifiedName,
                number: contact.number,
                isReturning: cached !== undefined,
                lastInteraction: cached?.data?.lastInteraction,
                isBlocked: contact.isBlocked,
                isBusiness: contact.isBusiness,
                hasComplaints: false
            };

            // Atualizar cache
            this.customerDatabase.set(customerId, {
                data: customerData,
                lastUpdate: Date.now()
            });

            return customerData;

        } catch (error) {
            logger.error('❌ Erro ao obter dados do cliente:', error);
            return {
                id: customerId,
                name: 'Cliente',
                isReturning: false
            };
        }
    }

    /**
     * Controle de rate limiting
     */
    isRateLimited(customerId) {
        const now = Date.now();
        const limit = this.rateLimiter.get(customerId);
        
        if (!limit) return false;
        
        // Máximo 5 mensagens por minuto por cliente
        if (limit.count >= 5 && now - limit.firstMessage < 60000) {
            return true;
        }
        
        // Reset se passou 1 minuto
        if (now - limit.firstMessage >= 60000) {
            this.rateLimiter.delete(customerId);
            return false;
        }
        
        return false;
    }

    updateRateLimit(customerId) {
        const now = Date.now();
        const existing = this.rateLimiter.get(customerId);
        
        if (existing) {
            existing.count++;
            existing.lastMessage = now;
        } else {
            this.rateLimiter.set(customerId, {
                count: 1,
                firstMessage: now,
                lastMessage: now
            });
        }
    }

    /**
     * Envia mensagem de erro amigável
     */
    async sendErrorMessage(originalMessage) {
        try {
            const errorMessage = `
🔧 *Ops! Tivemos um probleminha técnico*

Desculpe, estou passando por uma pequena dificuldade técnica.

🕐 *Tente novamente em alguns segundos*

Se o problema persistir, vou te conectar com nosso suporte especializado.

_Obrigado pela paciência!_ 😊
            `.trim();

            await this.client.sendMessage(originalMessage.from, errorMessage);
            
        } catch (error) {
            logger.error('❌ Erro crítico ao enviar mensagem de erro:', error);
        }
    }

    /**
     * Utilitários
     */
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Verifica se o bot está conectado
     */
    isConnected() {
        return this.isReady && this.client && this.client.info;
    }

    /**
     * Finaliza conexão
     */
    async destroy() {
        try {
            if (this.client) {
                await this.client.destroy();
                logger.info('🛑 WhatsApp cliente finalizado');
            }
        } catch (error) {
            logger.error('❌ Erro ao finalizar cliente:', error);
        }
    }
}

module.exports = WhatsAppHandler;