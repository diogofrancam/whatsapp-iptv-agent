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
            console.log('DEBUG: Iniciando detecção de intenção...');
            const context = this.knowledgeBase.getContext ? this.knowledgeBase.getContext(customerId) : {};
            console.log('DEBUG: Context obtido:', context);
            
            const intent = this.knowledgeBase.detectIntent(message, context);
            console.log('DEBUG: Intent detectado:', intent);
            
            // 3. Classificar perfil do cliente
            console.log('DEBUG: Iniciando classificação...');
            const classification = this.knowledgeBase.classifyCustomer(
                history.map(h => h.message), 
                message, 
                customerData
            );
            console.log('DEBUG: Classification:', classification);
            
            // 4. Gerar resposta baseada na intenção e perfil
            const response = await this.generateIntelligentResponse(
                intent, 
                classification.profile, 
                message, 
                customerId,
                customerData
            );
            
            // 5. Validar confiança da resposta
            const shouldEscalate = response.confidence < 0.6; // Escalar apenas se confidence muito baixa
            
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
   /**
     * Gera resposta inteligente baseada em intenção e perfil
     */
    async generateIntelligentResponse(intent, customerProfile, originalMessage, customerId, customerData) {
        try {
            // Obter contexto atual do cliente
            const context = this.buildResponseContext(customerId, customerData, originalMessage);
            
            // Obter resposta da base de conhecimento
            let response = this.knowledgeBase.responses[intent];
            
            if (!response) {
                // Fallback para intenções não encontradas
                response = {
                    text: "Não entendi bem. Pode reformular sua pergunta?",
                    confidence: 0.3
                };
            } else {
                // Processar resposta baseada no dispositivo se necessário
                response = this.processDeviceSpecificResponse(response, originalMessage, context);
                
                // Personalizar resposta
                if (response.text) {
                    response.text = this.personalizeResponse(response.text, context);
                }
            }
            
            return response;
            
        } catch (error) {
            logger.error('❌ Erro ao gerar resposta inteligente:', error);
            return {
                text: "Desculpe, tive um problema técnico. Pode tentar novamente?",
                confidence: 0.3
            };
        }
    }

    /**
     * Processa respostas específicas por dispositivo
     */
    processDeviceSpecificResponse(response, originalMessage, context) {
        // Se é uma resposta de dispositivo, escolher a variação correta
        if (typeof response === 'object' && response.samsung) {
            const text = originalMessage.toLowerCase();
            
            if (text.includes('samsung') || text.includes('lg')) {
                return response.samsung;
            } else if (text.includes('android') || text.includes('celular')) {
                return response.android;
            } else {
                return response.default || response.samsung;
            }
        }
        
        return response;
    }

    /**
     * Personaliza resposta substituindo placeholders
     */
    personalizeResponse(text, context) {
        if (!text) return '';
        
        return text
            .replace(/#name/g, context.customerName || 'amigo')
            .replace(/#valor/g, context.price || '34,99')
            .replace(/#taxa/g, context.maintenance || '6,99');
    }

    /**
     * Constrói contexto para geração de resposta
     */
    buildResponseContext(customerId, customerData, originalMessage) {
        const history = this.getConversationHistory(customerId);
        
        // Detectar dispositivo mencionado na mensagem
        let device = 'default';
        const text = originalMessage.toLowerCase();
        if (text.includes('samsung') || text.includes('lg')) {
            device = 'samsung';
        } else if (text.includes('android') || text.includes('celular')) {
            device = 'android';
        }
        
        return {
            customerId: customerId,
            customerName: customerData.name || 'amigo',
            isNewCustomer: !customerData.isReturning && history.length === 0,
            isReturning: customerData.isReturning || history.length > 0,
            messageCount: history.length,
            device: device,
            price: '34,99',
            maintenance: '6,99'
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