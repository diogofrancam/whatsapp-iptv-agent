const InternalCRM = require('../src/crm/internal-crm');
const path = require('path');

async function createBackup() {
  console.log('🗄️ Criando backup dos dados...');
  
  try {
    const crm = new InternalCRM();
    const backupFile = await crm.backup();
    
    if (backupFile) {
      console.log(`✅ Backup criado com sucesso: ${path.basename(backupFile)}`);
      console.log(`📁 Localização: ${backupFile}`);
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
