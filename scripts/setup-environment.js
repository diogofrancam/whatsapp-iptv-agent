const fs = require('fs-extra');
const path = require('path');

class EnvironmentSetup {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.dataDir = path.join(this.projectRoot, 'data/crm');
    this.testsDir = path.join(this.projectRoot, 'tests');
    this.scriptsDir = path.join(this.projectRoot, 'scripts');
  }

  async setup() {
    console.log('🚀 INICIANDO CONFIGURAÇÃO DO WHATSAPP IPTV AGENT v2.0');
    console.log('=' .repeat(60));
    
    try {
      await this.createDirectories();
      await this.createDataFiles();
      await this.createConfigFiles();
      await this.createTestFiles();
      await this.createScriptFiles();
      await this.showSuccessMessage();
    } catch (error) {
      console.error('❌ Erro durante a configuração:', error);
      process.exit(1);
    }
  }

  async createDirectories() {
    console.log('📁 Criando estrutura de diretórios...');
    
    const directories = [
      'data/crm',
      'data/crm/backups', 
      'tests',
      'scripts',
      'src/crm',
      'src/ai',
      'logs'
    ];

    for (const dir of directories) {
      const fullPath = path.join(this.projectRoot, dir);
      await fs.ensureDir(fullPath);
      console.log(`   ✅ ${dir}`);
    }
  }

  async createDataFiles() {
    console.log('💾 Criando arquivos de dados...');
    
    // contacts.json
    const contactsFile = path.join(this.dataDir, 'contacts.json');
    if (!await fs.pathExists(contactsFile)) {
      await fs.writeJson(contactsFile, {}, { spaces: 2 });
      console.log('   ✅ contacts.json');
    }
    
    // conversations.json
    const conversationsFile = path.join(this.dataDir, 'conversations.json');
    if (!await fs.pathExists(conversationsFile)) {
      await fs.writeJson(conversationsFile, [], { spaces: 2 });
      console.log('   ✅ conversations.json');
    }
    
    // stats.json
    const statsFile = path.join(this.dataDir, 'stats.json');
    if (!await fs.pathExists(statsFile)) {
      const defaultStats = {
        totalContacts: 0,
        totalConversations: 0,
        leadsQuentes: 0,
        leadsFrios: 0,
        clientesAtivos: 0,
        ofertasEnviadas: 0,
        taxaConversao: 0,
        lastUpdate: new Date().toISOString()
      };
      await fs.writeJson(statsFile, defaultStats, { spaces: 2 });
      console.log('   ✅ stats.json');
    }
  }

  async createConfigFiles() {
    console.log('⚙️ Criando arquivos de configuração...');
    
    // .env de exemplo
    const envExample = path.join(this.projectRoot, '.env.example');
    if (!await fs.pathExists(envExample)) {
      const envContent = `# Configurações do WhatsApp IPTV Agent v2.0
NODE_ENV=production
DEBUG=false

# Configurações do CRM
CRM_BACKUP_INTERVAL=24
MAX_CONVERSATIONS_HISTORY=1000

# Configurações de Ofertas
OFFER_COOLDOWN_HOURS=24
MAX_OFFERS_PER_DAY=3

# URLs dos Servidores IPTV
IPTV_SERVER_ONE=http://onetv.example.com
IPTV_SERVER_GOHTUBE=http://gohtube.example.com

# Grupos de Suporte
GRUPO_SUPORTE_URL=https://chat.whatsapp.com/KPt32Gfvsi5J8HLTRMvRUU
`;
      await fs.writeFile(envExample, envContent);
      console.log('   ✅ .env.example');
    }

    // .gitignore
    const gitignoreFile = path.join(this.projectRoot, '.gitignore');
    if (!await fs.pathExists(gitignoreFile)) {
      const gitignoreContent = `# Dependências
node_modules/
npm-debug.log*

# Arquivos de ambiente
.env

# Dados do WhatsApp Web
.wwebjs_auth/
.wwebjs_cache/

# Dados do CRM
data/crm/*.json
data/crm/backups/

# Logs
logs/*.log

# Arquivos temporários
*.tmp
*.temp

# Sistema operacional
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
`;
      await fs.writeFile(gitignoreFile, gitignoreContent);
      console.log('   ✅ .gitignore');
    }
  }

  async createTestFiles() {
    console.log('🧪 Criando arquivos de teste...');
    
    // Script principal de teste
    const testAllFile = path.join(this.testsDir, 'test-all.js');
    if (!await fs.pathExists(testAllFile)) {
      const testAllContent = `const TestClassifier = require('./test-classifier');

async function runAllTests() {
  console.log('🧪 EXECUTANDO TODOS OS TESTES DO SISTEMA');
  console.log('=' .repeat(50));
  
  try {
    const classifier = new TestClassifier();
    await classifier.runAllTests();
    
    console.log('\\n✅ TODOS OS TESTES CONCLUÍDOS');
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
`;
      await fs.writeFile(testAllFile, testAllContent);
      console.log('   ✅ test-all.js');
    }
  }

  async createScriptFiles() {
    console.log('📜 Criando scripts utilitários...');
    
    // Script de backup
    const backupScript = path.join(this.scriptsDir, 'backup-data.js');
    if (!await fs.pathExists(backupScript)) {
      const backupContent = `const InternalCRM = require('../src/crm/internal-crm');
const path = require('path');

async function createBackup() {
  console.log('🗄️ Criando backup dos dados...');
  
  try {
    const crm = new InternalCRM();
    const backupFile = await crm.backup();
    
    if (backupFile) {
      console.log(\`✅ Backup criado com sucesso: \${path.basename(backupFile)}\`);
      console.log(\`📁 Localização: \${backupFile}\`);
    } else {
      console.log('❌ Falha ao criar backup');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erro ao criar backup:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  createBackup();
}

module.exports = { createBackup };
`;
      await fs.writeFile(backupScript, backupContent);
      console.log('   ✅ backup-data.js');
    }

    // Script de estatísticas
    const statsScript = path.join(this.scriptsDir, 'generate-stats.js');
    if (!await fs.pathExists(statsScript)) {
      const statsContent = `const InternalCRM = require('../src/crm/internal-crm');

async function generateStats() {
  console.log('📊 GERANDO ESTATÍSTICAS DO SISTEMA');
  console.log('=' .repeat(40));
  
  try {
    const crm = new InternalCRM();
    const stats = await crm.getStats();
    const report = await crm.generateReport();
    
    console.log(\`📈 Total de Contatos: \${stats.totalContacts}\`);
    console.log(\`💬 Total de Conversas: \${stats.totalConversations}\`);
    console.log(\`🔥 Leads Quentes: \${stats.leadsQuentes}\`);
    console.log(\`❄️ Leads Frios: \${stats.leadsFrios}\`);
    console.log(\`👥 Clientes Ativos: \${stats.clientesAtivos}\`);
    console.log(\`💰 Taxa de Conversão: \${stats.taxaConversao}%\`);
    
    console.log('\\n✅ Relatório completo salvo em data/crm/');
    
  } catch (error) {
    console.error('❌ Erro ao gerar estatísticas:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  generateStats();
}

module.exports = { generateStats };
`;
      await fs.writeFile(statsScript, statsContent);
      console.log('   ✅ generate-stats.js');
    }
  }

  async showSuccessMessage() {
    console.log('\n🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('=' .repeat(60));
    console.log('');
    console.log('🚀 PRÓXIMOS PASSOS:');
    console.log('   1. npm start          # Iniciar o assistente');
    console.log('   2. Escanear QR Code   # Conectar WhatsApp');
    console.log('   3. npm test           # Executar testes');
    console.log('   4. npm run stats      # Ver estatísticas');
    console.log('');
    console.log('📚 COMANDOS ÚTEIS:');
    console.log('   npm run backup        # Criar backup');
    console.log('   npm run clean         # Limpar cache');
    console.log('   npm run dev           # Modo desenvolvimento');
    console.log('');
    console.log('🔥 SEU WHATSAPP IPTV AGENT V2.0 ESTÁ PRONTO!');
    console.log('=' .repeat(60));
  }
}

// Executar setup se chamado diretamente
if (require.main === module) {
  const setup = new EnvironmentSetup();
  setup.setup().catch(console.error);
}

module.exports = EnvironmentSetup;