// src/config/index.js
// Sistema de Configuração - WhatsApp IPTV Agent

const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Configurações organizadas por categoria
const config = {
  // Aplicação
  app: {
    name: process.env.APP_NAME || 'WhatsApp IPTV Agent',
    version: process.env.APP_VERSION || '1.0.0',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3000
  },

  // WhatsApp
  whatsapp: {
    sessionName: process.env.WHATSAPP_SESSION_NAME || 'iptv-agent-session',
    timeout: parseInt(process.env.WHATSAPP_TIMEOUT) || 60000,
    retryAttempts: parseInt(process.env.WHATSAPP_RETRY_ATTEMPTS) || 3,
    headless: process.env.WHATSAPP_HEADLESS !== 'false'
  },

  // Bot
  bot: {
    name: process.env.BOT_NAME || 'IPTV Assistant',
    responseDelay: parseInt(process.env.BOT_RESPONSE_DELAY) || 1000,
    typingDelay: parseInt(process.env.BOT_TYPING_DELAY) || 2000,
    maxRetries: parseInt(process.env.BOT_MAX_RETRIES) || 3
  },

  // Waseller CRM
  waseller: {
    apiUrl: process.env.WASELLER_API_URL || 'https://api.waseller.com',
    apiKey: process.env.WASELLER_API_KEY,
    webhookSecret: process.env.WASELLER_WEBHOOK_SECRET,
    timeout: parseInt(process.env.WASELLER_TIMEOUT) || 30000
  },

  // IA
  ai: {
    provider: process.env.AI_PROVIDER || 'openai',
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 500,
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7
    }
  },

  // Segurança
  security: {
    jwtSecret: process.env.JWT_SECRET,
    encryptionKey: process.env.ENCRYPTION_KEY
  },

  // Monitoramento
  monitoring: {
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 300000,
    metricsEnabled: process.env.METRICS_ENABLED !== 'false'
  },

  // Backup
  backup: {
    enabled: process.env.BACKUP_ENABLED !== 'false',
    interval: parseInt(process.env.BACKUP_INTERVAL) || 86400000,
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30
  }
};

// Função para verificar se está em modo de desenvolvimento
const isDevelopment = () => config.app.env === 'development';
const isProduction = () => config.app.env === 'production';

// Exportar configuração e utilitários
module.exports = {
  ...config,
  isDevelopment,
  isProduction
};