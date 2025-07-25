const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🔍 DEBUG MODE - HOBTiv Bot');

const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'debug-hobtiv' }),
    puppeteer: { headless: true }
});

client.on('qr', (qr) => {
    console.log('📱 QR Code gerado:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Cliente conectado!');
});

client.on('message', async (message) => {
    console.log('📨 MENSAGEM RECEBIDA:');
    console.log('From:', message.from);
    console.log('Body:', message.body);
    console.log('Type:', message.type);
    
    if (message.from.includes('@g.us') || message.fromMe) {
        console.log('❌ Ignorando mensagem de grupo ou própria');
        return;
    }
    
    try {
        await client.sendMessage(message.from, '🤖 Bot funcionando! Recebi: ' + message.body);
        console.log('✅ Resposta enviada');
    } catch (error) {
        console.error('❌ Erro ao enviar:', error);
    }
});

client.on('disconnected', (reason) => {
    console.log('❌ Desconectado:', reason);
});

client.initialize();
