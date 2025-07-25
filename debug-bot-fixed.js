const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🔍 DEBUG MODE - HOBTiv Bot (Configuração Robusta)');

const client = new Client({
    authStrategy: new LocalAuth({ 
        clientId: 'debug-hobtiv',
        dataPath: './session-debug'
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
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
        ],
        timeout: 120000, // 2 minutos timeout
        ignoreDefaultArgs: ['--disable-extensions'],
        defaultViewport: null
    }
});

client.on('qr', (qr) => {
    console.log('📱 QR Code gerado:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Cliente conectado e funcionando!');
});

client.on('loading_screen', (percent, message) => {
    console.log('⏳ Carregando...', percent, message);
});

client.on('authenticated', () => {
    console.log('🔐 Autenticado com sucesso!');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
});

client.on('message', async (message) => {
    console.log('📨 MENSAGEM RECEBIDA:');
    console.log('From:', message.from);
    console.log('Body:', message.body);
    
    if (message.from.includes('@g.us') || message.fromMe) {
        console.log('❌ Ignorando mensagem de grupo ou própria');
        return;
    }
    
    try {
        await client.sendMessage(message.from, '🤖 Bot funcionando perfeitamente! Recebi: ' + message.body);
        console.log('✅ Resposta enviada com sucesso');
    } catch (error) {
        console.error('❌ Erro ao enviar:', error);
    }
});

client.on('disconnected', (reason) => {
    console.log('❌ Desconectado:', reason);
});

console.log('🚀 Inicializando cliente...');
client.initialize();
