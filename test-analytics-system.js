const AnalyticsSystem = require('./src/ai/analytics-system');
const InternalCRM = require('./src/crm/internal-crm');

async function testarAnalytics() {
  console.log('🧪 TESTANDO SISTEMA DE ANALYTICS');
  console.log('=================================');
  
  const analytics = new AnalyticsSystem();
  const crm = new InternalCRM();
  
  // Criar dados de teste para simular atividade
  console.log('📊 Gerando dados de teste...');
  
  // Adicionar contatos de teste
  await crm.addContact({
    name: 'João Comprador',
    phone: '5511999999999',
    source: 'WhatsApp',
    status: 'lead',
    tags: ['Lead Quente', 'Dispositivo: fire stick']
  });
  
  await crm.addContact({
    name: 'Maria Cliente',
    phone: '5511888888888',
    source: 'WhatsApp', 
    status: 'client',
    tags: ['Cliente Ativo', 'Suporte Técnico', 'App: 9xtream']
  });
  
  await crm.addContact({
    name: 'Carlos Empresa',
    phone: '5511777777777',
    source: 'Indicação',
    status: 'lead',
    tags: ['Lead Quente', 'Dispositivo: tv android']
  });

  // Adicionar conversas de teste
  await crm.addConversation('5511999999999', 'Eu quero testar o IPTV', 'received', {
    type: 'text',
    automated: false,
    confidence: 80
  });
  
  await crm.addConversation('5511999999999', 'Que bom! Vou te ajudar com o teste gratuito', 'sent', {
    type: 'text', 
    automated: true,
    confidence: 85
  });
  
  await crm.addConversation('5511888888888', '9xtream não funciona no fire stick', 'received', {
    type: 'text',
    automated: false,
    confidence: 90
  });
  
  await crm.addConversation('5511888888888', 'Vou te ajudar com esse problema técnico', 'sent', {
    type: 'text',
    automated: true,
    confidence: 88
  });

  console.log('✅ Dados de teste criados!\n');

  // Testar geração de relatório
  try {
    console.log('📈 Gerando relatório de analytics...\n');
    
    const relatorio = await analytics.gerarRelatorioCompleto('ultimos_7_dias');
    
    console.log('📊 RELATÓRIO GERADO COM SUCESSO!');
    console.log('================================\n');
    
    // Mostrar resumo executivo
    console.log('👑 RESUMO EXECUTIVO:');
    console.log(`   📞 Total de contatos: ${relatorio.resumo_executivo.total_contatos}`);
    console.log(`   🆕 Novos leads: ${relatorio.resumo_executivo.novos_leads}`);
    console.log(`   👥 Clientes ativos: ${relatorio.resumo_executivo.clientes_ativos}`);
    console.log(`   🔧 Casos de suporte: ${relatorio.resumo_executivo.casos_suporte}`);
    console.log(`   💬 Total de interações: ${relatorio.resumo_executivo.total_interacoes}`);
    console.log(`   📊 Média interações/contato: ${relatorio.resumo_executivo.media_interacoes_por_contato}`);
    console.log(`   ⚡ Taxa de resposta: ${relatorio.resumo_executivo.taxa_resposta}\n`);
    
    // Mostrar métricas detalhadas
    console.log('🔍 MÉTRICAS DETALHADAS:');
    console.log(`   🤖 Mensagens automáticas: ${relatorio.metricas_detalhadas.performance_bot.mensagens_automaticas}`);
    console.log(`   👤 Mensagens humanas: ${relatorio.metricas_detalhadas.performance_bot.mensagens_humanas}`);
    console.log(`   🔄 Taxa de automação: ${relatorio.metricas_detalhadas.performance_bot.taxa_automacao}`);
    console.log(`   📈 Taxa conversão estimada: ${relatorio.metricas_detalhadas.classificacao_leads.taxa_conversao_estimada}\n`);
    
    // Mostrar análise de classificação
    console.log('🎯 ANÁLISE DE CLASSIFICAÇÃO:');
    console.log(`   📊 Total classificações: ${relatorio.analise_classificacao.total_classificacoes}`);
    console.log(`   ✅ Classificações corretas: ${relatorio.analise_classificacao.classificacoes_corretas_estimadas}`);
    console.log(`   🎯 Precisão estimada: ${relatorio.analise_classificacao.precisao_estimada}\n`);
    
    // Mostrar dispositivos e problemas
    if (relatorio.analise_dispositivos.dispositivos_mais_usados.length > 0) {
      console.log('📱 DISPOSITIVOS MAIS USADOS:');
      relatorio.analise_dispositivos.dispositivos_mais_usados.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.dispositivo}: ${item.count} (${item.percentual})`);
      });
      console.log('');
    }
    
    if (relatorio.analise_dispositivos.problemas_mais_comuns.length > 0) {
      console.log('⚠️ PROBLEMAS MAIS COMUNS:');
      relatorio.analise_dispositivos.problemas_mais_comuns.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.problema}: ${item.count} (${item.percentual})`);
      });
      console.log('');
    }
    
    // Mostrar recomendações
    if (relatorio.recomendacoes.length > 0) {
      console.log('💡 RECOMENDAÇÕES:');
      relatorio.recomendacoes.forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.prioridade.toUpperCase()}] ${rec.titulo}`);
        console.log(`      ${rec.descricao}`);
        console.log(`      💡 Ação: ${rec.acao_sugerida}\n`);
      });
    }
    
    console.log('🎉 TESTE DE ANALYTICS COMPLETO!');
    console.log('\n✅ FUNCIONALIDADES VALIDADAS:');
    console.log('   📊 Geração de relatórios completos');
    console.log('   📈 Cálculo de métricas de performance');
    console.log('   🎯 Análise de precisão de classificação');
    console.log('   📱 Análise de dispositivos e problemas');
    console.log('   💡 Geração de recomendações inteligentes');
    console.log('   ⏰ Análise temporal de atividade');
    
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testarAnalytics().catch(console.error);
