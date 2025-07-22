const TestClassifier = require('./test-classifier');

async function runAllTests() {
  console.log('🧪 EXECUTANDO TODOS OS TESTES DO SISTEMA');
  console.log('=' .repeat(50));
  
  try {
    const classifier = new TestClassifier();
    await classifier.runAllTests();
    
    console.log('\n✅ TODOS OS TESTES CONCLUÍDOS');
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
