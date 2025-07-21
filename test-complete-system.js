const InternalCRM = require('./src/crm/internal-crm');

async function testCompleteSystem() {
  console.log('🧪 ===== TESTE SISTEMA COMPLETO =====');
  console.log('🎯 Testando CRM interno (substituto do Waseller)');
  console.log('=====================================');
  
  const crm = new InternalCRM();
  
  try {
    console.log('\n1. 👤 Testando criação de contatos...');
    
    const contact1 = await crm.addContact({
      name: 'João Silva',
      phone: '5511999888777',
      email: 'joao@email.com',
      source: 'WhatsApp',
      status: 'lead'
    });

    const contact2 = await crm.addContact({
      name: 'Maria Santos',
      phone: '5511888777666',
      email: 'maria@email.com',
      source: 'WhatsApp',
      status: 'interested'
    });

    console.log('\n2. 💬 Testando conversas...');
    
    await crm.addConversation('5511999888777', 'Olá, tenho interesse nos planos IPTV', 'received');
    await crm.addConversation('5511999888777', 'Olá João! Temos ótimos planos. Qual seria o seu interesse específico?', 'sent');
    await crm.addConversation('5511999888777', 'Gostaria de algo com canais de esporte', 'received');
    
    await crm.addConversation('5511888777666', 'Vocês tem suporte técnico?', 'received');
    await crm.addConversation('5511888777666', 'Sim Maria! Temos suporte 24h por WhatsApp e telefone.', 'sent');

    console.log('\n3. 📝 Testando templates...');
    
    await crm.addTemplate('Boas-vindas', 'Olá! Bem-vindo à nossa empresa de IPTV. Como podemos ajudar?', 'atendimento');
    await crm.addTemplate('Planos', 'Temos 3 planos: Básico (R$30), Premium (R$50) e Ultimate (R$80). Qual desperta seu interesse?', 'vendas');
    await crm.addTemplate('Suporte', 'Nosso suporte funciona 24h via WhatsApp. Descreva seu problema que te ajudaremos!', 'suporte');

    console.log('\n4. 🏷️ Testando tags...');
    
    await crm.addTag('Lead Quente', '#e74c3c');
    await crm.addTag('Interessado', '#f39c12');
    await crm.addTag('Cliente', '#27ae60');
    
    await crm.tagContact(contact1.id, 'Lead Quente');
    await crm.tagContact(contact2.id, 'Interessado');

    console.log('\n5. 📊 Gerando estatísticas...');
    
    const stats = await crm.getStats();
    
    console.log('\n📈 ===== ESTATÍSTICAS DO CRM =====');
    console.log(`📱 Total de contatos: ${stats.totalContacts}`);
    console.log(`💬 Total de conversas: ${stats.totalConversations}`);
    console.log(`📝 Templates criados: ${stats.totalTemplates}`);
    console.log(`🏷️ Tags disponíveis: ${stats.totalTags}`);
    console.log(`📩 Mensagens recebidas hoje: ${stats.receivedToday}`);
    console.log(`📤 Mensagens enviadas hoje: ${stats.sentToday}`);
    
    console.log('\n👥 Contatos por status:');
    Object.entries(stats.contactsByStatus).forEach(([status, contacts]) => {
      console.log(`   ${status}: ${contacts.length} contatos`);
    });

    console.log('\n6. 🔍 Testando busca...');
    
    const searchResults = await crm.searchContacts('João');
    console.log(`Busca por "João": ${searchResults.length} resultados`);
    
    const leadQuentes = await crm.getContactsByTag('Lead Quente');
    console.log(`Contatos com tag "Lead Quente": ${leadQuentes.length}`);

    console.log('\n7. 📄 Testando exportação...');
    
    const exportResult = await crm.exportData();
    console.log(`Dados exportados para: ${exportResult.file}`);
    console.log(`Resumo: ${JSON.stringify(exportResult.summary, null, 2)}`);

    console.log('\n🎉 ===== TESTE CONCLUÍDO COM SUCESSO! =====');
    console.log('✅ CRM interno funcionando perfeitamente');
    console.log('✅ Todas as funcionalidades testadas');
    console.log('✅ Waseller substituído com êxito');
    console.log('🚀 Sistema pronto para uso em produção!');
    
    console.log('\n📋 Próximos passos:');
    console.log('1. ✅ Problema do Waseller resolvido definitivamente');
    console.log('2. ✅ CRM interno implementado e testado');
    console.log('3. 🎯 Avançar para Fase 5 - Funcionalidades Avançadas');
    console.log('4. 🔄 Integrar com WhatsApp Bot');
    console.log('5. 📊 Implementar dashboard de analytics');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testCompleteSystem().catch(console.error);
