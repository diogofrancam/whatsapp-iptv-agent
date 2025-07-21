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

    // RESPOSTAS OBJETIVAS - FOCADAS EM VENDAS E SUPORTE
    initResponses() {
        return {
            // === FLUXO DE VENDAS ===
            VENDAS_SAUDACAO: {
                text: "oi #name! 👋\n\n*Canais de TV online interessam?*\n\n📺 +65.000 canais HD/4K\n🎬 Netflix, Prime, Globo Play\n⚽ Todos os campeonatos\n💰 Preço promocional HOJE\n\nDigita *SIM* se quer saber mais!",
                confidence: 0.9,
                nextAction: 'aguardar_confirmacao'
            },
            
            VENDAS_INTERESSE: {
                text: "perfeito #name! 🎯\n\n*Onde vai instalar?*\n\n1️⃣ Smart TV (Samsung/LG)\n2️⃣ Celular Android\n3️⃣ iPhone/iPad\n4️⃣ TV Box\n\nResponde o número da opção 👆",
                confidence: 0.95,
                nextAction: 'coletar_dispositivo'
            },
            
            VENDAS_DISPOSITIVO: {
                samsung: {
                    text: "✅ *Samsung Smart TV*\n\n📱 *App: ABSOLUTO PLAYER*\n💿 Busca na loja de apps da TV\n⚡ Instala em 2 minutos\n\n💰 *Valor promocional: R$34,99*\n+ taxa mensal R$6,99 (suporte)\n\n*Ativa hoje?* Responde *SIM*",
                    confidence: 0.9
                },
                android: {
                    text: "✅ *Android/Celular*\n\n📱 *App: CANALPLAY*\n💿 Baixa na Play Store\n⚡ Instala rapidinho\n\n💰 *Valor promocional: R$34,99*\n+ taxa mensal R$6,99 (suporte)\n\n*Ativa hoje?* Responde *SIM*",
                    confidence: 0.9
                },
                default: {
                    text: "✅ *Seu dispositivo é compatível!*\n\n💰 *Valor promocional: R$34,99*\n+ taxa mensal R$6,99 (suporte)\n\n📺 +65.000 canais HD/4K\n🎬 Netflix, Prime, Globo inclusos\n\n*Quer ativar?* Responde *SIM*",
                    confidence: 0.8
                }
            },
            
            VENDAS_PRECO: {
                text: "💰 *PREÇOS ESPECIAIS HOJE:*\n\n🥉 *Mensal*: R$19,99 + R$4,99/mês\n🥈 *3 meses*: R$49,99 + R$6,99/mês\n🥇 *12 meses*: R$89,99 (2 telas!)\n🏆 *VITALÍCIO*: R$199,99 (3 telas!)\n\n⚡ *Mais vendido: 12 meses*\n💡 *Melhor custo: Vitalício*\n\n*Qual escolhe?*",
                confidence: 0.9,
                nextAction: 'aguardar_escolha'
            },
            
            VENDAS_OBJECAO: {
                text: "#name, são *menos de 10 centavos por dia* 💰\n\n🔥 *Pensa nisso:*\n📺 SKY: R$100+/mês\n🎬 Netflix: R$45/mês\n⚽ SporTV: R$30/mês\n\n🎯 *Nosso*: R$6,99/mês (TUDO junto!)\n\n*Vale muito a pena!* Ativa hoje?",
                confidence: 0.8
            },
            
            VENDAS_PAGAMENTO: {
                text: "🎉 *ATIVANDO SEU ACESSO!*\n\n💳 *PIX:* hobtiv1@gmail.com\n👤 *Nome:* Diogo Martins\n💰 *Valor:* R$#valor\n\n📱 Após pagar, *confirma aqui*\n⚡ Ativo em 2 minutos\n🎁 *Bônus:* Grupo VIP de suporte",
                confidence: 0.95
            },
            
            VENDAS_RENOVACAO: {
                text: "oi #name! 🔄\n\n*Seu acesso vence hoje!*\n\n💰 *Renovação:* R$#valor\n🎁 *Antecipa 6 meses:* +1 mês grátis\n\n*PIX:* hobtiv1@gmail.com\n\n*Renova agora?*",
                confidence: 0.9
            },
            
            VENDAS_TESTE: {
                text: "📅 *TESTE 3 DIAS - R$9,99*\n\n✅ Acesso completo\n✅ Todos os canais\n✅ Suporte incluído\n✅ Se gostar, desconto na assinatura\n\n*Quer testar?* Responde *SIM*",
                confidence: 0.85
            },
            
            VENDAS_INDECISAO: {
                text: "sem problema #name! 😊\n\n*Promoção válida até hoje*\n⏰ Depois volta preço normal\n\n📱 Me chama quando decidir\n🎁 *Dica:* teste de 3 dias por R$9,99\n\n*Qualquer dúvida, estou aqui!*",
                confidence: 0.7
            },
            
            // === FLUXO DE SUPORTE ===
            SUPORTE_SAUDACAO: {
                text: "oi #name! 🔧\n\nSou o *Técnico Pedro*\n\n*Como posso resolver?*\n\n1️⃣ App não abre\n2️⃣ Canais não carregam  \n3️⃣ Login/senha\n4️⃣ Outro problema\n\nDigita o número 👆",
                confidence: 0.9
            },
            
            SUPORTE_PROBLEMA: {
                text: "🔧 *Vamos resolver!*\n\n*Qual seu dispositivo?*\n\n📱 Samsung TV\n📱 Android/Celular\n📱 iPhone\n📱 TV Box\n📱 Outro\n\n*E qual app usando?*\n📺 Absoluto Player\n📺 Canal Play\n📺 Outro",
                confidence: 0.85
            },
            
            SUPORTE_LOGIN: {
                text: "🔑 *SOLUÇÃO LOGIN:*\n\n1️⃣ *Desinstala* o app\n2️⃣ *Reinstala* da loja\n3️⃣ *Digite login correto*\n\n💡 *App grava dados errados*\n🔄 *Reinstalar resolve 90% dos casos*\n\n*Funcionou?*",
                confidence: 0.9
            },
            
            SUPORTE_INSTALACAO: {
                samsung: {
                    text: "📱 *SAMSUNG TV:*\n\n1️⃣ Aperta botão *HOME*\n2️⃣ Vai em *Apps*\n3️⃣ Busca *ABSOLUTO PLAYER*\n4️⃣ Instala\n5️⃣ Abre e coloca login\n\n*Conseguiu?*",
                    confidence: 0.9
                },
                android: {
                    text: "📱 *ANDROID:*\n\n1️⃣ Abre *Play Store*\n2️⃣ Busca *CANALPLAY*\n3️⃣ Instala\n4️⃣ Abre e faz login\n\n*Deu certo?*",
                    confidence: 0.9
                },
                default: {
                    text: "📱 *INSTALAÇÃO:*\n\n✅ Vai na loja de apps\n✅ Busca o app recomendado\n✅ Instala\n✅ Faz login\n\n*Qual seu dispositivo* para instruções específicas?",
                    confidence: 0.8
                }
            },
            
            SUPORTE_CANCELAMENTO: {
                text: "😔 *Que pena #name!*\n\n*Antes de cancelar:*\n🔧 Posso resolver algum problema?\n💰 Desconto especial?\n📅 Pausa temporária?\n\n*Me fala o motivo?*\nTalvez consiga resolver! 😊",
                confidence: 0.7
            },
            
            SUPORTE_GERAL: {
                text: "🔧 *SUPORTE TÉCNICO*\n\n*Descreve seu problema:*\n❌ App não abre\n❌ Trava/lentidão\n❌ Login incorreto\n❌ Canais não carregam\n❌ Outro\n\n*Qual é o seu caso?*",
                confidence: 0.8
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
            
            // LÓGICA MELHORADA: Analisar palavras-chave com mais precisão
            for (let profile in profiles) {
                profiles[profile].keywords.forEach(keyword => {
                    if (text.includes(keyword.toLowerCase())) {
                        scores[profile] += 3; // Aumentar pontuação
                    }
                });
            }
            
            // ANÁLISE DE CONTEXTO: Se mencionou dispositivo = potencial cliente
            if (text.includes('tv') || text.includes('celular') || text.includes('samsung') || text.includes('lg')) {
                scores.QUESTIONADOR += 2;
            }
            
            // Se perguntou sobre preço/valor = negociador
            if (text.includes('preço') || text.includes('quanto') || text.includes('valor')) {
                scores.NEGOCIADOR += 2;
            }
            
            // Se confirmou interesse = potencial fiel
            if (text.includes('quero') || text.includes('interessado')) {
                scores.FIEL += 2;
            }
            
            // CLASSIFICAÇÃO PADRÃO: Se nenhuma keyword encontrada
            const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
            if (totalScore === 0) {
                // Cliente novo sem keywords específicas = CAUTELOSO
                scores.CAUTELOSO = 3;
            }
            
            // Retornar perfil com maior pontuação
            const topProfile = Object.keys(scores).reduce((a, b) => 
                scores[a] > scores[b] ? a : b
            );
            
            const maxScore = scores[topProfile];
            const confidence = Math.min(maxScore / 5, 0.95); // Normalizar para 0-0.95
            
            logger.info('🎯 Cliente classificado', {
                profile: topProfile,
                confidence: confidence,
                scores: scores,
                message: currentMessage.substring(0, 50)
            });
            
            return {
                profile: topProfile,
                confidence: confidence,
                scores: scores
            };
            
        } catch (error) {
            logger.error('❌ Erro ao classificar cliente:', error);
            return {
                profile: 'CAUTELOSO',
                confidence: 0.7, // Aumentar confidence padrão
                scores: { CAUTELOSO: 3 }
            };
        }
    }

    // DETECTAR INTENÇÃO DA MENSAGEM - VERSÃO REFINADA
    detectIntent(message, context = {}) {
        try {
            const text = message.toLowerCase().trim();
            
            // === FLUXO DE VENDAS ===
            
            // 1. Saudação inicial
            if (/^(oi|olá|ola|bom dia|boa tarde|boa noite)/.test(text)) {
                return context.isNewCustomer ? 'VENDAS_SAUDACAO' : 'SUPORTE_SAUDACAO';
            }
            
            // 2. Confirmação de interesse
            if (text.includes('eu quero') || text.includes('quero') || text.includes('interessado') || text.includes('aceito')) {
                return 'VENDAS_INTERESSE';
            }
            
            // 3. Especificação de dispositivo
            if (text.includes('tv') || text.includes('celular') || text.includes('samsung') || 
                text.includes('lg') || text.includes('android') || text.includes('iphone')) {
                return 'VENDAS_DISPOSITIVO';
            }
            
            // 4. Pergunta sobre preço
            if (text.includes('preço') || text.includes('quanto') || text.includes('valor') || 
                text.includes('custa') || text.includes('investimento')) {
                return 'VENDAS_PRECO';
            }
            
            // 5. Objeção de preço
            if (text.includes('caro') || text.includes('desconto') || text.includes('promoção') || 
                text.includes('barato') || text.includes('muito')) {
                return 'VENDAS_OBJECAO';
            }
            
            // 6. Confirmação de pagamento
            if (text.includes('paguei') || text.includes('pix') || text.includes('transferi') || 
                text.includes('vou pagar') || text.includes('fazer o pix')) {
                return 'VENDAS_PAGAMENTO';
            }
            
            // === FLUXO DE SUPORTE ===
            
            // 1. Problemas técnicos
            if (text.includes('não funciona') || text.includes('problema') || text.includes('erro') || 
                text.includes('travando') || text.includes('parou') || text.includes('bug')) {
                return 'SUPORTE_PROBLEMA';
            }
            
            // 2. URL/Login
            if (text.includes('url') || text.includes('mudou') || text.includes('login') || 
                text.includes('senha') || text.includes('usuário')) {
                return 'SUPORTE_LOGIN';
            }
            
            // 3. Instalação/App
            if (text.includes('instalar') || text.includes('baixar') || text.includes('app') || 
                text.includes('aplicativo') || text.includes('como usar')) {
                return 'SUPORTE_INSTALACAO';
            }
            
            // 4. Renovação
            if (text.includes('renovar') || text.includes('vencendo') || text.includes('expirou') || 
                text.includes('pagar novamente')) {
                return 'VENDAS_RENOVACAO';
            }
            
            // === FLUXOS ESPECIAIS ===
            
            // Teste/Experimentar
            if (text.includes('teste') || text.includes('trial') || text.includes('testar') ||
                text.includes('experimentar')) {
                return 'VENDAS_TESTE';
            }
            
            // Indecisão
            if (text.includes('vou pensar') || text.includes('depois') || text.includes('talvez') ||
                text.includes('não sei')) {
                return 'VENDAS_INDECISAO';
            }
            
            // Cancelamento
            if (text.includes('cancelar') || text.includes('não quero mais') || text.includes('parar')) {
                return 'SUPORTE_CANCELAMENTO';
            }
            
            // === DEFAULT ===
            // Se não identificou nada específico, assumir interesse em vendas para novo cliente
            return context.isNewCustomer ? 'VENDAS_INTERESSE' : 'SUPORTE_GERAL';
            
        } catch (error) {
            logger.error('❌ Erro ao detectar intenção:', error);
            return 'VENDAS_INTERESSE'; // Default seguro
        }
    }
// MÉTODOS UTILITÁRIOS FALTANTES
    getContext(customerId) {
        return this.contextMemory.get(customerId) || {};
    }

    updateContext(customerId, newContext) {
        try {
            const existingContext = this.contextMemory.get(customerId) || {};
            const updatedContext = { ...existingContext, ...newContext };
            this.contextMemory.set(customerId, updatedContext);
            return updatedContext;
        } catch (error) {
            logger.error('❌ Erro ao atualizar contexto:', error);
            return {};
        }
    }

    validateConfidence(response, threshold = 0.6) {
        if (!response || typeof response.confidence !== 'number') {
            return false;
        }
        return response.confidence >= threshold;
    }

    // PERSONALIZAR RESPOSTA
    personalizeResponse(response, context) {
        if (!response) return null;
        
        let text = '';
        
        if (typeof response === 'string') {
            text = response;
        } else if (response.text) {
            text = response.text;
        } else {
            return response;
        }
        
        // Substituir placeholders
        const personalizedText = text
            .replace(/#name/g, context.customerName || 'amigo')
            .replace(/#valor/g, context.price || '34,99')
            .replace(/#taxa/g, context.maintenance || '6,99');
        
        if (typeof response === 'string') {
            return personalizedText;
        }
        
        return {
            ...response,
            text: personalizedText
        };
    }
}
module.exports = KnowledgeBase;