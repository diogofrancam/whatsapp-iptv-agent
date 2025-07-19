const path = require('path');

class Config {
    static getWhatsAppConfig() {
        return {
            clientId: 'iptv-agent',
            authTimeout: 60000,
            puppeteerOptions: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu'
                ]
            }
        };
    }

    static getBotResponses() {
        return {
            greeting: {
                keywords: ['oi', 'olá', 'ola', 'hey', 'bom dia', 'boa tarde', 'boa noite'],
                response: '🤖 Olá! Sou o assistente virtual da nossa empresa de IPTV. Como posso ajudá-lo?\n\n📋 Digite:\n• "preços" - Ver nossos planos\n• "teste" - Teste grátis\n• "suporte" - Falar com atendente'
            },
            pricing: {
                keywords: ['preço', 'precos', 'valor', 'plano', 'planos', 'custo', 'quanto custa'],
                response: '💰 **NOSSOS PLANOS:**\n\n📺 **BÁSICO** - R$ 29,90/mês\n• +3.000 canais\n• Filmes e séries\n• Qualidade HD\n\n🎬 **PREMIUM** - R$ 49,90/mês\n• +8.000 canais\n• 4K/Full HD\n• Canais adultos\n• PPV inclusos\n\n🔥 **VIP** - R$ 69,90/mês\n• +12.000 canais\n• Máxima qualidade\n• Suporte prioritário\n\nQuer o teste grátis? Digite "teste"!'
            },
            trial: {
                keywords: ['teste', 'trial', 'gratis', 'gratuito', 'experimentar'],
                response: '🎯 **TESTE GRÁTIS 24H!**\n\n✅ Acesso completo\n✅ Todos os canais\n✅ Sem compromisso\n\n📱 Para ativar seu teste, preciso de:\n• Seu nome completo\n• E-mail\n• Modelo da sua TV/dispositivo\n\nPode me enviar essas informações?'
            },
            support: {
                keywords: ['suporte', 'ajuda', 'problema', 'não funciona', 'erro', 'atendente', 'humano'],
                response: '🛠️ **SUPORTE TÉCNICO**\n\n💬 Aguarde, vou transferir você para um de nossos especialistas.\n\n⏰ Horário de atendimento:\n• Segunda a Sábado: 8h às 22h\n• Domingo: 14h às 20h\n\n*Um atendente humano responderá em breve...*'
            },
            default: {
                response: '🤖 Obrigado pelo contato! \n\n📋 **Como posso ajudar?**\n• Digite "preços" - Ver planos\n• Digite "teste" - Teste grátis 24h\n• Digite "suporte" - Falar com atendente\n\n💬 Ou me conte o que precisa!'
            }
        };
    }

    static getBusinessInfo() {
        return {
            companyName: 'IPTV Premium',
            supportHours: 'Segunda a Sábado: 8h às 22h | Domingo: 14h às 20h',
            website: 'www.iptvpremium.com.br',
            whatsapp: '(11) 99999-9999',
            email: 'contato@iptvpremium.com.br'
        };
    }

    static getDatabaseConfig() {
        return {
            path: path.join(__dirname, '../../data/database.sqlite'),
            backup: true,
            backupInterval: 24 * 60 * 60 * 1000 // 24 horas
        };
    }
}

module.exports = Config;