// src/ai/knowledge-base.js
// Base de Conhecimento - Estilo Pedro IPTV
// Baseado em 18 conversas reais analisadas

const { logger } = require('../utils/logger');

class KnowledgeBase {
    constructor() {
        this.customerProfiles = this.initCustomerProfiles();
        this.responses = this.initResponses();
        this.technicalKnowledge = this.initTechnicalKnowledge();
        this.pricingStrategies = this.initPricingStrategies();
        this.salesFlows = this.initSalesFlows();
        this.contextMemory = new Map(); // Memória de contexto por cliente
        
        logger.info('📚 Base de Conhecimento inicializada com 5 perfis de clientes');
    }

    // CLASSIFICAÇÃO DE PERFIS DE CLIENTES
    initCustomerProfiles() {
        return {
            FIEL: {
                characteristics: ['sempre paga', 'indica amigos', 'não questiona preços'],
                keywords: ['quero renovar', 'filho quer', 'vou indicar', 'manda o pix', 'renova ai'],
                approach: 'direto_e_cordial',
                offer_strategy: 'antecipacao_com_bonus',
                probability_threshold: 0.8,
                response_style: 'objetivo'
            },
            NEGOCIADOR: {
                characteristics: ['questiona preços', 'quer descontos', 'compara valores'],
                keywords: ['muito caro', 'desconto', 'promocao', 'valor', 'barato', 'ta caro'],
                approach: 'flexibilidade_com_justificativa',
                offer_strategy: 'mostrar_valor_vs_custo',
                probability_threshold: 0.7,
                response_style: 'persuasivo'
            },
            CAUTELOSO: {
                characteristics: ['quer testar antes', 'demora para decidir', 'faz muitas perguntas'],
                keywords: ['testar', 'experimentar', 'como funciona', 'depois decido', 'vou pensar'],
                approach: 'paciencia_e_demonstracao',
                offer_strategy: 'teste_gratis_e_persistencia',
                probability_threshold: 0.6,
                response_style: 'educativo'
            },
            QUESTIONADOR: {
                characteristics: ['quer todos os detalhes', 'confirma tudo', 'técnico'],
                keywords: ['duas telas', 'como é', 'vai lembrar', 'funciona como', 'explica'],
                approach: 'explicacao_detalhada',
                offer_strategy: 'transparencia_total',
                probability_threshold: 0.75,
                response_style: 'detalhado'
            },
            TECNICO: {
                characteristics: ['conhece o sistema', 'reclama de bugs', 'sabe configurar'],
                keywords: ['url mudou', 'travando', 'nao ta pegando', 'reinstalar', 'app', 'login'],
                approach: 'suporte_especializado',
                offer_strategy: 'foco_na_estabilidade',
                probability_threshold: 0.85,
                response_style: 'tecnico'
            }
        };
    }

    // RESPOSTAS CONTEXTUAIS POR SITUAÇÃO
    initResponses() {
        return {
            // SAUDAÇÃO E ABORDAGEM INICIAL
            GREETING: {
                cold_prospect: {
                    text: "oi #name tudo bem? você se interessa por *canais de tv online?*\n\nQuero te ajudar a ter acesso a *Sky, Netflix, Prime vídeo, Globo play e +65.847 canais abertos e fechados e + filmes direto do cinema*\n\n👉 *+ TODOS OS CAMPEONATOS NACIONAL E INTERNACIONAL*\n\n*Tudo isso apenas instalando um aplicativo com preço promocional HOJE*\n\nDe ~RS69,99~ por apenas *R$34,99* *SEM MENSALIDADE*",
                    followup: "digita *EU QUERO* para ativar agora\n\n_ativando *HOJE* ganhe *+1 acesso grátis*_",
                    confidence: 0.9
                },
                warm_prospect: {
                    text: "oi #name tudo bem?\n\nvi que você demonstrou interesse nos nossos canais de TV\n\nconsegue instalar hoje?",
                    followup: "tenho uma promoção especial para você",
                    confidence: 0.85
                },
                returning_customer: {
                    text: "oi #name tudo bem?\n\nsou o _Técnico_ *Pedro*",
                    followup: "como posso te ajudar?",
                    confidence: 0.95
                }
            }
        };
    }

    // CONHECIMENTO TÉCNICO
    initTechnicalKnowledge() {
        return {
            DEVICES: {
                'smart_tv_lg_samsung': {
                    name: 'Smart TV LG/Samsung',
                    primary_apps: ['ABSOLUTO PLAYER'],
                    installation: "Acesse a loja de aplicativos da sua TV.\n\nBusque por *\"ABSOLUTO PLAYER\"* e instale.\n\nAbra o app e insira seu usuário e senha."
                }
            }
        };
    }

    // ESTRATÉGIAS DE PREÇOS
    initPricingStrategies() {
        return {
            STANDARD_PRICES: {
                monthly: { 
                    activation: 19.99, 
                    maintenance: 4.99, 
                    screens: 1,
                    description: "Plano Mensal"
                }
            }
        };
    }

    // FLUXOS DE VENDAS
    initSalesFlows() {
        return {
            COLD_PROSPECT: {
                steps: ['greeting_cold', 'qualification_device', 'pricing_presentation'],
                estimated_time: '15-30 minutos'
            }
        };
    }

    // MÉTODO PRINCIPAL - CLASSIFICAR CLIENTE
    classifyCustomer(messageHistory = [], currentMessage = '', customerData = {}) {
        try {
            const text = currentMessage.toLowerCase();
            const profiles = this.customerProfiles;
            let scores = {};
            
            // Inicializar scores
            Object.keys(profiles).forEach(profile => {
                scores[profile] = 0;
            });
            
            // Analisar palavras-chave
            for (let profile in profiles) {
                profiles[profile].keywords.forEach(keyword => {
                    if (text.includes(keyword.toLowerCase())) {
                        scores[profile] += 2;
                    }
                });
            }
            
            // Retornar perfil com maior pontuação
            const topProfile = Object.keys(scores).reduce((a, b) => 
                scores[a] > scores[b] ? a : b
            );
            
            const confidence = scores[topProfile] / 5;
            
            return {
                profile: topProfile,
                confidence: Math.min(confidence, 1),
                scores: scores
            };
            
        } catch (error) {
            logger.error('❌ Erro ao classificar cliente:', error);
            return {
                profile: 'CAUTELOSO',
                confidence: 0.3,
                scores: {}
            };
        }
    }

    // DETECTAR INTENÇÃO DA MENSAGEM
    detectIntent(message, context = {}) {
        try {
            const text = message.toLowerCase().trim();
            
            if (/^(oi|olá|bom dia)/.test(text)) {
                return 'GREETING';
            }
            
            if (text.includes('eu quero') || text.includes('quero')) {
                return 'INTEREST_CONFIRMED';
            }
            
            if (text.includes('preço') || text.includes('quanto')) {
                return 'PRICING_REQUEST';
            }
            
            return 'GENERAL_QUESTION';
            
        } catch (error) {
            logger.error('❌ Erro ao detectar intenção:', error);
            return 'GENERAL_QUESTION';
        }
    }
}

module.exports = KnowledgeBase;