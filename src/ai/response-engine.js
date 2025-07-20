// src/ai/response-engine.js
// Engine de Respostas Inteligentes para WhatsApp IPTV Agent

const KnowledgeBase = require('./knowledge-base');
const { logger, performanceMonitor } = require('../utils/logger');

class ResponseEngine {
    constructor() {
        this.knowledgeBase = new KnowledgeBase();
        this.conversationHistory = new Map(); // Histórico por cliente
        this.confidenceThreshold = 0.6;
        this.maxHistoryLength = 20;
        
        logger.info('🤖 Response Engine inicializado');
    }

    /**
     * Processa mensagem e gera resposta inteligente
     */
    async processMessage(message, customerId, customerData = {}) {
        const operationId = `process_${customerId}_${Date.now()}`;
        performanceMonitor.start(operationId);
        
        try {
            logger.info('📨 Processando mensagem', {
                customerId: customerId,
                messagePreview: message.substring(0, 50),
                customerData: customerData
            });

            // 1. Obter histórico da conversa
            const history = this.getConversationHistory(customerId);
            
            // 2. Detectar intenção da mensagem
            const context = this.knowledgeBase.getContext(customerId) || {};
            const intent = this.knowledgeBase.detectIntent(message, context);
            
            // 3. Classificar perfil do cliente
            const classification = this.knowledgeBase.classifyCustomer(
                history.map(h => h.message), 
                message, 
                customerData
            );
            
            // 4. Gerar resposta baseada na intenção e perfil
            const response = await this.generateIntelligentResponse(
                intent, 
                classification.profile, 
                message, 
                customerId,
                customerData
            );
            
            // 5. Validar confiança da resposta
            const shouldEscalate = !this.knowledgeBase.validateConfidence || 
                                   !this.knowledgeBase.validateConfidence(response, this.confidenceThreshold);
            
            // 6. Adicionar ao histórico
            this.addToHistory(customerId, {
                type: 'user',
                message: message,
                timestamp: new Date(),
                intent: intent,
                profile: classification.profile
            });
            
            if (!shouldEscalate) {
                this.addToHistory(customerId, {
                    type: 'bot',
                    message: response.text,
                    timestamp: new Date(),
                    confidence: response.confidence
                });
            }
            
            const processingTime = performanceMonitor.end(operationId);
            
            const result = {
                response: response,
                intent: intent,
                customerProfile: classification.profile,
                confidence: response.confidence,
                shouldEscalateToHuman: shouldEscalate,
                processingTime: processingTime,
                classification: classification
            };
            
            logger.info('✅ Mensagem processada', {
                customerId: customerId,
                intent: intent,
                profile: classification.profile,
                confidence: response.confidence,
                shouldEscalate: shouldEscalate,
                processingTime: processingTime
            });
            
            return result;
            
        } catch (error) {
            performanceMonitor.end(operationId);
            logger.error('❌ Erro ao processar mensagem:', error);
            
            return {
                response: {
                    text: "Desculpe, estou com dificuldades técnicas. Vou te transferir para um atendente humano.",
                    confidence: 0.1
                },
                intent: 'ERROR',
                customerProfile: 'UNKNOWN',
                confidence: 0.1,
                shouldEscalateToHuman: true,
                error: error.message
            };
        }
    }

    /**
     * Gera resposta inteligente baseada em intenção e perfil
     */
    async generateIntelligentResponse(intent, customerProfile, originalMessage, customerId, customerData) {
        try {
            // Obter contexto atual do cliente
            const context = this.buildResponseContext(customerId, customerData, originalMessage);
            
            // Casos especiais baseados na intenção
            switch (intent) {
                case 'GREETING':
                    return this.handleGreeting(customerProfile, context);
                    
                case 'INTEREST_CONFIRMED':
                    return this.handleInterestConfirmation(customerProfile, context);
                    
                case 'PRICING_REQUEST':
                    return this.handlePricingRequest(customerProfile, context);
                    
                default:
                    return this.handleGeneralQuestion(customerProfile, context, originalMessage);
            }
            
        } catch (error) {
            logger.error('❌ Erro ao gerar resposta inteligente:', error);
            return {
                text: "Não entendi bem sua mensagem. Pode reformular?",
                confidence: 0.3
            };
        }
    }

    /**
     * Manipuladores de intenções específicas
     */
    handleGreeting(customerProfile, context) {
        const greeting = context.isReturning ? 
            "oi #name tudo bem?\n\nsou o _Técnico_ *Pedro*\n\ncomo posso te ajudar?" :
            "oi #name tudo bem? você se interessa por *canais de tv online?*\n\nQuero te ajudar a ter acesso a *Sky, Netflix, Prime vídeo, Globo play e +65.847 canais abertos e fechados*\n\n*Tudo isso apenas instalando um aplicativo com preço promocional HOJE*\n\ndigita *EU QUERO* para ativar agora";
            
        return {
            text: this.personalizeResponse(greeting, context),
            confidence: 0.8,
            nextAction: 'await_interest_confirmation'
        };
    }

    handleInterestConfirmation(customerProfile, context) {
        const response = "onde quer instalar, tv ou celular?\n\nse for tv qual a marca?";
        
        return {
            text: this.personalizeResponse(response, context),
            confidence: 0.9,
            nextAction: 'qualify_device'
        };
    }

    handlePricingRequest(customerProfile, context) {
        const response = customerProfile === 'NEGOCIADOR' ?
            "Certo, quero que aproveite nosso *desconto HOJE*\n\n✅ _Plano *Mensal*_ de ~R$29,00~ por *R$19,99* (1 tela)\n\n✅ _Plano *3 meses*_ ~R$59,00~ por *R$49,99* (1 tela)\n\n*Aproveite já 😉*" :
            "*Como funciona* essa promoção: É um de ativação, que você *paga esse valor apenas uma única vez*\n\nDepois fica uma taxa de *R$6,99* para *suporte e manutenção*\n\n#name\n\nFica *menos de 10 centavos por dia*";
            
        return {
            text: this.personalizeResponse(response, context),
            confidence: 0.8,
            nextAction: 'await_decision'
        };
    }

    handleGeneralQuestion(customerProfile, context, originalMessage) {
        const responses = {
            FIEL: "Claro #name! Como posso te ajudar?",
            NEGOCIADOR: "Entendi #name. Me fala mais detalhes que vou ver a melhor opção pra você.",
            CAUTELOSO: "Sem problemas #name. Vou te explicar tudo direitinho. O que você gostaria de saber?",
            QUESTIONADOR: "Perfeito #name! Adoro clientes que fazem boas perguntas. Me fala exatamente o que quer saber.",
            TECNICO: "Beleza #name! Vou resolver isso rapidinho pra você. Me fala mais detalhes."
        };
        
        const fallbackResponse = responses[customerProfile] || responses.CAUTELOSO;
        
        return {
            text: this.personalizeResponse(fallbackResponse, context),
            confidence: 0.5,
            nextAction: 'await_clarification'
        };
    }

    /**
     * Personaliza resposta substituindo placeholders
     */
    personalizeResponse(text, context) {
        if (!text) return '';
        
        return text
            .replace(/#name/g, context.customerName || 'amigo')
            .replace(/#valor/g, context.price || '19,99')
            .replace(/#taxa/g, context.maintenance || '6,99');
    }

    /**
     * Constrói contexto para geração de resposta
     */
    buildResponseContext(customerId, customerData, originalMessage) {
        const history = this.getConversationHistory(customerId);
        
        return {
            customerId: customerId,
            customerName: customerData.name || 'amigo',
            isNewCustomer: !customerData.isReturning && history.length === 0,
            isReturning: customerData.isReturning || history.length > 0,
            messageCount: history.length
        };
    }

    /**
     * Gerenciamento de histórico de conversas
     */
    getConversationHistory(customerId) {
        return this.conversationHistory.get(customerId) || [];
    }

    addToHistory(customerId, entry) {
        const history = this.getConversationHistory(customerId);
        history.push(entry);
        
        // Limitar tamanho do histórico
        if (history.length > this.maxHistoryLength) {
            history.shift(); // Remove o mais antigo
        }
        
        this.conversationHistory.set(customerId, history);
    }

    /**
     * Teste do sistema
     */
    async testResponse(message, customerProfile = 'CAUTELOSO') {
        const testCustomerId = 'test_customer';
        const testData = { name: 'Teste', isReturning: false };
        
        return await this.processMessage(message, testCustomerId, testData);
    }
}

module.exports = ResponseEngine;