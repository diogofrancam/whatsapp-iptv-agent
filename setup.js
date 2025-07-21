#!/usr/bin/env node

// setup.js - Script de configuração inicial do WhatsApp IPTV Agent
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 WHATSAPP IPTV AGENT - CONFIGURAÇÃO INICIAL');
console.log('============================================\n');

// Função para fazer perguntas
const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

// Função principal
async function main() {
  try {
    console.log('Este script irá configurar seu projeto WhatsApp IPTV Agent.\n');
    
    // Configurações básicas
    const config = {
      APP_NAME: 'WhatsApp IPTV Agent',
      NODE_ENV: 'development',
      PORT: '3000',
      
      // Waseller (obrigatório)
      WASELLER_API_KEY: await question('Chave da API Waseller (obrigatório): '),
      WASELLER_API_URL: 'https://api.waseller.com',
      
      // Bot
      BOT_NAME: 'IPTV Assistant',
      BOT_RESPONSE_DELAY: '1000',
      BOT_TYPING_DELAY: '2000',
      
      // WhatsApp
      WHATSAPP_SESSION_NAME: 'iptv-agent-session',
      WHATSAPP_HEADLESS: 'true',
      
      // OpenAI (opcional)
      OPENAI_API_KEY: await question('Chave da API OpenAI (opcional, pressione Enter para pular): ') || '',
      
      // Segurança (geradas automaticamente)
      JWT_SECRET: generateRandomString(64),
      ENCRYPTION_KEY: generateRandomString(32),
      WASELLER_WEBHOOK_SECRET: generateRandomString(32)
    };
    
    if (!config.WASELLER_API_KEY) {
      console.error('\n❌ Erro: Chave da API Waseller é obrigatória!');
      process.exit(1);
    }
    
    // Criar arquivo .env
    const envContent = Object.entries(config)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
      
    const fullEnvContent = `# WhatsApp IPTV Agent - Configurações
# Gerado automaticamente em ${new Date().toISOString()}

${envContent}

# Configurações adicionais
LOG_LEVEL=info
HEALTH_CHECK_INTERVAL=300000
BACKUP_ENABLED=true
DEBUG_MODE=false
`;

    fs.writeFileSync('.env', fullEnvContent);
    
    console.log('\n✅ Configuração concluída com sucesso!');
    console.log('📁 Arquivo .env criado');
    console.log('\n🚀 Próximo passo: execute "node src/index.js" para iniciar o bot');
    
  } catch (error) {
    console.error('\n❌ Erro durante a configuração:', error.message);
  } finally {
    rl.close();
  }
}

// Função para gerar strings aleatórias
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Executar se for o arquivo principal
if (require.main === module) {
  main();
}

module.exports = { main };