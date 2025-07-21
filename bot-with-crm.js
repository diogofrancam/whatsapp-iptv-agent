const WhatsAppHandler = require('./src/bot/whatsapp-handler');

async function startBot() {
  console.log('🚀 ===== INICIANDO BOT WHATSAPP + CRM =====');
  console.log('🎯 Sistema integrado sem dependência do Waseller');
  console.log('==========================================');

  const bot = new WhatsAppHandler();
  
  // Iniciar bot
  await bot.start();
  
  // Mostrar estatísticas iniciais
  setTimeout(async () => {
    const stats = await bot.getCRMStats();
    console.log('\n📊 Estatísticas do CRM:');
    console.log(`   Contatos: ${stats.totalContacts}`);
    console.log(`   Conversas: ${stats.totalConversations}`);
    console.log(`   Templates: ${stats.totalTemplates}`);
  }, 3000);

  // Configurar handlers de processo
  process.on('SIGINT', async () => {
    console.log('\n🛑 Parando bot...');
    await bot.stop();
    process.exit(0);
  });
}

startBot().catch(error => {
  console.error('❌ Erro ao iniciar bot:', error);
  process.exit(1);
});
