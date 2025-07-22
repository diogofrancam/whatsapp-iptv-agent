class LeadClassifier {
  constructor() {
    // Padrões para identificar COMPRADORES (leads novos)
    this.compradorPatterns = [
      // Interesse inicial limpo (sem problemas)
      /\b(eu quero|quero)\b.*(?!.*\b(não|problema|funciona))/i,
      /\b(preço|valor|quanto custa|promoção|desconto)\b/i,
      /\b(como funciona)\b.*(?!.*\b(não|problema))/i,
      /\b(planos|pacote|sky|netflix|interesse|testar)\b/i,
      /\b(primeira vez|novo|começar|ativar)\b/i,
      
      // Campanhas e disparos
      /\b(vi sua mensagem|recebi|campanha)\b/i,
      /\b(indicação|indicaram|recomendaram)\b/i
    ];

    // Padrões para identificar CLIENTES (existentes) - PRIORIDADE ALTA
    this.clientePatterns = [
      // Problemas técnicos específicos - PESO ALTO
      /\b(não funciona|não está funcionando|não abre|não carrega)\b/i,
      /\b(parou|travando|lento|erro|problema)\b/i,
      /\b(tem algum aplicativo que funciona|aplicativo que funciona)\b/i,
      
      // Dispositivos com problemas
      /\b(fire stick|tv|celular).*\b(não|problema|funciona)\b/i,
      /\b(aplicativo|app).*\b(não|problema|funciona|abre)\b/i,
      
      // Suporte e renovação
      /\b(suporte|ajuda|técnico|atendimento)\b/i,
      /\b(renovar|renovação|vencendo|venceu)\b/i,
      /\b(pagar|pagamento|mensalidade|taxa)\b/i,
      /\b(plano|upgrade|mudar)\b.*\b(meu|minha)\b/i,
      
      // Cliente já estabelecido
      /\b(meu acesso|minha conta|já paguei|cliente)\b/i,
      /\b(antes funcionava|funcionava|estava funcionando)\b/i,
      
      // Apps específicos mencionados com problemas
      /\b(9xtream|xpiptv|vu iptv|smart iptv).*\b(não|problema)\b/i
    ];

    // Dados essenciais para coletar
    this.dadosEssenciais = {
      // Dispositivos
      dispositivos: [
        'fire stick', 'firestick', 'tv android', 'samsung', 'lg', 
        'celular', 'iphone', 'android', 'tablet', 'pc', 'computador'
      ],
      
      // Aplicativos
      aplicativos: [
        '9xtream', 'xpiptv', 'vu iptv', 'smart iptv', 'ss iptv',
        'iptv smarters', 'xciptv', 'canalplay', 'smart one'
      ],
      
      // Problemas técnicos
      problemas: [
        'não abre', 'não carrega', 'travando', 'lento', 'erro',
        'não conecta', 'sem som', 'sem imagem', 'bufferando', 'não funciona'
      ],
      
      // Intenções
      intencoes: [
        'comprar', 'renovar', 'upgrade', 'cancelar', 'suporte',
        'testar', 'ativar', 'problema', 'dúvida'
      ]
    };
  }

  // Classificar lead baseado na mensagem e histórico
  classificarLead(mensagem, historico = []) {
    const resultado = {
      tipo: null,
      confianca: 0,
      dados_coletados: {},
      proxima_acao: '',
      prioridade: 'media'
    };

    // Converter para minúscula para análise
    const mensagemLower = mensagem.toLowerCase();
    
    // Verificar se é cliente existente pelo histórico
    const temHistorico = historico.length > 0;
    const jaComprou = historico.some(h => 
      h.message && (h.message.includes('pagamento') || 
      h.message.includes('ativado') ||
      h.message.includes('comprovante'))
    );

    // Scoring para CLIENTE (prioridade alta) - peso maior
    let scoreCliente = 0;
    this.clientePatterns.forEach(pattern => {
      if (pattern.test(mensagem)) {
        scoreCliente += 2; // Peso maior para padrões de cliente
      }
    });

    // Scoring para COMPRADOR - peso menor
    let scoreComprador = 0;
    this.compradorPatterns.forEach(pattern => {
      if (pattern.test(mensagem)) {
        scoreComprador += 1;
      }
    });

    // Ajustar scores baseado no histórico
    if (jaComprou) {
      scoreCliente += 3; // Forte indicador de cliente existente
    }
    
    if (!temHistorico && scoreCliente === 0) {
      scoreComprador += 1; // Favor para novos contatos SEM problemas
    }

    // REGRA ESPECIAL: Se menciona app específico + problema = CLIENTE
    const temAppEspecifico = this.dadosEssenciais.aplicativos.some(app => 
      mensagemLower.includes(app.toLowerCase())
    );
    const temProblema = this.dadosEssenciais.problemas.some(problema => 
      mensagemLower.includes(problema.toLowerCase())
    );
    
    if (temAppEspecifico && temProblema) {
      scoreCliente += 3;
    }

    // REGRA ESPECIAL: "tem algum aplicativo que funciona" = CLIENTE
    if (mensagemLower.includes('tem algum aplicativo que funciona')) {
      scoreCliente += 4;
    }

    // Determinar tipo
    if (scoreCliente > scoreComprador) {
      resultado.tipo = 'CLIENTE';
      resultado.confianca = Math.min(scoreCliente * 15 + 30, 95);
      resultado.proxima_acao = 'identificar_problema_ou_necessidade';
    } else if (scoreComprador > 0) {
      resultado.tipo = 'COMPRADOR';
      resultado.confianca = Math.min(scoreComprador * 20 + 30, 85);
      resultado.proxima_acao = 'apresentar_produto_e_testar';
    } else {
      resultado.tipo = 'INDEFINIDO';
      resultado.confianca = 30;
      resultado.proxima_acao = 'fazer_pergunta_qualificadora';
    }

    // Coletar dados essenciais
    resultado.dados_coletados = this.extrairDados(mensagem);

    // Determinar prioridade
    resultado.prioridade = this.calcularPrioridade(mensagem, resultado.tipo);

    return resultado;
  }

  // Extrair dados essenciais da mensagem - MELHORADO
  extrairDados(mensagem) {
    const dados = {
      dispositivo: null,
      aplicativo: null,
      problema: null,
      intencao: null
    };

    const mensagemLower = mensagem.toLowerCase();

    // Identificar dispositivo - ordem por especificidade
    const dispositivosOrdenados = [
      'fire stick', 'firestick', 'tv android', 'samsung', 'lg',
      'iphone', 'android', 'celular', 'tablet', 'pc', 'computador'
    ];
    
    for (const dispositivo of dispositivosOrdenados) {
      if (mensagemLower.includes(dispositivo.toLowerCase())) {
        dados.dispositivo = dispositivo;
        break;
      }
    }

    // Identificar aplicativo
    for (const app of this.dadosEssenciais.aplicativos) {
      if (mensagemLower.includes(app.toLowerCase())) {
        dados.aplicativo = app;
        break;
      }
    }

    // Identificar problema
    for (const problema of this.dadosEssenciais.problemas) {
      if (mensagemLower.includes(problema.toLowerCase())) {
        dados.problema = problema;
        break;
      }
    }

    // Identificar intenção
    for (const intencao of this.dadosEssenciais.intencoes) {
      if (mensagemLower.includes(intencao.toLowerCase())) {
        dados.intencao = intencao;
        break;
      }
    }

    return dados;
  }

  // Resto das funções igual...
  calcularPrioridade(mensagem, tipo) {
    const mensagemLower = mensagem.toLowerCase();
    
    // Alta prioridade
    const altaPrioridade = [
      'urgente', 'parou', 'não funciona', 'problema sério',
      'quero cancelar', 'não paguei', 'venceu'
    ];
    
    // Baixa prioridade
    const baixaPrioridade = [
      'curiosidade', 'talvez', 'depois', 'futuramente',
      'só queria saber', 'informação'
    ];

    for (const palavra of altaPrioridade) {
      if (mensagemLower.includes(palavra)) {
        return 'alta';
      }
    }

    for (const palavra of baixaPrioridade) {
      if (mensagemLower.includes(palavra)) {
        return 'baixa';
      }
    }

    // Clientes com problemas = alta prioridade
    if (tipo === 'CLIENTE') {
      return 'alta';
    }

    // Compradores interessados = média prioridade
    if (tipo === 'COMPRADOR') {
      return 'media';
    }

    return 'media';
  }
}

module.exports = LeadClassifier;
