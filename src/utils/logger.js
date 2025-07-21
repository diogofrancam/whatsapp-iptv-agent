// src/utils/logger.js
const fs = require('fs');
const path = require('path');

// Função para criar diretórios se não existirem
const createLogDir = () => {
  const logDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  return logDir;
};

// Logger simples
const logger = {
  info: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [INFO]: ${message} ${JSON.stringify(data)}`;
    console.log(logMessage);
    try {
      const logDir = createLogDir();
      fs.appendFileSync(path.join(logDir, 'app.log'), logMessage + '\n');
    } catch (error) {
      // Ignorar erros de log
    }
  },
  error: (message, error = {}) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [ERROR]: ${message} ${JSON.stringify(error)}`;
    console.error(logMessage);
    try {
      const logDir = createLogDir();
      fs.appendFileSync(path.join(logDir, 'error.log'), logMessage + '\n');
    } catch (err) {
      // Ignorar erros de log
    }
  },
  warn: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [WARN]: ${message} ${JSON.stringify(data)}`;
    console.warn(logMessage);
  }
};

// Funções específicas para WhatsApp
const logWhatsAppMessage = (direction, from, to, message) => {
  logger.info(`WhatsApp ${direction}`, { from, to, message: message.substring(0, 100) });
};

// Sistema de monitoramento de saúde
const healthMonitor = {
  stats: {
    messagesReceived: 0,
    messagesSent: 0,
    errors: 0,
    uptime: Date.now(),
    lastActivity: Date.now()
  },
  
  incrementMessagesReceived() {
    this.stats.messagesReceived++;
    this.stats.lastActivity = Date.now();
  },
  
  incrementMessagesSent() {
    this.stats.messagesSent++;
    this.stats.lastActivity = Date.now();
  },
  
  incrementErrors() {
    this.stats.errors++;
  },
  
  getHealthReport() {
    return {
      ...this.stats,
      uptimeHours: ((Date.now() - this.stats.uptime) / (1000 * 60 * 60)).toFixed(2),
      lastActivityMinutes: ((Date.now() - this.stats.lastActivity) / (1000 * 60)).toFixed(2)
    };
  }
};

// Monitor de performance simples
const performanceMonitor = {
  startTime: new Map(),
  
  start(operation) {
    this.startTime.set(operation, Date.now());
  },
  
  end(operation) {
    const start = this.startTime.get(operation);
    if (start) {
      const duration = Date.now() - start;
      this.startTime.delete(operation);
      return duration;
    }
    return 0;
  }
};

// Log da inicialização do sistema
const logSystemStart = () => {
  logger.info('Sistema Iniciado', {
    version: '1.0.0',
    nodeVersion: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  logger,
  logWhatsAppMessage,
  healthMonitor,
  performanceMonitor,
  logSystemStart
};