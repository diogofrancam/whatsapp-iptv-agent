const InternalCRM = require('../src/crm/internal-crm');

async function generateStats() {
  console.log('📊 GERANDO ESTATÍSTICAS DO SISTEMA');
  console.log('=' .repeat(40));
  
  try {
    const crm = new InternalCRM();
    const stats = await crm.getStats();
    const report = await crm.generateReport();
    
    console.log(`📈 Total de Contatos: ${stats.totalContacts}`);
    console.log(`💬 Total de Conversas: ${stats.totalConversations}`);
    console.log(`🔥 Leads Quentes: ${stats.leadsQuentes}`);
    console.log(`❄️ Leads Frios: ${stats.leadsFrios}`);
    console.log(`👥 Clientes Ativos: ${stats.clientesAtivos}`);
    console.log(`💰 Taxa de Conversão: ${stats.taxaConversao}%`);
    
    console.log('\n✅ Relatório completo salvo em data/crm/');
    
  } catch (error) {
    console.error('❌ Erro ao gerar estatísticas:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  generateStats();
}

module.exports = { generateStats };
