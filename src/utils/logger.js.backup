const moment = require('moment');

class Logger {
    static log(level, message, data = {}) {
        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        const logData = {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...data
        };

        // Console colorido baseado no nível
        switch (level.toLowerCase()) {
            case 'error':
                console.error(`❌ [${timestamp}] ERROR: ${message}`, data);
                break;
            case 'warning':
                console.warn(`⚠️ [${timestamp}] WARNING: ${message}`, data);
                break;
            case 'info':
                console.log(`ℹ️ [${timestamp}] INFO: ${message}`, data);
                break;
            case 'success':
                console.log(`✅ [${timestamp}] SUCCESS: ${message}`, data);
                break;
            case 'debug':
                console.log(`🔍 [${timestamp}] DEBUG: ${message}`, data);
                break;
            default:
                console.log(`📝 [${timestamp}] ${level.toUpperCase()}: ${message}`, data);
        }

        return logData;
    }

    static error(message, data = {}) {
        return this.log('error', message, data);
    }

    static warning(message, data = {}) {
        return this.log('warning', message, data);
    }

    static info(message, data = {}) {
        return this.log('info', message, data);
    }

    static success(message, data = {}) {
        return this.log('success', message, data);
    }

    static debug(message, data = {}) {
        return this.log('debug', message, data);
    }

    // Log específico para mensagens WhatsApp
    static messageReceived(phoneNumber, userName, message) {
        return this.log('info', 'Mensagem recebida', {
            phone: phoneNumber,
            user: userName,
            message: message,
            type: 'message_received'
        });
    }

    static messageSent(phoneNumber, response) {
        return this.log('success', 'Resposta enviada', {
            phone: phoneNumber,
            response: response,
            type: 'message_sent'
        });
    }

    static botEvent(event, data = {}) {
        return this.log('info', `Bot event: ${event}`, {
            event,
            ...data,
            type: 'bot_event'
        });
    }
}

module.exports = Logger;