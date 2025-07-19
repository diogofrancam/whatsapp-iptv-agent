const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsAppBot {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: 'iptv-agent'
            }),
            puppeteer: {
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
        });

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // QR Code para autenticação
        this.client.on('qr', (qr) => {
            console.log('📱 Escaneie o QR Code com seu WhatsApp:');
            qrcode.generate(qr, { small: true });
        });

        // Bot conectado
        this.client.on('ready', () => {
            console.log('✅ Bot WhatsApp conectado com sucesso!');
            console.log('🎯 Aguardando mensagens...');
        });

        // Autenticação bem-sucedida
        this.client.on('authenticated', () => {
            console.log('🔐 Autenticação realizada com sucesso!');
        });

        // Receber mensagens
        this.client.on('message', async (message) => {
            try {
                await this.handleMessage(message);
            } catch (error) {
                console.error('❌ Erro ao processar mensagem:', error);
            }
        });

        // Erros
        this.client.on('auth_failure', (msg) => {
            console.error('❌ Falha na autenticação:', msg);
        });

        this.client.on('disconnected', (reason) => {
            console.log('⚠️ Bot desconectado:', reason);
            console.log('💡 Para reconectar, execute: npm start');
        });

        // Loading
        this.client.on('loading_screen', (percent, message) => {
            console.log(`⏳ Carregando... ${percent}% - ${message}`);
        });
    }

    async handleMessage(message) {
        console.log('\n🔍 === NOVA MENSAGEM ===');
        console.log('📧 De:', message.from);
        console.log('📝 Texto:', message.body || 'undefined');
        console.log('🤖 É minha?', message.fromMe);
        console.log('👥 É grupo?', message.from.includes('@g.us'));
        console.log('📱 Tipo:', message.type);

        // Ignorar mensagens próprias
        if (message.fromMe) {
            console.log('⏭️ IGNORADO: mensagem própria');
            return;
        }

        // Ignorar grupos por enquanto
        if (message.from.includes('@g.us')) {
            console.log('⏭️ IGNORADO: mensagem de grupo');
            return;
        }

        // Ignorar mensagens sem texto
        if (!message.body || message.body.trim() === '') {
            console.log('⏭️ IGNORADO: mensagem sem texto (mídia, figurinha, etc.)');
            return;
        }

        try {
            const contact = await message.getContact();
            const messageText = message.body.toLowerCase();
            const userName = contact.pushname || contact.name || 'Usuário';

            console.log(`👤 USUÁRIO: ${userName}`);
            console.log(`💬 MENSAGEM: "${message.body}"`);

            // Resposta automática simples
            let responseText = '';

            if (messageText.includes('oi') || messageText.includes('olá') || messageText.includes('ola')) {
                responseText = '🤖 Olá! Sou o assistente virtual da nossa empresa de IPTV. Como posso ajudá-lo?';
                console.log('🎯 RESPOSTA: Saudação');
            }
            else if (messageText.includes('preço') || messageText.includes('valor') || messageText.includes('plano')) {
                responseText = '💰 Nossos planos começam a partir de R$ 29,90/mês. Gostaria de conhecer todas as opções disponíveis?';
                console.log('🎯 RESPOSTA: Preços');
            }
            else if (messageText.includes('teste') || messageText.includes('trial')) {
                responseText = '🎯 Oferecemos 24h de teste grátis! Posso configurar para você agora mesmo.';
                console.log('🎯 RESPOSTA: Teste grátis');
            }
            else {
                responseText = '🤖 Recebido! Em breve um de nossos atendentes entrará em contato. Ou digite "preço" para ver nossos planos.';
                console.log('🎯 RESPOSTA: Padrão');
            }

            console.log('📤 ENVIANDO RESPOSTA...');
            await message.reply(responseText);
            console.log('✅ RESPOSTA ENVIADA COM SUCESSO!');

        } catch (error) {
            console.error('❌ ERRO ao processar mensagem:', error);
        }

        console.log('=== FIM DA MENSAGEM ===\n');
    }

    async start() {
        console.log('🚀 Iniciando Bot WhatsApp IPTV...');
        await this.client.initialize();
    }

    async stop() {
        await this.client.destroy();
        console.log('🛑 Bot desconectado.');
    }
}

module.exports = WhatsAppBot;