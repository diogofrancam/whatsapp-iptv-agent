// src/crm/waseller-api.js
// Sistema Completo de Extração de Dados - Waseller CRM

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../utils/logger');
const config = require('../config');

class WasellerAPI {
    constructor() {
        this.apiUrl = config.waseller.apiUrl;
        this.apiKey = config.waseller.apiKey;
        this.timeout = config.waseller.timeout;
        this.extractedData = {};
        
        // Headers padrão para API
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        logger.info('🔗 Waseller API inicializada');
    }

    /**
     * EXTRAÇÃO COMPLETA DE TODOS OS DADOS
     */
    async extractAllData() {
        try {
            logger.info('🚀 Iniciando extração completa do Waseller...');
            
            // Extrair todos os tipos de dados
            const results = await Promise.allSettled([
                this.extractContacts(),
                this.extractConversations(), 
                this.extractQuickReplies(),
                this.extractFunnels(),
                this.extractTags(),
                this.extractReminders(),
                this.extractTemplates(),
                this.extractCampaigns(),
                this.extractMetrics(),
                this.extractTeam(),
                this.extractSettings(),
                this.extractAutomations()
            ]);

            // Processar resultados
            const extractions = [
                'contacts', 'conversations', 'quickReplies', 'funnels',
                'tags', 'reminders', 'templates', 'campaigns', 
                'metrics', 'team', 'settings', 'automations'
            ];

            results.forEach((result, index) => {
                const dataType = extractions[index];
                if (result.status === 'fulfilled') {
                    this.extractedData[dataType] = result.value;
                    logger.info(`✅ ${dataType}: ${this.getDataCount(result.value)} itens extraídos`);
                } else {
                    logger.error(`❌ Erro em ${dataType}:`, result.reason.message);
                    this.extractedData[dataType] = [];
                }
            });

            // Salvar dados extraídos
            await this.saveExtractedData();
            
            // Gerar análises
            const analysis = await this.analyzeExtractedData();
            
            logger.info('🎉 Extração completa finalizada!');
            return {
                data: this.extractedData,
                analysis: analysis,
                summary: this.generateSummary()
            };

        } catch (error) {
            logger.error('❌ Erro na extração completa:', error);
            throw error;
        }
    }

    /**
     * EXTRAIR CONTATOS/CLIENTES
     */
    async extractContacts() {
        try {
            const endpoints = [
                '/contacts',
                '/leads', 
                '/customers',
                '/clients'
            ];

            let allContacts = [];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await this.makeRequest('GET', endpoint);
                    if (response && response.data) {
                        allContacts = allContacts.concat(Array.isArray(response.data) ? response.data : [response.data]);
                    }
                } catch (error) {
                    // Endpoint pode não existir, continuar
                    continue;
                }
            }

            return allContacts;
        } catch (error) {
            logger.error('❌ Erro ao extrair contatos:', error);
            return [];
        }
    }

    /**
     * EXTRAIR CONVERSAS E MENSAGENS
     */
    async extractConversations() {
        try {
            const endpoints = [
                '/conversations',
                '/chats',
                '/messages', 
                '/whatsapp/conversations',
                '/whatsapp/messages'
            ];

            let allConversations = [];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await this.makeRequest('GET', endpoint);
                    if (response && response.data) {
                        allConversations = allConversations.concat(Array.isArray(response.data) ? response.data : [response.data]);
                    }
                } catch (error) {
                    continue;
                }
            }

            return allConversations;
        } catch (error) {
            logger.error('❌ Erro ao extrair conversas:', error);
            return [];
        }
    }

    /**
     * EXTRAIR RESPOSTAS RÁPIDAS
     */
    async extractQuickReplies() {
        try {
            const endpoints = [
                '/quick-replies',
                '/templates/quick',
                '/responses/quick',
                '/shortcuts',
                '/macros'
            ];

            let quickReplies = [];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await this.makeRequest('GET', endpoint);
                    if (response && response.data) {
                        quickReplies = quickReplies.concat(Array.isArray(response.data) ? response.data : [response.data]);
                    }
                } catch (error) {
                    continue;
                }
            }

            return quickReplies;
        } catch (error) {
            logger.error('❌ Erro ao extrair respostas rápidas:', error);
            return [];
        }
    }

    /**
     * EXTRAIR FUNIS DE VENDAS
     */
    async extractFunnels() {
        try {
            const endpoints = [
                '/funnels',
                '/pipelines', 
                '/sales-process',
                '/workflows',
                '/sequences'
            ];

            let funnels = [];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await this.makeRequest('GET', endpoint);
                    if (response && response.data) {
                        funnels = funnels.concat(Array.isArray(response.data) ? response.data : [response.data]);
                    }
                } catch (error) {
                    continue;
                }
            }

            return funnels;
        } catch (error) {
            logger.error('❌ Erro ao extrair funis:', error);
            return [];
        }
    }

    /**
     * EXTRAIR TAGS E CLASSIFICAÇÕES
     */
    async extractTags() {
        try {
            const endpoints = [
                '/tags',
                '/labels',
                '/categories',
                '/segments',
                '/groups'
            ];

            let tags = [];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await this.makeRequest('GET', endpoint);
                    if (response && response.data) {
                        tags = tags.concat(Array.isArray(response.data) ? response.data : [response.data]);
                    }
                } catch (error) {
                    continue;
                }
            }

            return tags;
        } catch (error) {
            logger.error('❌ Erro ao extrair tags:', error);
            return [];
        }
    }

    /**
     * EXTRAIR LEMBRETES E FOLLOW-UPS  
     */
    async extractReminders() {
        try {
            const endpoints = [
                '/reminders',
                '/follow-ups',
                '/tasks',
                '/schedule',
                '/appointments'
            ];

            let reminders = [];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await this.makeRequest('GET', endpoint);
                    if (response && response.data) {
                        reminders = reminders.concat(Array.isArray(response.data) ? response.data : [response.data]);
                    }
                } catch (error) {
                    continue;
                }
            }

            return reminders;
        } catch (error) {
            logger.error('❌ Erro ao extrair lembretes:', error);
            return [];
        }
    }

    /**
     * EXTRAIR TEMPLATES DE MENSAGEM
     */
    async extractTemplates() {
        try {
            const endpoints = [
                '/templates',
                '/message-templates',
                '/whatsapp/templates', 
                '/responses/templates'
            ];

            let templates = [];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await this.makeRequest('GET', endpoint);
                    if (response && response.data) {
                        templates = templates.concat(Array.isArray(response.data) ? response.data : [response.data]);
                    }
                } catch (error) {
                    continue;
                }
            }

            return templates;
        } catch (error) {
            logger.error('❌ Erro ao extrair templates:', error);
            return [];
        }
    }

    /**
     * EXTRAIR CAMPANHAS
     */
    async extractCampaigns() {
        try {
            const endpoints = [
                '/campaigns',
                '/broadcasts',
                '/bulk-messages',
                '/marketing/campaigns'
            ];

            let campaigns = [];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await this.makeRequest('GET', endpoint);
                    if (response && response.data) {
                        campaigns = campaigns.concat(Array.isArray(response.data) ? response.data : [response.data]);
                    }
                } catch (error) {
                    continue;
                }
            }

            return campaigns;
        } catch (error) {
            logger.error('❌ Erro ao extrair campanhas:', error);
            return [];
        }
    }

    /**
     * EXTRAIR MÉTRICAS E RELATÓRIOS
     */
    async extractMetrics() {
        try {
            const endpoints = [
                '/metrics',
                '/analytics',
                '/reports',
                '/stats',
                '/dashboard/data'
            ];

            let metrics = [];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await this.makeRequest('GET', endpoint);
                    if (response && response.data) {
                        metrics = metrics.concat(Array.isArray(response.data) ? response.data : [response.data]);
                    }
                } catch (error) {
                    continue;
                }
            }

            return metrics;
        } catch (error) {
            logger.error('❌ Erro ao extrair métricas:', error);
            return [];
        }
    }

    /**
     * EXTRAIR DADOS DA EQUIPE
     */
    async extractTeam() {
        try {
            const endpoints = [
                '/users',
                '/team',
                '/agents',
                '/operators',
                '/staff'
            ];

            let team = [];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await this.makeRequest('GET', endpoint);
                    if (response && response.data) {
                        team = team.concat(Array.isArray(response.data) ? response.data : [response.data]);
                    }
                } catch (error) {
                    continue;
                }
            }

            return team;
        } catch (error) {
            logger.error('❌ Erro ao extrair equipe:', error);
            return [];
        }
    }

    /**
     * EXTRAIR CONFIGURAÇÕES
     */
    async extractSettings() {
        try {
            const endpoints = [
                '/settings',
                '/config',
                '/preferences',
                '/account',
                '/company'
            ];

            let settings = [];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await this.makeRequest('GET', endpoint);
                    if (response && response.data) {
                        settings = settings.concat(Array.isArray(response.data) ? response.data : [response.data]);
                    }
                } catch (error) {
                    continue;
                }
            }

            return settings;
        } catch (error) {
            logger.error('❌ Erro ao extrair configurações:', error);
            return [];
        }
    }

    /**
     * EXTRAIR AUTOMAÇÕES
     */
    async extractAutomations() {
        try {
            const endpoints = [
                '/automations',
                '/triggers',
                '/rules',
                '/bots',
                '/workflows/auto'
            ];

            let automations = [];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await this.makeRequest('GET', endpoint);
                    if (response && response.data) {
                        automations = automations.concat(Array.isArray(response.data) ? response.data : [response.data]);
                    }
                } catch (error) {
                    continue;
                }
            }

            return automations;
        } catch (error) {
            logger.error('❌ Erro ao extrair automações:', error);
            return [];
        }
    }

    /**
     * FAZER REQUISIÇÃO PARA API
     */
    async makeRequest(method, endpoint, data = null) {
        try {
            const url = `${this.apiUrl}${endpoint}`;
            
            const config = {
                method: method,
                url: url,
                headers: this.headers,
                timeout: this.timeout
            };

            if (data) {
                config.data = data;
            }

            const response = await axios(config);
            return response.data;

        } catch (error) {
            if (error.response) {
                logger.warn(`API ${method} ${endpoint}: ${error.response.status} - ${error.response.statusText}`);
            } else if (error.request) {
                logger.warn(`API ${method} ${endpoint}: Sem resposta`);
            } else {
                logger.warn(`API ${method} ${endpoint}: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * SALVAR DADOS EXTRAÍDOS
     */
    async saveExtractedData() {
        try {
            const dataDir = path.join(process.cwd(), 'data', 'waseller-export');
            await fs.mkdir(dataDir, { recursive: true });

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `waseller-export-${timestamp}.json`;
            const filepath = path.join(dataDir, filename);

            await fs.writeFile(filepath, JSON.stringify(this.extractedData, null, 2));
            
            logger.info(`💾 Dados salvos em: ${filepath}`);
            return filepath;

        } catch (error) {
            logger.error('❌ Erro ao salvar dados:', error);
        }
    }

    /**
     * ANALISAR DADOS EXTRAÍDOS
     */
    async analyzeExtractedData() {
        try {
            const analysis = {
                conversations: this.analyzeConversations(),
                quickReplies: this.analyzeQuickReplies(),
                customerPatterns: this.analyzeCustomerPatterns(),
                successfulFlows: this.analyzeSuccessfulFlows(),
                commonIssues: this.analyzeCommonIssues(),
                bestPractices: this.extractBestPractices()
            };

            return analysis;
        } catch (error) {
            logger.error('❌ Erro na análise:', error);
            return {};
        }
    }

    /**
     * ANALISAR CONVERSAS
     */
    analyzeConversations() {
        const conversations = this.extractedData.conversations || [];
        
        const analysis = {
            total: conversations.length,
            avgResponseTime: 0,
            commonKeywords: [],
            successfulClosures: [],
            escalationPatterns: []
        };

        // Análise detalhada das conversas
        // ... implementar lógica específica

        return analysis;
    }

    /**
     * ANALISAR RESPOSTAS RÁPIDAS
     */
    analyzeQuickReplies() {
        const quickReplies = this.extractedData.quickReplies || [];
        
        return {
            total: quickReplies.length,
            categories: this.categorizeReplies(quickReplies),
            mostUsed: this.getMostUsedReplies(quickReplies),
            effectiveness: this.calculateReplyEffectiveness(quickReplies)
        };
    }

    /**
     * GERAR RESUMO
     */
    generateSummary() {
        const summary = {
            totalContacts: this.getDataCount(this.extractedData.contacts),
            totalConversations: this.getDataCount(this.extractedData.conversations),
            totalQuickReplies: this.getDataCount(this.extractedData.quickReplies),
            totalFunnels: this.getDataCount(this.extractedData.funnels),
            totalTags: this.getDataCount(this.extractedData.tags),
            totalTemplates: this.getDataCount(this.extractedData.templates),
            extractionDate: new Date().toISOString()
        };

        return summary;
    }

    /**
     * UTILITÁRIOS
     */
    getDataCount(data) {
        if (!data) return 0;
        return Array.isArray(data) ? data.length : 1;
    }

    categorizeReplies(replies) {
        // Implementar categorização
        return {};
    }

    getMostUsedReplies(replies) {
        // Implementar análise de uso
        return [];
    }

    calculateReplyEffectiveness(replies) {
        // Implementar cálculo de efetividade
        return 0;
    }
}

module.exports = WasellerAPI;