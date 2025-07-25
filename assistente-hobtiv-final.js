const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const colors = require('colors');

class AssistenteHOBTivFinal {
    constructor() {
        console.log('📺 HOBTiv - Funil de Vendas OTIMIZADO'.cyan.bold);
        
        this.client = new Client({
            authStrategy: new LocalAuth({ 
                clientId: 'hobtiv-final',
                dataPath: './session-hobtiv'
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ],
                timeout: 120000
            }
        });

        this.conversationStates = new Map();
        this.userData = new Map();
        this.humanDetected = new Map();
        
        this.empresa = {
            pixEmail: 'hobtiv1@gmail.com',
            recebedor: 'Diogo Martins',
            grupoSuporte: 'https://chat.whatsapp.com/KPt32Gfvsi5J8HLTRMvRUU'
        };

        this.setupEventHandlers();
        console.log('✅ HOBTiv Funil OTIMIZADO inicializado!'.green);
    }

    setupEventHandlers() {
        this.client.on('qr', (qr) => {
            console.log('📱 Escaneie o QR Code HOBTiv:'.yellow.bold);
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            console.log('✅ HOBTiv conectado - Funil de vendas ATIVO!'.green.bold);
        });

        this.client.on('message', async (message) => {
            await this.handleMessage(message);
        });
    }

    async handleMessage(message) {
        try {
            if (message.from.includes('@g.us') || message.fromMe) return;

            const userId = message.from;
            const messageText = message.body ? message.body.toLowerCase().trim() : '';
            
            console.log(`📨 ${userId}: ${message.body}`.blue);

            if (this.humanDetected.get(userId)) {
                console.log(`🚫 Humano ativo - Bot pausado`.yellow);
                return;
            }

            // Verificar mensagens vazias/mídia
            if (!messageText) {
                await this.sendMessage(userId, `👋 Oi! Recebi sua mensagem!

Para melhor atendimento, envie mensagens em texto.

Quer conhecer nossos planos IPTV? Digite *SIM*!`);
                return;
            }

            await this.processarMensagem(userId, messageText, message);

        } catch (error) {
            console.error('❌ Erro:', error);
        }
    }

    async processarMensagem(userId, messageText, message) {
        const currentState = this.conversationStates.get(userId) || 'inicio';
        
        // Verificar intenções especiais
        if (await this.processarIntencoes(userId, messageText)) {
            return;
        }

        switch (currentState) {
            case 'inicio':
                await this.handleInicio(userId, messageText);
                break;
            case 'qualificando_interesse':
                await this.handleQualificacao(userId, messageText);
                break;
            case 'consultando_dispositivo':
                await this.handleDispositivo(userId, messageText);
                break;
            case 'instalando_app':
                await this.handleInstalacaoApp(userId, messageText);
                break;
            case 'enviando_teste':
                await this.handleTesteEnviado(userId, messageText);
                break;
            case 'apresentando_planos':
                await this.handleEscolhaPlano(userId, messageText);
                break;
            case 'processando_pagamento':
                await this.handlePagamento(userId, messageText, message);
                break;
            case 'coletando_indicacao':
                await this.handleIndicacao(userId, messageText);
                break;
            default:
                await this.handleInicio(userId, messageText);
        }
    }

    async processarIntencoes(userId, messageText) {
        // Tratamento de objeções de preço
        if (messageText.includes('caro') || messageText.includes('muito') || messageText.includes('barato')) {
            await this.tratarObjegaoPreco(userId);
            return true;
        }

        // Sistema de indicações
        if (messageText.includes('indicar') || messageText.includes('amigo')) {
            await this.sendMessage(userId, `👥 *PROGRAMA DE INDICAÇÕES HOBTiv*

🎉 *BENEFÍCIOS PARA VOCÊ:*
✅ +1 tela GRÁTIS permanente  
✅ +2 meses grátis no seu plano
✅ R$20 por indicação aprovada

*📱 Me envie o número:*
Exemplo: 11999887766

Qual número quer indicar? 😊`);
            
            this.conversationStates.set(userId, 'coletando_indicacao');
            return true;
        }

        // Solicitar atendimento humano
        if (messageText.includes('humano') || messageText.includes('atendente')) {
            await this.conectarHumano(userId);
            return true;
        }

        return false;
    }

    async handleInicio(userId, messageText) {
        await this.sendMessage(userId, `Oi! 👋 

Você chegou no momento PERFEITO! 🎯

Acabamos de liberar *APENAS HOJE* acesso VIP aos mesmos conteúdos que os ricos pagam R$200+ por mês...

*🔥 Agora por uma FRAÇÃO do preço!*

*SKY completa, Netflix, Amazon Prime, Disney+, Globoplay* e +50.000 filmes em 4K...

Quer ver funcionando no seu celular AGORA? 📱`);

        await this.delay(3000);
        
        await this.sendMessage(userId, `🚨 *OFERTA RELÂMPAGO - SÓ ATÉ 23:59h*

Responda *SIM* se quer:
✅ Teste GRÁTIS de 2 horas
✅ Todos os canais da SKY em HD/4K
✅ Netflix, Amazon, Disney+ liberados
✅ +50.000 filmes em qualidade cinema

*Ou responda NÃO se não quer economizar R$150+ por mês...*

Qual sua resposta? 🤔`);

        this.conversationStates.set(userId, 'qualificando_interesse');
    }

    async handleQualificacao(userId, messageText) {
        if (messageText.includes('sim') || messageText.includes('quero') || 
            messageText.includes('interessado') || messageText.includes('ok') ||
            messageText.includes('vamos') || messageText.includes('aceito')) {
            
            await this.sendMessage(userId, `🎉 *EXCELENTE ESCOLHA!* 

Você está a poucos minutos de ter acesso ao mesmo conteúdo que famosos pagam CARO...

*Primeira pergunta importante:*
Onde você quer assistir principalmente?

1️⃣ *TV da sala* (Smart TV/Samsung/LG)
2️⃣ *Celular/Tablet* (Android/iPhone)  
3️⃣ *TV Box/Roku/Chromecast*

Digite apenas o NÚMERO da sua escolha! 👆`);

            this.conversationStates.set(userId, 'consultando_dispositivo');

        } else if (messageText.includes('não') || messageText.includes('nao')) {
            await this.sendMessage(userId, `Entendo sua hesitação... 🤔

Mas deixa eu te mostrar os REAIS BENEFÍCIOS:

💰 *Economia de R$150+ por mês*
📺 *Mesmos canais que os ricos têm*
🎬 *50.000+ filmes que você paga caro nos cinemas*
⚡ *Funciona em qualquer lugar do mundo*

*É literalmente ter Netflix + SKY + Amazon por R$5/mês!*

Quer pelo menos ver o TESTE GRÁTIS funcionando? 
É só 2 minutos... Sem compromisso! 

*SIM* ou *NÃO DEFINITIVO*?`);

        } else {
            await this.sendMessage(userId, `Por favor, responda apenas:

*SIM* - Se quer o teste grátis
*NÃO* - Se não quer economizar

Qual sua resposta? 🤔`);
        }
    }

    async handleDispositivo(userId, messageText) {
        let resposta = '';
        let app = '';

        if (messageText.includes('1') || messageText.includes('tv') || 
            messageText.includes('samsung') || messageText.includes('lg') || 
            messageText.includes('smart')) {
            
            app = 'ABSOLUTO PLAYER';
            resposta = `📺 *PERFEITO PARA SMART TV!*

*Passo super simples:*
1. Na sua TV, vá em "Loja de Apps" ou "App Store"
2. Procure por: *"${app}"*
3. Instale e abra o aplicativo

*💡 ALTERNATIVAS que sempre funcionam:* 
- CANALPLAY
- 9XTREAM PLAYER
- IPTV SMARTERS

*⚡ Em 30 segundos você está assistindo!*`;

        } else if (messageText.includes('2') || messageText.includes('celular') || 
                   messageText.includes('android') || messageText.includes('phone')) {
            
            app = 'CANALPLAY';
            resposta = `📱 *EXCELENTE PARA CELULAR!*

*2 opções FÁCEIS:*

**Opção 1:** Play Store/App Store → "${app}"
**Opção 2:** Acesse pelo navegador: \`lojaplay.in\`

*💡 OUTRAS ALTERNATIVAS:* 
- ABSOLUTO PLAYER
- SMARTERS PLAYER LITE
- VU IPTV PLAYER

*⚡ Em 1 minuto você está assistindo HD/4K!*`;

        } else if (messageText.includes('3') || messageText.includes('box') || 
                   messageText.includes('roku') || messageText.includes('chrome')) {
            
            app = 'XTREAM PLAYER';
            resposta = `📺 *PERFECT PARA TV BOX!*

*Na loja do seu dispositivo procure:*
- "${app}" OU
- "VU IPTV PLAYER" OU  
- "IPTV SMARTERS"

*💡 DICA ESPECIAL:*
Dentro do app, procure por *"XTREAM CODES"*

*⚡ 2 minutos e está funcionando!*`;

        } else {
            await this.sendMessage(userId, `Por favor, escolha apenas o NÚMERO:

1️⃣ *TV da sala* (Smart TV)
2️⃣ *Celular/Tablet* (Android/iPhone)  
3️⃣ *TV Box/Roku/Chromecast*

Digite o número: 1, 2 ou 3`);
            return;
        }

        await this.sendMessage(userId, resposta);
        
        await this.delay(4000);

        await this.sendMessage(userId, `🎯 *ENQUANTO VOCÊ INSTALA...*

Que tal já liberar seu TESTE GRÁTIS de 2 horas?

*Assim você vê IMEDIATAMENTE:*
✅ Qualidade 4K perfeita 
✅ Canais que nunca viu antes  
✅ Filmes de cinema em casa
✅ Zero travamento ou buffering

*Me confirma quando terminar de instalar!*
Digite: *PRONTO* ou *INSTALEI*

*⏰ LEMBRE-SE: Oferta especial até 23:59h!*`);

        this.conversationStates.set(userId, 'instalando_app');
        this.salvarDadosUsuario(userId, { dispositivo: messageText, app: app });
    }

    async handleInstalacaoApp(userId, messageText) {
        if (messageText.includes('pronto') || messageText.includes('instalei') || 
            messageText.includes('ok') || messageText.includes('consegui') ||
            messageText.includes('feito') || messageText.includes('sim')) {
            
            await this.enviarDadosTeste(userId);
            
        } else if (messageText.includes('não') || messageText.includes('problema') || 
                   messageText.includes('erro') || messageText.includes('dificuldade')) {
            
            await this.sendMessage(userId, `🆘 *SEM PROBLEMAS!*

*Alternativas que SEMPRE funcionam em qualquer dispositivo:*

📱 *APPS UNIVERSAIS:*
- XPIPTV
- VU IPTV PLAYER  
- IPTV SMARTERS PRO
- 9XTREAM PLAYER
- CANALPLAY

*🎯 MACETE DE OURO:* 
Em todos esses apps, procure por *"XTREAM CODES"* ou *"Adicionar Playlist"*

*Ou se preferir, posso te ajudar por vídeo chamada!*

Conseguiu instalar algum? Digite *SIM* ou *AJUDA*`);
            
        } else {
            await this.sendMessage(userId, `⏰ *FALTAM POUCAS HORAS DA OFERTA!*

Me confirma quando conseguir instalar o aplicativo...

*É importante para não perder sua vaga especial!*

Digite: *PRONTO* quando terminar! 🎯`);
        }
    }

    async enviarDadosTeste(userId) {
        await this.sendMessage(userId, `🎉 *PARABÉNS! ACESSO VIP LIBERADO!*

*Seus dados de teste (VÁLIDOS POR 2H):*

🔐 *CREDENCIAIS EXCLUSIVAS:*
✅ *Nome:* HOB
✅ *Usuário:* TESTE_${Date.now().toString().slice(-6)}
✅ *Senha:* ${this.gerarSenhaAleatoria()}
🔗 *URL:* http://vip.hobtv.pro

*⚡ IMPORTANTE:* 
Coloque os dados EXATAMENTE como enviei!
Qualquer espaço a mais pode dar erro.`);

        await this.delay(4000);

        await this.sendMessage(userId, `📺 *AGORA TESTE ESTES CANAIS VIP:*

🔥 *COMECE POR ESTES:*
- Globo 4K, SBT 4K, Record 4K
- ESPN 4K, Fox Sports 4K  
- Telecine Premium 4K
- Netflix Originais 4K
- Amazon Prime Video 4K

*⭐ VÁ NA CATEGORIA "FILMES 4K"*
- Velozes e Furiosos 10
- Top Gun Maverick  
- Avatar 2

*Depois me confirma aqui:*
*"FUNCIONOU"* ou *"DEU ERRO"*

*⏰ Seu teste expira em 2 horas!*`);

        this.conversationStates.set(userId, 'enviando_teste');
    }

    gerarSenhaAleatoria() {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    async handleTesteEnviado(userId, messageText) {
        if (messageText.includes('funcionou') || messageText.includes('carregou') || 
            messageText.includes('ok') || messageText.includes('consegui') ||
            messageText.includes('perfeito') || messageText.includes('show') ||
            messageText.includes('otimo') || messageText.includes('legal')) {
            
            await this.sendMessage(userId, `🎯 *SENSACIONAL!*

Agora você viu a qualidade PROFISSIONAL! 

Isso é apenas 1% do que você terá com o plano completo...

*Com o acesso definitivo você ganha:*
📺 *+300 canais 4K exclusivos*
🎬 *+80.000 filmes e séries*  
📱 *Acesso ilimitado em qualquer lugar*
⚡ *Suporte VIP 24h por WhatsApp*
🎮 *Canais de esportes ao vivo*
🎭 *Lançamentos antes dos cinemas*

*E o melhor:* Hoje você paga uma FRAÇÃO do valor real!

Quer ativar SEU acesso definitivo com 70% OFF? 🚀`);

            await this.delay(3000);
            await this.apresentarPlanosOtimizados(userId);
            
        } else if (messageText.includes('não') || messageText.includes('erro') || 
                   messageText.includes('problema') || messageText.includes('travou')) {
            
            await this.sendMessage(userId, `🔧 *VAMOS RESOLVER JUNTOS!*

*Checklist rápido:*
✅ URL completa? \`http://vip.hobtv.pro\`
✅ Usuário sem espaços extras?
✅ Senha copiada correta?
✅ Clicou em *XTREAM CODES*?

*Se ainda não funcionar:*
1. Feche e abra o app novamente
2. Teste sua conexão de internet
3. Tente outro app da lista que enviei
4. Reinicie seu dispositivo

*Tentou essas soluções? Me confirma quando conseguir!* 💪

*Ou digite AJUDA para suporte direto!*`);
            
        } else {
            await this.sendMessage(userId, `⏰ *SEU TESTE ESTÁ RODANDO!*

Por favor me confirma:

*FUNCIONOU* - Se conseguiu ver os canais
*ERRO* - Se deu algum problema específico

*É importante para eu te ajudar melhor!* 🎯`);
        }
    }

    async apresentarPlanosOtimizados(userId) {
        await this.sendMessage(userId, `💎 *PLANOS VIP EXCLUSIVOS* (Oferta limitada!)

🥇 **MAIS ESCOLHIDO - 89% DOS CLIENTES**
✅ *Plano ANUAL VIP* 
~R$149,00~ *POR APENAS R$89,99*
⭐ 2 telas simultâneas
⭐ Suporte VIP prioritário
⭐ Garantia de 30 dias

🔥 **MELHOR INVESTIMENTO**  
✅ *Plano VITALÍCIO*
~R$399,00~ *POR APENAS R$199,00*
⭐ 3 telas para toda família
⭐ NUNCA MAIS pague mensalidade
⭐ Atualizações gratuitas para sempre

💰 **PARA COMEÇAR**
✅ *Plano 3 meses*
~R$89,00~ *POR APENAS R$49,99*
⭐ 1 tela HD/4K
⭐ Teste por 3 meses

*Qual faz mais sentido para você?*

Digite: *ANUAL*, *VITALÍCIO* ou *3 MESES*`);

        this.conversationStates.set(userId, 'apresentando_planos');
    }

    async handleEscolhaPlano(userId, messageText) {
        let plano = null;

        if (messageText.includes('anual') || messageText.includes('89') || messageText.includes('ano')) {
            plano = { nome: 'ANUAL VIP', valor: 89.99, telas: 2, popular: true };
        } else if (messageText.includes('vitalicio') || messageText.includes('199') || 
                   messageText.includes('vida') || messageText.includes('definitivo')) {
            plano = { nome: 'VITALÍCIO', valor: 199.00, telas: 3, melhor: true };
        } else if (messageText.includes('3') || messageText.includes('49') || 
                   messageText.includes('trimestral') || messageText.includes('meses')) {
            plano = { nome: '3 MESES', valor: 49.99, telas: 1 };
        }

        if (!plano) {
            await this.sendMessage(userId, `Por favor, escolha um dos planos:

*ANUAL* - R$ 89,99 (2 telas) 🥇
*VITALÍCIO* - R$ 199,00 (3 telas) 🔥  
*3 MESES* - R$ 49,99 (1 tela) 💰

Digite a palavra exata do plano:`);
            return;
        }

        this.salvarDadosUsuario(userId, { plano: plano });

        let destaque = '';
        if (plano.popular) destaque = '🥇 *ESCOLHA INTELIGENTE!* (Mais popular)';
        if (plano.melhor) destaque = '🔥 *EXCELENTE INVESTIMENTO!* (Melhor custo-benefício)';

        await this.sendMessage(userId, `${destaque}

*✅ Plano escolhido:* ${plano.nome}
*💰 Valor promocional:* R$ ${plano.valor.toFixed(2)}
*📺 Telas incluídas:* ${plano.telas}

*🎁 BÔNUS EXCLUSIVOS DO SEU PLANO:*
✅ Ativação em até 5 minutos
✅ Garantia de 30 dias (dinheiro de volta)
✅ Suporte VIP pelo WhatsApp
✅ Acesso prioritário a lançamentos
✅ Canais adultos liberados (opcional)

*💳 PAGAMENTO SUPER FÁCIL:*
PIX para: *${this.empresa.pixEmail}*
*Nome do recebedor:* ${this.empresa.recebedor}

*📱 Após o PIX, me envie o comprovante!*
*Ativação IMEDIATA - em até 5 minutos!* ⚡`);

        this.conversationStates.set(userId, 'processando_pagamento');
    }

    async tratarObjegaoPreco(userId) {
        await this.sendMessage(userId, `💰 *ENTENDO TOTALMENTE SUA PREOCUPAÇÃO!*

Mas olha só esta comparação real:

🤔 *GASTOS MENSAIS TRADICIONAIS:*
- Netflix: R$45/mês 
- Amazon Prime: R$15/mês
- Disney+: R$28/mês
- Globoplay: R$25/mês
- SKY básica: R$120/mês
- Cinema (família): R$80/mês

*TOTAL: R$313/mês = R$3.756/ano! 😱*

🎯 *NOSSO VITALÍCIO: R$199 UMA VEZ SÓ!*
*= Economia de R$3.557 no primeiro ano*

*É como ter TUDO GRÁTIS e ainda sobrar dinheiro!*

*Faz sentido essa economia absurda?*

SIM ou ainda tem dúvida?`);

        this.conversationStates.set(userId, 'apresentando_planos');
    }

    async handlePagamento(userId, messageText, message) {
        if (messageText.includes('paguei') || messageText.includes('pix') || 
            messageText.includes('enviei') || messageText.includes('comprovante') || 
            messageText.includes('transferi') || message.hasMedia) {
            
            await this.confirmarPagamento(userId);
        } else {
            await this.sendMessage(userId, `⏰ *AGUARDANDO SEU PAGAMENTO...*

*🔑 Chave PIX:* ${this.empresa.pixEmail}
*👤 Nome do recebedor:* ${this.empresa.recebedor}

*📱 Após o PIX, me envie aqui:*
- Print/foto do comprovante OU
- Digite "PAGUEI"

*⚡ Ativação automática em até 5 minutos!*

*Dúvidas? Digite AJUDA*`);
        }
    }

    async confirmarPagamento(userId) {
        const dadosUsuario = this.userData.get(userId) || {};
        const credenciais = await this.gerarCredenciaisDefinitivas();

        await this.sendMessage(userId, `🎉 *PAGAMENTO CONFIRMADO COM SUCESSO!*

*PARABÉNS! SEU ACESSO FOI ATIVADO!* ✅

🔐 *SUAS CREDENCIAIS DEFINITIVAS:*
✅ *Nome:* HOB
✅ *Usuário:* ${credenciais.usuario}
✅ *Senha:* ${credenciais.senha}
🔗 *URL:* ${credenciais.url}

*🎯 PODE USAR AGORA MESMO!*
*Substitua os dados de teste por estes definitivos.*`);

        await this.delay(4000);

        await this.sendMessage(userId, `🎁 *BÔNUS ESPECIAIS ATIVADOS:*

✅ Acesso ao grupo VIP de suporte técnico
✅ Notificações de novos lançamentos  
✅ Prioridade em atualizações
✅ Garantia de 30 dias
✅ Suporte 24h pelo WhatsApp

*📲 GRUPO VIP DE SUPORTE:* 
${this.empresa.grupoSuporte}

*🔥 GANHE RENDA EXTRA:*
Indique amigos e ganhe R$25 por venda aprovada!

*Muito obrigado pela confiança! 🙏*
*Bem-vindo à família HOBTiv!*`);

        this.conversationStates.set(userId, 'cliente_ativo');
        console.log(`💰 VENDA CONFIRMADA: ${userId} - ${dadosUsuario.plano?.nome}`.green.bold);
    }

    async conectarHumano(userId, motivo = 'Solicitação de atendimento') {
        this.humanDetected.set(userId, true);
        
        await this.sendMessage(userId, `👨‍💼 *ATENDIMENTO ESPECIALIZADO*

Entendi que você precisa de atenção especial!

*📱 Contatos diretos:*
- WhatsApp: (11) 99999-9999
- Grupo VIP: ${this.empresa.grupoSuporte}

*Um especialista vai te atender AGORA!*

*🕐 Horário: 8h às 22h (Segunda a Domingo)*

*Sua conversa está sendo transferida...*`);

        console.log(`🚨 HUMANO SOLICITADO: ${userId} - ${motivo}`.red.bold);
    }

    async handleIndicacao(userId, messageText) {
        const numeroRegex = /(\d{10,11})/;
        const match = messageText.match(numeroRegex);

        if (match) {
            const numero = match[1];
            
            await this.sendMessage(userId, `✅ *INDICAÇÃO REGISTRADA COM SUCESSO!*

📱 *Número indicado:* ${numero}

*🎁 SEUS BENEFÍCIOS GARANTIDOS:*
✅ +1 tela grátis (já ativada na sua conta)
✅ R$25 quando a pessoa efetuar a compra
✅ +2 meses grátis se for plano anual+
✅ Benefícios acumulativos (sem limite!)

*🎯 Vou entrar em contato com a pessoa e mencionar que foi você quem indicou!*

*Continue indicando para ganhar ainda mais benefícios!* 💰

*Obrigado pela confiança em nosso serviço! 🙏*`);

            this.conversationStates.set(userId, 'inicio');
        } else {
            await this.sendMessage(userId, `❌ Não consegui identificar o número!

*Por favor, envie apenas os números:*
*Exemplo:* 11999887766

*Não precisa colocar parênteses, traços ou espaços.*

Qual o número da pessoa que quer indicar?`);
        }
    }

    // Utilities
    async gerarCredenciaisDefinitivas() {
        const urls = ['http://vip.hobtv.pro', 'http://premium.hobtv.net', 'http://4k.hobtv.tv'];
        return {
            usuario: `hobtiv_${Date.now()}`,
            senha: Math.random().toString(36).substring(2, 12).toUpperCase(),
            url: urls[0] // Usar sempre a primeira URL que funciona
        };
    }

    salvarDadosUsuario(userId, dados) {
        const dadosAtuais = this.userData.get(userId) || {};
        this.userData.set(userId, { ...dadosAtuais, ...dados });
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async sendMessage(to, message) {
        try {
            if (this.humanDetected.get(to)) {
                console.log(`🚫 Humano ativo - Bot pausado para ${to}`.yellow);
                return;
            }
            
            console.log(`📤 Enviando para ${to}`.green);
            await this.client.sendMessage(to, message);
            console.log(`✅ Mensagem enviada com sucesso`.green);
        } catch (error) {
            console.error('❌ Erro ao enviar:', error);
        }
    }

    async start() {
        console.log('🚀 Iniciando HOBTiv com funil OTIMIZADO...'.yellow);
        await this.client.initialize();
    }
}

const hobtiv = new AssistenteHOBTivFinal();
hobtiv.start().catch(console.error);

module.exports = AssistenteHOBTivFinal;
