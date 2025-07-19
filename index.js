const WhatsAppBot = require('./src/bot/whatsapp');

// Configurações
const bot = new WhatsAppBot();

// Inicializar bot
async function main() {
    try {
        await bot.start();
    } catch (error) {
        console.error('❌ Erro ao iniciar bot:', error);
        process.exit(1);
    }
}

// Gerenciar encerramento gracioso
process.on('SIGINT', async () => {
    console.log('\n⚠️ Encerrando bot...');
    await bot.stop();
    process.exit(0);
});

// Iniciar aplicação
main();