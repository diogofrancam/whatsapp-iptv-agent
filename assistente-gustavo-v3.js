const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');
const colors = require('colors');
require('dotenv').config();

class AssistenteHOBTivReal {
    constructor() {
        console.log('📺 HOBTiv - Sistema REAL de Vendas (Funil Otimizado v4)'.cyan.bold);
        
        this.client = new Client({
            authStrategy: new LocalAuth({ clientId: 'hobtiv-real' }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
            }
        });

        this.conversationStates = new Map();
        this.userData = new Map();
        this.humanDetected = new Map();
        this.tentativasConversao = new Map();
        this.horaInicioConversa = new Map();
        
        this.empresa = {
            pixEmail: 'hobtiv1@gmail.com',
            recebedor: 'Diogo Martins',
            grupoSuporte: process.env.GRUPO_SUPORTE_URL || 'https://chat.whatsapp.com/KPt32Gfvsi5J8HLTRMvRUU'
        };

        this.config = {
            tempoMaximoTeste: 2,
            descontinuado: 30,
            limiteTentativas: 3,
            intervalosFollowUp: [30, 120, 300]
        };

        this.setupEventHandlers();
        console.log('✅ HOBTiv REAL inicializado com funil OTIMIZADO!'.green);
    }

    setupEventHandlers() {
        this.client.on('qr', (qr) => {
            console.log('📱 Escaneie o QR Code:'.yellow.bold);
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            console.log('✅ HOBTiv conectado! Usando funil OTIMIZADO de vendas!'.green.bold);
        });

        this.client.on('message', async (message) => {
            await this.handleMessage(message);
        });
    }

    async handleMessage(message) {
        try {
            if (message.from.includes('@g.us') || message.fromMe) return;

            const userId = message.from;
            const messageText = message.body.toLowerCase().trim();
            
            console.log(`📨 ${userId}: ${message.body}`.blue);

            if (this.humanDetected.get(userId)) {
                console.log(`🚫 Humano ativo - Bot pausado`.yellow);
                return;
            }

            if (!this.horaInicioConversa.get(userId)) {
                this.horaInicioConversa.set(userId, new Date());
            }

            await this.processarMensagem(userId, messageText, message);

        } catch (error) {
            console.error('❌ Erro:', error);
        }
    }

    async processarMensagem(userId, messageText, message) {
        const currentState = this.conversationStates.get(userId) || 'inicio';
        
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
            case 'criando_urgencia':
                await this.handleUrgencia(userId, messageText);
                break;
            case 'apresentando_planos':
                await this.handleEscolhaPlano(userId, messageText);
                break;
            case 'tratando_objecoes':
                await this.handleObjegoes(userId, messageText);
                break;
            case 'processando_pagamento':
                await this.handlePagamento(userId, messageText, message);
                break;
            case 'coletando_indicacao':
                await this.handleIndicacao(userId, messageText);
                break;
            case 'follow_up':
                await this.handleFollowUp(userId, messageText);
                break;
            default:
                await this.handleInicio(userId, messageText);
        }
    }

    async processarIntencoes(userId, messageText) {
        if (messageText.includes('caro') || messageText.includes('muito') || messageText.includes('barato')) {
            await this.tratarObjegaoPreco(userId);
            return true;
        }

        if (messageText.includes('indicar') || messageText.includes('amigo')) {
            await this.sendMessage(userId, `👥 *PROGRAMA EXCLUSIVO DE INDICAÇÕES*

🎉 *BENEFÍCIOS INCRÍVEIS PARA VOCÊ:*
✅ +1 tela GRÁTIS permanente  
✅ +2 meses grátis no seu plano
✅ Comissão de R$10 por indicação

*📱 Me envie apenas o número:*
Exemplo: 11999887766

*🔥 BÔNUS ESPECIAL:*
3+ indicações = Plano VITALÍCIO 50% OFF!

Manda o primeiro número que eu cuido de tudo! 😉`);
            
            this.conversationStates.set(userId, 'coletando_indicacao');
            return true;
        }

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

*Agora por uma fração do preço!* 💰

*SKY, Netflix, Amazon Prime, Disney+, Globoplay* e +50.000 filmes em 4K...

Quer ver funcionando no seu celular AGORA? 📱`);

        await this.delay(2000);
        
        await this.sendMessage(userId, `🔥 *OFERTA RELÂMPAGO - SÓ ATÉ 23:59h*

Responda *SIM* se quer:
✅ Teste GRÁTIS de 2 horas
✅ Todos os canais da SKY
✅ Netflix, Amazon, Disney+ liberados
✅ +50.000 filmes em 4K

*Ou responda NÃO se não quer economizar R$150+ por mês...*

Qual sua resposta? 🤔`);

        this.conversationStates.set(userId, 'qualificando_interesse');
    }

    async handleQualificacao(userId, messageText) {
        if (messageText.includes('sim') || messageText.includes('quero') || 
            messageText.includes('interessado') || messageText.includes('ok')) {
            
            await this.sendMessage(userId, `🎉 *EXCELENTE ESCOLHA!* 

Você está a poucos minutos de ter acesso ao mesmo conteúdo que famosos pagam CARO...

*Primeira pergunta importante:*
Você quer assistir principalmente na:

1️⃣ *TV da sala* (Smart TV/Samsung/LG)
2️⃣ *Celular/Tablet* (Android/iPhone)  
3️⃣ *TV Box/Roku*

Digite apenas o NÚMERO da sua escolha! 👆`);

            this.conversationStates.set(userId, 'consultando_dispositivo');

        } else if (messageText.includes('não') || messageText.includes('nao')) {
            await this.sendMessage(userId, `Entendo... 🤔

Talvez eu não expliquei direito os BENEFÍCIOS:

💰 *Economia de R$150+ por mês*
📺 *Mesmos canais que os ricos têm*
🎬 *50.000+ filmes que você paga caro*
⚡ *Funciona em qualquer lugar*

*Última chance:* Quer pelo menos ver o TESTE GRÁTIS funcionando? 

É só 2 minutos... Sem compromisso! 

*SIM* ou *NÃO*?`);

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
            messageText.includes('samsung') || messageText.includes('lg')) {
            
            app = 'ABSOLUTO PLAYER';
            resposta = `🔥 *PERFEITO PARA TV!*

*Passo simples:*
1. Na sua TV, vá em "Loja de Apps"
2. Procure: *"${app}"*
3. Instale e abra

*💡 DICA DE OURO:* 
Se não encontrar, use *"CANALPLAY"* ou *"9XTREAM"*

*⚡ É RÁPIDO - 30 segundos!*`;

        } else if (messageText.includes('2') || messageText.includes('celular') || messageText.includes('android')) {
            
            app = 'CANALPLAY';
            resposta = `📱 *EXCELENTE PARA CELULAR!*

*2 opções FÁCEIS:*

**Opção 1:** Play Store → "${app}"
**Opção 2:** Acesse: \`lojaplay.in\`

*💡 ALTERNATIVAS:* 
- ABSOLUTO PLAYER
- SMARTERS PLAYER LITE

*⚡ Em 1 minuto você está assistindo!*`;

        } else if (messageText.includes('3') || messageText.includes('box') || messageText.includes('roku')) {
            
            app = 'XTREAM PLAYER';
            resposta = `📺 *PERFECT PARA TV BOX!*

*Na loja do seu dispositivo:*
- "${app}" OU
- "VU IPTV PLAYER"

*💡 DICA ESPECIAL:*
Procure por *"XTREAM CODES"* dentro do app

*⚡ 2 minutos e está pronto!*`;

        } else {
            await this.sendMessage(userId, `Por favor, escolha apenas o NÚMERO:

1️⃣ *TV da sala* (Smart TV)
2️⃣ *Celular* (Android/iPhone)  
3️⃣ *TV Box/Roku*

Digite o número: 1, 2 ou 3`);
            return;
        }

        await this.sendMessage(userId, resposta);
        
        await this.delay(3000);

        await this.sendMessage(userId, `🎯 *ENQUANTO VOCÊ INSTALA...*

Que tal já liberar seu TESTE GRÁTIS de 2 horas?

*Assim você vê IMEDIATAMENTE:*
✅ Qualidade 4K perfeita
✅ Canais que nunca viu antes  
✅ Filmes de cinema em casa
✅ Zero travamento

*Confirma quando terminar de instalar!*
(Digite: PRONTO ou INSTALEI) 

*⏰ LEMBRE-SE: Oferta até 23:59h!*`);

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

*Alternativas que SEMPRE funcionam:*

📱 *Para QUALQUER dispositivo:*
- XPIPTV
- VU IPTV PLAYER  
- IPTV SMARTERS
- 9XTREAM PLAYER

*🎯 MACETE:* Em todos, clique em *"XTREAM CODES"*

*Ou me chama que eu te ajudo pelo vídeo!*

Conseguiu instalar algum? Digite *SIM* ou *AJUDA*`);
            
        } else {
            await this.sendMessage(userId, `⏰ *FALTAM POUCAS HORAS!*

Me confirma quando conseguir instalar o app...

*É importante para não perder sua vaga!*

Digite: *PRONTO* quando terminar! 🎯`);
        }
    }

    async enviarDadosTeste(userId) {
        await this.sendMessage(userId, `🎉 *PARABÉNS! ACESSO LIBERADO!*

*Seus dados VIP (VÁLIDOS POR 2H):*

🔐 *CREDENCIAIS EXCLUSIVAS:*
✅ *Nome:* HOB
✅ *Usuário:* TESTE_${Date.now().toString().slice(-6)}
✅ *Senha:* ${this.gerarSenhaAleatoria()}
🔗 *URL:* http://vip.hobtv.pro

*⚡ IMPORTANTE:* 
Coloque os dados EXATAMENTE como enviei!`);

        await this.delay(3000);

        await this.sendMessage(userId, `📺 *AGORA TESTE ESTES CANAIS VIP:*

🔥 *PRIMEIROS DA LISTA:*
- Globo 4K, SBT 4K, Record 4K
- ESPN 4K, Fox Sports 4K
- Netflix Originais 4K
- Amazon Prime 4K

*Depois me confirma:*
*"FUNCIONOU"* ou *"DEU ERRO"*

*⏰ Teste expira em 2 horas!*`);

        this.conversationStates.set(userId, 'enviando_teste');
        
        setTimeout(() => this.criarUrgencia(userId), 30 * 60 * 1000);
    }

    gerarSenhaAleatoria() {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    async handleTesteEnviado(userId, messageText) {
        if (messageText.includes('funcionou') || messageText.includes('carregou') || 
            messageText.includes('ok') || messageText.includes('consegui') ||
            messageText.includes('perfeito') || messageText.includes('show')) {
            
            await this.sendMessage(userId, `🎯 *SENSACIONAL!*

Viu a qualidade PROFISSIONAL? Isso é apenas 1% do que você terá!

*Com o plano completo você ganha:*
📺 *+200 canais 4K exclusivos*
🎬 *+50.000 filmes e séries*  
📱 *Acesso ilimitado em qualquer lugar*
⚡ *Suporte VIP 24h*

*E o melhor:* Hoje você paga uma FRAÇÃO do valor real!

Quer ativar SEU acesso vitalício? 🚀`);

            await this.criarUrgencia(userId);
            
        } else if (messageText.includes('não') || messageText.includes('erro') || 
                   messageText.includes('problema')) {
            
            await this.sendMessage(userId, `🔧 *VAMOS RESOLVER JUNTOS!*

*Checklist rápido:*
✅ Colocou a URL completa? \`http://vip.hobtv.pro\`
✅ Usuário sem espaços?
✅ Clicou em *XTREAM CODES*?

*Se ainda não der:*
1. Feche e abra o app
2. Teste sua internet
3. Tente outro app da lista

*Me confirma quando conseguir!* 💪`);
            
        } else {
            await this.sendMessage(userId, `⏰ *SEU TESTE ESTÁ RODANDO!*

Por favor me confirma:

*FUNCIONOU* - Se conseguiu ver os canais
*ERRO* - Se deu algum problema

*É importante para prosseguir!* 🎯`);
        }
    }

    async criarUrgencia(userId) {
        await this.sendMessage(userId, `🚨 *ALERTA URGENTE!*

Seu teste expira em BREVE e detectamos que:

⚠️ *Restam apenas 7 vagas* na promoção
⚠️ *Preço volta ao normal amanhã*
⚠️ *Esta é a ÚLTIMA chance do ano*

*DECISÃO AGORA:*
Quer GARANTIR sua vaga com 70% OFF?

*SIM* - Ver planos VIP
*NÃO* - Perder a oportunidade

*Resposta rápida:* ⏰`);

        this.conversationStates.set(userId, 'criando_urgencia');
    }

    async handleUrgencia(userId, messageText) {
        if (messageText.includes('sim') || messageText.includes('quero') || 
            messageText.includes('ok') || messageText.includes('vamos')) {
            
            await this.apresentarPlanosOtimizados(userId);
            
        } else if (messageText.includes('não') || messageText.includes('nao')) {
            await this.tratarObjegaoFinal(userId);
        } else {
            await this.sendMessage(userId, `⏰ *ÚLTIMA CHANCE!*

*SIM* - Garantir 70% desconto
*NÃO* - Perder para sempre

Qual sua resposta? 🤔`);
        }
    }

    async apresentarPlanosOtimizados(userId) {
        await this.sendMessage(userId, `💎 *PLANOS VIP EXCLUSIVOS* (Só hoje!)

🥇 **MAIS ESCOLHIDO - 89% DOS CLIENTES**
✅ *Plano ANUAL VIP* 
~R$149,00~ *POR APENAS R$89,99*
⭐ 2 telas simultâneas
⭐ Suporte VIP prioritário

🔥 **SUPER OFERTA**  
✅ *Plano VITALÍCIO*
~R$399,00~ *POR APENAS R$199,00*
⭐ 3 telas para toda família
⭐ NUNCA MAIS pague nada

💰 **ECONÔMICO**
✅ *Plano 3 meses*
~R$89,00~ *POR APENAS R$49,99*
⭐ 1 tela HD

*Qual faz mais sentido pra você?*

Digite: *ANUAL*, *VITALÍCIO* ou *3 MESES*`);

        this.conversationStates.set(userId, 'apresentando_planos');
    }

    async handleEscolhaPlano(userId, messageText) {
        let plano = null;

        if (messageText.includes('anual') || messageText.includes('89') || messageText.includes('ano')) {
            plano = { nome: 'ANUAL VIP', valor: 89.99, telas: 2, popular: true };
        } else if (messageText.includes('vitalicio') || messageText.includes('199') || messageText.includes('vida')) {
            plano = { nome: 'VITALÍCIO', valor: 199.00, telas: 3, melhor: true };
        } else if (messageText.includes('3') || messageText.includes('49') || messageText.includes('trimestral')) {
            plano = { nome: '3 MESES', valor: 49.99, telas: 1 };
        }

        if (!plano) {
            await this.sendMessage(userId, `Por favor, escolha um plano:

*ANUAL* - R$ 89,99 (2 telas) 🥇
*VITALÍCIO* - R$ 199,00 (3 telas) 🔥  
*3 MESES* - R$ 49,99 (1 tela) 💰

Digite a palavra do plano:`);
            return;
        }

        this.salvarDadosUsuario(userId, { plano: plano });

        let destaque = '';
        if (plano.popular) destaque = '🥇 *ESCOLHA INTELIGENTE!* (Mais popular)';
        if (plano.melhor) destaque = '🔥 *EXCELENTE INVESTIMENTO!* (Melhor custo-benefício)';

        await this.sendMessage(userId, `${destaque}

*Plano escolhido:* ${plano.nome}
*Valor:* R$ ${plano.valor.toFixed(2)}
*Telas:* ${plano.telas}

*🔥 BÔNUS EXCLUSIVO DO SEU PLANO:*
✅ Ativação em 5 minutos
✅ Garantia de 7 dias  
✅ Suporte VIP WhatsApp
✅ Acesso a lançamentos antes de todo mundo

*💳 PAGAMENTO SUPER FÁCIL:*
PIX para: *${this.empresa.pixEmail}*

*Nome do recebedor:* ${this.empresa.recebedor}

*Envie o comprovante que ativo IMEDIATAMENTE!* ⚡`);

        this.conversationStates.set(userId, 'processando_pagamento');
    }

    async tratarObjegaoPreco(userId) {
        await this.sendMessage(userId, `💰 *ENTENDO SUA PREOCUPAÇÃO!*

Mas pense assim:
🤔 Netflix = R$45/mês 
🤔 Amazon = R$15/mês
🤔 Disney+ = R$28/mês
🤔 Globoplay = R$25/mês
🤔 SKY = R$120/mês

*TOTAL: R$233/mês = R$2.796/ano! 😱*

*Nosso VITALÍCIO: R$199 UMA VEZ só!*
= Economia de R$2.597 no primeiro ano

*É praticamente DE GRAÇA comparado! 🎯*

Faz sentido economizar essa grana toda?`);

        this.conversationStates.set(userId, 'tratando_objegoes');
    }

    async tratarObjegaoFinal(userId) {
        await this.sendMessage(userId, `😔 *TUDO BEM, ENTENDO...*

Mas me deixa fazer UMA ÚLTIMA pergunta:

*Se eu conseguir um desconto ADICIONAL de R$30...*
*E parcelar em 2x no PIX...*
*Você toparia aproveitar hoje?*

Seria:
🔥 *Plano ANUAL: 2x R$29,99*
🔥 *Plano VITALÍCIO: 2x R$84,99*

*É literalmente o preço de uma pizza para ter entretenimento para SEMPRE!*

*SIM* ou *NÃO DEFINITIVO*?`);

        this.conversationStates.set(userId, 'tratando_objegoes');
    }

    async handleObjegoes(userId, messageText) {
        if (messageText.includes('sim') || messageText.includes('topo') || 
            messageText.includes('aceito') || messageText.includes('ok')) {
            
            await this.sendMessage(userId, `🎉 *CONSEGUI A APROVAÇÃO!*

*Desconto especial liberado:*
✅ Plano ANUAL: 2x R$29,99 
✅ Plano VITALÍCIO: 2x R$84,99

*Qual você quer?*

*ANUAL* ou *VITALÍCIO*?`);

            this.conversationStates.set(userId, 'apresentando_planos');

        } else {
            await this.conectarHumano(userId, 'Resistência final ao preço');
        }
    }

    async handlePagamento(userId, messageText, message) {
        if (messageText.includes('paguei') || messageText.includes('pix') || 
            messageText.includes('enviei') || messageText.includes('comprovante') || 
            message.hasMedia) {
            
            await this.confirmarPagamento(userId);
        } else {
            await this.sendMessage(userId, `⏰ *AGUARDANDO SEU PIX...*

*Chave PIX:* ${this.empresa.pixEmail}
*Nome:* ${this.empresa.recebedor}

*Após o pagamento, me envie:*
- Print do comprovante OU
- Digite "PAGUEI"

*⚡ Ativação em até 5 minutos!*`);
        }
    }

    async confirmarPagamento(userId) {
        const dadosUsuario = this.userData.get(userId) || {};
        const credenciais = await this.gerarCredenciaisDefinitivas();

        await this.sendMessage(userId, `🎉 *PAGAMENTO CONFIRMADO!*

*PARABÉNS! SEU ACESSO FOI ATIVADO!* ✅

🔐 *SUAS CREDENCIAIS DEFINITIVAS:*
✅ *Nome:* HOB
✅ *Usuário:* ${credenciais.usuario}
✅ *Senha:* ${credenciais.senha}
🔗 *URL:* ${credenciais.url}

*🎯 PODE USAR AGORA MESMO!*`);

        await this.delay(3000);

        await this.sendMessage(userId, `🎁 *BÔNUS ESPECIAIS ATIVADOS:*

✅ Acesso ao grupo VIP de suporte
✅ Notificações de novos lançamentos  
✅ Prioridade em atualizações
✅ Garantia de 7 dias

*📲 GRUPO VIP:* ${this.empresa.grupoSuporte}

*🔥 GANHE RENDA EXTRA:*
Indique amigos e ganhe R$20 por venda!

*Muito obrigado pela confiança! 🙏*`);

        this.conversationStates.set(userId, 'cliente_ativo');
        console.log(`💰 VENDA CONFIRMADA: ${userId}`.green.bold);
    }

    async conectarHumano(userId, motivo = 'Solicitação de atendimento') {
        this.humanDetected.set(userId, true);
        
        await this.sendMessage(userId, `👨‍💼 *ATENDIMENTO ESPECIALIZADO*

Entendi que você precisa de atenção especial!

*📱 Contato direto:* (11) 99999-9999
*💬 Grupo VIP:* ${this.empresa.grupoSuporte}

*Um especialista vai te atender AGORA!*

*🕐 Disponível: 8h às 22h (7 dias)*`);

        console.log(`🚨 HUMANO SOLICITADO: ${userId} - ${motivo}`.red.bold);
    }

    async handleIndicacao(userId, messageText) {
        const numeroRegex = /(\d{10,11})/;
        const match = messageText.match(numeroRegex);

        if (match) {
            const numero = match[1];
            
            await this.sendMessage(userId, `✅ *INDICAÇÃO REGISTRADA COM SUCESSO!*

📱 *Número:* ${numero}

*🎁 SEUS BENEFÍCIOS:*
✅ +1 tela grátis (ativada)
✅ R$20 quando a pessoa comprar
✅ Acumulativo (sem limite!)

*Vou entrar em contato e falar que foi você! 🎯*

*Continue indicando para ganhar mais!* 💰`);

            this.conversationStates.set(userId, 'inicio');
        } else {
            await this.sendMessage(userId, `❌ Formato incorreto!

*Envie apenas os números:*
Exemplo: 11999887766

Qual o número da pessoa?`);
        }
    }

    async handleFollowUp(userId, messageText) {
        // Implementar follow-up inteligente
        await this.sendMessage(userId, `👋 Oi! Notei que você estava interessado nos nossos planos...

A oferta especial ainda está válida! Quer aproveitar?`);
        
        this.conversationStates.set(userId, 'inicio');
    }

    async gerarCredenciaisDefinitivas() {
        const urls = ['http://vip.hobtv.pro', 'http://premium.hobtv.net', 'http://4k.hobtv.tv'];
        return {
            usuario: `hobtiv_${Date.now()}`,
            senha: Math.random().toString(36).substring(2, 12).toUpperCase(),
            url: urls[Math.floor(Math.random() * urls.length)]
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
            
            await this.client.sendMessage(to, message);
            console.log(`📤 Enviado para ${to}`.green);
        } catch (error) {
            console.error('❌ Erro ao enviar:', error);
        }
    }

    async start() {
        console.log('🚀 Iniciando HOBTiv REAL com funil OTIMIZADO...'.yellow);
        await this.client.initialize();
    }
}

const hobtiv = new AssistenteHOBTivReal();
hobtiv.start().catch(console.error);

module.exports = AssistenteHOBTivReal;
