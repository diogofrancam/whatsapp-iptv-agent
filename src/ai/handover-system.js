class HandoverSystem {
  constructor() {
    // Critérios para transferência automática
    this.criteriosTransferencia = {
      // Situações que requerem atendimento humano imediato
      transferencia_imediata: [
        'quero cancelar',
        'não gostei',
        'quero reclamação',
        'processo judicial',
        'advogado',
        'problema sério',
        'muito insatisfeito'
      ],
      
      // Problemas técnicos complexos (após 2 tentativas de IA)
      problemas_complexos: [
        'já tentei tudo',
        'nada funciona',
        'continua sem funcionar',
        'não resolve',
        'mesma coisa',
        'ainda não funciona'
      ],
      
      // Solicitações específicas de vendas
      vendas_especiais: [
        'desconto especial',
        'proposta comercial',
        'plano customizado',
        'empresa',
        'revenda',
        'muitas telas'
      ]
    };

    // Informações que devem ser coletadas antes da transferência
    this.informacoesEssenciais = {
      comprador: [
        'nome_completo',
        'dispositivo_interesse',
        'necessidade_especifica',
        'orcamento_aproximado'
      ],
      
      cliente: [
        'usuario_sistema',
        'dispositivo_usado',
        'aplicativo_usado',
        'problema_especifico',
        'quando_parou_funcionar',
        'ja_tentou_solucoes'
      ],
      
      suporte: [
        'tipo_problema',
        'dispositivo',
        'aplicativo', 
        'mensagem_erro',
        'passos_ja_tentados'
      ]
    };

    // Templates de coleta de informações
    this.templatesColeta = {
      dados_basicos_comprador: {
        pergunta: "Perfeito! Vou te conectar com nosso especialista em vendas. Primeiro, me diga seu nome completo:",
        proximo_passo: 'coletar_dispositivo_interesse'
      },
      
      coletar_dispositivo_interesse: {
        pergunta: "Obrigado, {nome}! Em qual dispositivo você pretende usar principalmente?",
        opcoes: "1️⃣ Smart TV\n2️⃣ Celular/Tablet\n3️⃣ Fire Stick/Chromecast\n4️⃣ Vários dispositivos",
        proximo_passo: 'coletar_necessidade'
      },
      
      coletar_necessidade: {
        pergunta: "Qual seu principal interesse?",
        opcoes: "1️⃣ Canais de esporte\n2️⃣ Filmes e séries\n3️⃣ Canais infantis\n4️⃣ Pacote completo",
        proximo_passo: 'finalizar_transferencia_vendas'
      },

      dados_tecnicos_cliente: {
        pergunta: "Vou te conectar com nosso suporte técnico especializado. Para agilizar, me confirme:",
        opcoes: "📱 Aplicativo que está usando:\n📺 Dispositivo (TV/Celular/Fire Stick):\n⚠️ O que exatamente está acontecendo:",
        proximo_passo: 'coletar_detalhes_problema'
      },

      coletar_detalhes_problema: {
        pergunta: "Quando foi a última vez que funcionou normalmente? E já tentou reinstalar o aplicativo?",
        proximo_passo: 'finalizar_transferencia_suporte'
      }
    };

    // Resumos para o atendente humano
    this.templateResumo = {
      vendas: `📋 **NOVO LEAD - VENDAS**
👤 Nome: {nome}
📱 Contato: {telefone}
🎯 Interesse: {interesse}
📺 Dispositivo: {dispositivo}
💰 Orçamento: {orcamento}
📊 Classificação: {classificacao}
⚡ Prioridade: {prioridade}
📝 Observações: {observacoes}`,

      suporte: `🔧 **CLIENTE - SUPORTE TÉCNICO**
👤 Nome: {nome}
📱 Contato: {telefone}
📱 App usado: {aplicativo}
📺 Dispositivo: {dispositivo}
⚠️ Problema: {problema}
🕐 Última vez funcionou: {ultima_vez}
✅ Já tentou: {tentativas}
📊 Histórico: {historico_tentativas}
⚡ Urgência: {urgencia}`,

      cancelamento: `⚠️ **CLIENTE INSATISFEITO - ATENÇÃO**
👤 Nome: {nome}
📱 Contato: {telefone}
❌ Motivo: {motivo_insatisfacao}
📋 Histórico: {historico_problemas}
🎯 Ação sugerida: {acao_sugerida}
⚡ PRIORIDADE: ALTA`
    };
  }

  // Verificar se precisa de transferência
  verificarNecessidadeTransferencia(mensagem, historicoConversa, classificacao) {
    const mensagemLower = mensagem.toLowerCase();
    const tentativasIA = historicoConversa.filter(h => h.automated).length;
    
    // Verificar transferência imediata
    for (const criterio of this.criteriosTransferencia.transferencia_imediata) {
      if (mensagemLower.includes(criterio)) {
        return {
          necessaria: true,
          tipo: 'imediata',
          motivo: `Cliente mencionou: "${criterio}"`,
          urgencia: 'alta'
        };
      }
    }

    // Verificar problemas complexos (após múltiplas tentativas da IA)
    if (tentativasIA >= 2) {
      for (const criterio of this.criteriosTransferencia.problemas_complexos) {
        if (mensagemLower.includes(criterio)) {
          return {
            necessaria: true,
            tipo: 'suporte_complexo',
            motivo: `Problema persiste após ${tentativasIA} tentativas da IA`,
            urgencia: 'alta'
          };
        }
      }
    }

    // Verificar vendas especiais
    for (const criterio of this.criteriosTransferencia.vendas_especiais) {
      if (mensagemLower.includes(criterio)) {
        return {
          necessaria: true,
          tipo: 'vendas_especial',
          motivo: `Solicitação comercial específica: "${criterio}"`,
          urgencia: 'media'
        };
      }
    }

    // Verificar se IA não conseguiu resolver (muitas interações sem sucesso)
    if (tentativasIA >= 3 && classificacao.confianca < 50) {
      return {
        necessaria: true,
        tipo: 'ia_insuficiente',
        motivo: 'IA não conseguiu resolver após múltiplas tentativas',
        urgencia: 'media'
      };
    }

    return {
      necessaria: false,
      tipo: null,
      motivo: 'IA pode continuar atendimento',
      urgencia: 'baixa'
    };
  }

  // Coletar informações antes da transferência
  coletarInformacoesTransferencia(tipoTransferencia, dadosJaColetados, etapaAtual = 'inicio') {
    let template;
    let proximaEtapa;
    
    switch (tipoTransferencia) {
      case 'vendas_especial':
      case 'vendas':
        if (etapaAtual === 'inicio') {
          template = this.templatesColeta.dados_basicos_comprador;
        } else if (etapaAtual === 'coletar_dispositivo_interesse') {
          template = this.templatesColeta.coletar_dispositivo_interesse;
          template.pergunta = template.pergunta.replace('{nome}', dadosJaColetados.nome || 'amigo(a)');
        } else if (etapaAtual === 'coletar_necessidade') {
          template = this.templatesColeta.coletar_necessidade;
        }
        break;
        
      case 'suporte_complexo':
      case 'suporte':
        if (etapaAtual === 'inicio') {
          template = this.templatesColeta.dados_tecnicos_cliente;
        } else if (etapaAtual === 'coletar_detalhes_problema') {
          template = this.templatesColeta.coletar_detalhes_problema;
        }
        break;
        
      case 'imediata':
        // Transferência imediata - mínima coleta
        return {
          mensagem: "Entendo sua situação. Vou te conectar imediatamente com nosso supervisor. Aguarde um momento...",
          coleta_completa: true,
          pronto_para_transferir: true
        };
    }

    return {
      mensagem: template.pergunta + (template.opcoes ? '\n\n' + template.opcoes : ''),
      coleta_completa: template.proximo_passo.includes('finalizar'),
      proxima_etapa: template.proximo_passo,
      pronto_para_transferir: false
    };
  }

  // Gerar resumo para o atendente humano
  gerarResumoParaAtendente(tipoTransferencia, dadosCliente, historicoConversa, motivoTransferencia) {
    let template;
    
    // Selecionar template baseado no tipo
    if (tipoTransferencia.includes('vendas')) {
      template = this.templateResumo.vendas;
    } else if (tipoTransferencia.includes('suporte')) {
      template = this.templateResumo.suporte;
    } else if (tipoTransferencia === 'imediata') {
      template = this.templateResumo.cancelamento;
    }

    // Substituir variáveis no template
    let resumo = template
      .replace('{nome}', dadosCliente.nome || 'Não informado')
      .replace('{telefone}', dadosCliente.telefone || 'Não informado')
      .replace('{interesse}', dadosCliente.interesse || 'Não especificado')
      .replace('{dispositivo}', dadosCliente.dispositivo || 'Não informado')
      .replace('{aplicativo}', dadosCliente.aplicativo || 'Não informado')
      .replace('{problema}', dadosCliente.problema || 'Não especificado')
      .replace('{classificacao}', dadosCliente.classificacao || 'Indefinida')
      .replace('{prioridade}', dadosCliente.prioridade || 'Media')
      .replace('{urgencia}', motivoTransferencia.urgencia || 'Media');

    // Adicionar contexto do histórico
    const ultimasMensagens = historicoConversa.slice(-3).map(h => 
      `${h.direction}: ${h.message.substring(0, 50)}...`
    ).join('\n');

    resumo += `\n\n📝 **ÚLTIMAS MENSAGENS:**\n${ultimasMensagens}`;
    resumo += `\n\n🎯 **MOTIVO DA TRANSFERÊNCIA:** ${motivoTransferencia.motivo}`;

    return resumo;
  }

  // Processo completo de handover
  processarHandover(mensagem, contato, historicoConversa, classificacao, etapaAtual = 'verificar') {
    const resultado = {
      precisa_transferir: false,
      tipo_transferencia: null,
      acao_ia: '',
      mensagem_cliente: '',
      resumo_atendente: '',
      dados_coletados: {},
      proxima_etapa: '',
      urgencia: 'baixa'
    };

    // Etapa 1: Verificar se precisa de transferência
    if (etapaAtual === 'verificar') {
      const necessidade = this.verificarNecessidadeTransferencia(mensagem, historicoConversa, classificacao);
      
      if (!necessidade.necessaria) {
        resultado.acao_ia = 'continuar_atendimento';
        return resultado;
      }

      resultado.precisa_transferir = true;
      resultado.tipo_transferencia = necessidade.tipo;
      resultado.urgencia = necessidade.urgencia;
      
      // Iniciar coleta de informações
      const coleta = this.coletarInformacoesTransferencia(necessidade.tipo, {}, 'inicio');
      resultado.mensagem_cliente = coleta.mensagem;
      resultado.proxima_etapa = coleta.proxima_etapa || 'coletando_dados';
      resultado.acao_ia = 'coletar_dados_transferencia';
      
      return resultado;
    }

    // Etapa 2: Continuando coleta de dados
    if (etapaAtual.startsWith('coletar_')) {
      // Processar resposta e continuar coleta
      const coleta = this.coletarInformacoesTransferencia(
        classificacao.tipo, 
        contato, 
        etapaAtual
      );
      
      resultado.mensagem_cliente = coleta.mensagem;
      resultado.proxima_etapa = coleta.proxima_etapa;
      resultado.pronto_para_transferir = coleta.coleta_completa;
      
      if (coleta.coleta_completa) {
        resultado.acao_ia = 'executar_transferencia';
        resultado.resumo_atendente = this.gerarResumoParaAtendente(
          resultado.tipo_transferencia,
          contato,
          historicoConversa,
          { motivo: 'Dados coletados', urgencia: resultado.urgencia }
        );
      } else {
        resultado.acao_ia = 'continuar_coleta';
      }
      
      return resultado;
    }

    return resultado;
  }

  // Mensagem final de transferência
  gerarMensagemTransferencia(tipoTransferencia, urgencia) {
    const mensagens = {
      vendas: "Perfeito! Todas as informações coletadas. Agora vou te conectar com nosso especialista em vendas que vai cuidar de você pessoalmente. Ele tem acesso a descontos exclusivos! 😊",
      
      suporte: "Ótimo! Com essas informações nosso técnico especializado vai resolver seu problema rapidinho. Ele já está vendo seu caso e vai te responder em instantes! 🔧",
      
      imediata: "Entendi perfeitamente sua situação. Já estou conectando você diretamente com nosso supervisor para resolver isso com a atenção especial que você merece! ⚡"
    };

    let tipoBase = tipoTransferencia.includes('vendas') ? 'vendas' : 
                   tipoTransferencia.includes('suporte') ? 'suporte' : 'imediata';
                   
    return mensagens[tipoBase] || mensagens.imediata;
  }
}

module.exports = HandoverSystem;
