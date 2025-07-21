const InternalCRM = require('./src/crm/internal-crm');

async function testBasico() {
  console.log('🧪 Testando CRM básico...');
  
  const crm = new InternalCRM();
  
  // Teste simples: adicionar um contato
  const contato = await crm.addContact({
    name: 'Teste Cliente',
    phone: '5511999999999',
    source: 'WhatsApp'
  });
  
  console.log('✅ Contato criado:', contato.name);
  console.log('🎉 CRM funcionando perfeitamente!');
}

testBasico().catch(console.error);
