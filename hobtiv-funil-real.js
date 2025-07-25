const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const colors = require('colors');

class HOBTivFunilReal {
    constructor() {
        console.log('📺 HOBTiv - Funil REAL Baseado em Conversas'.cyan.bold);
        
        this.client = new Client({
            authStrategy: new LocalAuth({ 
                clientId: 'hobtiv-real',
                dataPath: './session-real'
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
        console.log('✅ HOBTiv FUNIL REAL inicializado!'.green);
    }

    setupEventHandlers() {
        this.client.on('qr', (qr) => {
            console.log('📱 QR Code HOBTiv REAL:'.yellow.bold);
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            console.log('✅ HOBTiv REAL conectado - Funil baseado em conversas reais!'.green.bold);
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
                await this.sendMessage(userId, `Oi, tudo bem? 😊

Para melhor atendimento, envie mensagens em texto.

Quer conhecer nossos planos IPTV? Me fala que dispositivo você tem!`);
                return;
            }

            await this.processarMensagem(userId, messageText, message);

        } catch (error) {
            console.error('❌ Erro:', error);
        }
    }

    async processarMensagem(userId, messageText, message) {
        const currentState = this.conversationStates.get(userId) || 'inicio';
        
        // Verificar intenções especiais primeiro
        if (await this.verificarIntencoes(userId, messageText)) {
            return;
        }

        console.log(`🎯 Estado: ${currentState} | Mensagem: ${messageText}`.cyan);

        switch (currentState) {
            case 'inicio':
                await this.iniciarAtendimento(userId, messageText);
                break;
            case 'consultando_dispositivo':
                await this.handleDispositivo(userId, messageText);
                break;
            case 'instalando_app':
                await this.handleInstalacao(userId, messageText);
                break;
            case 'enviando_teste':
                await this.handleTeste(userId, messageText);
                break;
            case 'confirmando_funcionamento':
                await this.handleConfirmacao(userId, messageText);
                break;
            case 'apresentando_planos':
                await this.handlePlanos(userId, messageText);
                break;
            case 'processando_pagamento':
                await this.handlePagamento(userId, messageText, message);
                break;
            case 'coletando_indicacao':
                await this.handleIndicacao(userId, messageText);
                break;
            default:
                await this.iniciarAtendimento(userId, messageText);
        }
    }

    async verificarIntencoes(userId, messageText) {
        // Sistema de indicações
        if (messageText.includes('indicar') || messageText.includes('amigo')) {
            await this.sendMessage(userId, `Se puder nos indicar, agradeço! Com as indicações pode ganhar:

✅ +1 tela de acesso
✅ Ou até +2 meses grátis

Me manda o número da pessoa que você quer indicar!`);
            
            this.conversationStates.set(userId, 'coletando_indicacao');
            return true;
        }

        // Solicitar atendimento humano
        if (messageText.includes('humano') || messageText.includes('atendente')) {
            this.humanDetected.set(userId, true);
            await this.sendMessage(userId, `Vou transferir você para um atendente humano!

Entre no grupo de suporte: ${this.empresa.grupoSuporte}

Ou chame no WhatsApp: (11) 99999-9999`);
            
            console.log(`🚨 HUMANO SOLICITADO: ${userId}`.red.bold);
            return true;
        }

        return false;
    }

    async iniciarAtendimento(userId, messageText) {
        // SEGUINDO EXATAMENTE O FUNIL REAL DA HOBTIV
        await this.sendMessage(userId, `Oi, tudo bem? 😊

Vou te ajudar a acessar todos os conteúdos da *SKY, Netflix* e muito mais...

*Você consegue instalar o aplicativo agora?*

Qual o dispositivo que vai instalar: *TV (marca)* ou *Celular*?`);

        this.conversationStates.set(userId, 'consultando_dispositivo');
    }

    async handleDispositivo(userId, messageText) {
        let resposta = '';

        // TV Smart (Samsung, LG, Roku)
        if (messageText.includes('samsung') || messageText.includes('lg') || 
            messageText.includes('roku') || messageText.includes('smart') || 
            messageText.includes('tv')) {
            
            resposta = `Perfeito! Para sua TV, acesse a loja de aplicativos e busque por *"ABSOLUTO PLAYER"*. Instale e abra o app.

Se não encontrar, me avisa! Consegue instalar agora?`;

        // Android (Celular, TV Box)
        } else if (messageText.includes('android') || messageText.includes('celular') || 
                   messageText.includes('tv box') || messageText.includes('box')) {
            
            resposta = `Certo! Para seu dispositivo Android, você pode baixar o *"CANALPLAY"* ou *"ABSOLUTO PLAYER"* pela Play Store.

Ou, se preferir, acesse \`http://lojaplay.in\` pelo navegador e baixe o app desejado. Me avisa quando instalar!`;

        // iPhone
        } else if (messageText.includes('iphone') || messageText.includes('ios') || 
                   messageText.includes('apple')) {
            
            resposta = `Ok! Para iPhone, você pode baixar o *"SMARTERS PLAYER LITE"* pela App Store. Ao abrir, procure pela opção *XTREAM CODES*. Me avisa quando instalar!`;

        // Se não entender o dispositivo
        } else {
            await this.sendMessage(userId, `Me ajuda a entender melhor!

Qual dispositivo você tem?
- *Samsung TV*
- *LG TV*  
- *Android/Celular*
- *iPhone*
- *TV Box*

Me fala qual é!`);
            return;
        }

        await this.sendMessage(userId, resposta);
        this.conversationStates.set(userId, 'instalando_app');
    }

    async handleInstalacao(userId, messageText) {
        if (messageText.includes('instalei') || messageText.includes('pronto') || 
            messageText.includes('ok') || messageText.includes('consegui') ||
            messageText.includes('sim')) {
            
            // Oferecer teste ANTES de enviar dados
            await this.sendMessage(userId, `Enquanto você instala, quer fazer um teste de 1 hora para ver o conteúdo? Assim você já vê a qualidade!

Me avisa quando o app estiver pronto para eu te enviar os dados de teste. 😉`);

            this.conversationStates.set(userId, 'enviando_teste');
            
        } else if (messageText.includes('problema') || messageText.includes('não') || 
                   messageText.includes('erro')) {
            
            await this.sendMessage(userId, `Sem problemas! Você também pode tentar:

- *XPIPTV*
- *9XTREAM PLAYER*
- *VU IPTV PLAYER*

Em todos vai clicar em alguma opção com *XTREAM CODES*.

Consegue tentar outro app?`);
            
        } else {
            await this.sendMessage(userId, `Tudo bem! Quando conseguir instalar o aplicativo, me avisa que eu te ajudo com o próximo passo! 😉`);
        }
    }

    async handleTeste(userId, messageText) {
        if (messageText.includes('pronto') || messageText.includes('instalei') || 
            messageText.includes('ok') || messageText.includes('sim')) {
            
            const dadosTeste = this.gerarDadosTeste();
            
            await this.sendMessage(userId, `Ótimo! Aqui estão seus dados de acesso para o teste de 1 hora:

🔐 *Credenciais de Acesso:*
✅ *Nome:* HOB
✅ *Usuário:* ${dadosTeste.usuario}
✅ *Senha:* ${dadosTeste.senha}
🔗 *URL:* ${dadosTeste.url}

Entre com esses dados e me confirma aqui se carregou! É importante para que o teste não expire!`);

            this.conversationStates.set(userId, 'confirmando_funcionamento');
            
        } else {
            await this.sendMessage(userId, `Quando o app estiver instalado e pronto, me fala que eu te envio os dados de teste! 😊`);
        }
    }

    async handleConfirmacao(userId, messageText) {
        if (messageText.includes('carregou') || messageText.includes('funcionou') || 
            messageText.includes('ok') || messageText.includes('consegui')) {
            
            await this.sendMessage(userId, `Carregou? Conseguiu ver os canais? Que bom! 👍

Agora que você já testou, quer ativar seu acesso para aproveitar todos os benefícios da HOBTiv?`);

            this.conversationStates.set(userId, 'apresentando_planos');
            
        } else if (messageText.includes('não') || messageText.includes('erro')) {
            
            await this.sendMessage(userId, `Vou te ajudar! Primeiro, confirme se está usando os dados corretos:

✅ Clicou em *XTREAM CODES*?
✅ Colocou a URL certinha?
✅ Nome, usuário e senha sem espaços?

Tente de novo e me fala se funcionou!`);
            
        } else {
            await this.sendMessage(userId, `Me confirma se os dados funcionaram! É importante para dar sequência. 😉

Conseguiu ver os canais?`);
        }
    }

    async handlePlanos(userId, messageText) {
        // Se ainda não apresentou os planos
        if (messageText.includes('sim') || messageText.includes('quero') || 
            messageText.includes('ativar')) {
            
            await this.sendMessage(userId, `Excelente! Tenho estes planos disponíveis:

✅ *Plano de R$47,00* para *ativação*:
Fica uma taxa mensal de *R$6,99* para suporte técnico e manutenção
👉 *E pode usar para sempre*

✅ *Plano anual de R$97,00* que ganha:
*+1,5 anos grátis*
*+1 acesso grátis*

Qual deles fica melhor para você?`);

        // Se escolheu um plano
        } else if (messageText.includes('47') || messageText.includes('primeiro') || 
                   messageText.includes('mensal')) {
            
            await this.solicitarPagamento(userId, 'Plano Ativação', 47.00);
            
        } else if (messageText.includes('97') || messageText.includes('anual') || 
                   messageText.includes('segundo')) {
            
            await this.solicitarPagamento(userId, 'Plano Anual', 97.00);
            
        } else {
            await this.sendMessage(userId, `Me ajuda a entender qual plano você quer!

Digite:
- *1* para o Plano de R$47,00
- *2* para o Plano Anual de R$97,00

Qual você escolhe?`);
        }
    }

    async solicitarPagamento(userId, nomePlano, valor) {
        await this.sendMessage(userId, `Perfeito! Para ativar seu ${nomePlano}, o valor é de R$${valor.toFixed(2)}.

Você pode fazer o pagamento via PIX para a chave:

🔑 *Chave PIX (email):* ${this.empresa.pixEmail}

☝️☝️☝️ *PIX chave email* ☝️☝️☝️

*OBS:* Envie o comprovante. Nome do recebedor: *${this.empresa.recebedor}*. Assim que confirmar, ativo seu acesso! ✅`);

        this.userData.set(userId, { plano: nomePlano, valor: valor });
        this.conversationStates.set(userId, 'processando_pagamento');
    }

    async handlePagamento(userId, messageText, message) {
        if (messageText.includes('paguei') || messageText.includes('pix') || 
            messageText.includes('comprovante') || message.hasMedia) {
            
            await this.confirmarPagamento(userId);
            
        } else {
            await this.sendMessage(userId, `Estou aguardando seu comprovante de pagamento!

Quando efetuar o PIX, me manda aqui que ativo na hora! ✅`);
        }
    }

    async confirmarPagamento(userId) {
        const credenciais = this.gerarCredenciaisDefinitivas();

        await this.sendMessage(userId, `Pagamento confirmado! ✅

Seu acesso foi ativado com sucesso! Você já pode aproveitar todo o conteúdo da HOBTiv! 🎉`);

        // Pós-venda
        await this.sendMessage(userId, `Se puder nos indicar para amigos e familiares, agradecemos muito! Com indicações, você pode ganhar:

✅ +1 tela de acesso
✅ Ou até +2 meses grátis

Ah, e não se esqueça de entrar no nosso Grupo de Suporte Técnico para avisos e ajuda:

👉 ${this.empresa.grupoSuporte}

É importante para ficar por dentro das novidades e ter suporte rápido! 😉`);

        this.conversationStates.set(userId, 'cliente_ativo');
        console.log(`💰 VENDA CONFIRMADA: ${userId}`.green.bold);
    }

    async handleIndicacao(userId, messageText) {
        const numeroRegex = /(\d{10,11})/;
        const match = messageText.match(numeroRegex);

        if (match) {
            const numero = match[1];
            
            await this.sendMessage(userId, `✅ *Indicação registrada!*

📱 Número: ${numero}

Vou entrar em contato e mencionar que foi você quem indicou!

*Seu benefício será ativado após o primeiro pagamento da pessoa.*

Obrigado pela indicação! 😊`);

            this.conversationStates.set(userId, 'inicio');
        } else {
            await this.sendMessage(userId, `❌ Não consegui identificar o número!

Por favor, envie apenas os números:
*Exemplo:* 11999887766

Qual o número da pessoa?`);
        }
    }

    gerarDadosTeste() {
        const urls = ['http://t7x.in', 'http://u2z.in', 'http://u3z.eu', 'http://ip2.life', 'http://tvbr.life'];
        return {
            usuario: `teste_${Date.now().toString().slice(-6)}`,
            senha: Math.random().toString(36).substring(2, 8).toUpperCase(),
            url: urls[Math.floor(Math.random() * urls.length)]
        };
    }

    gerarCredenciaisDefinitivas() {
        return {
            usuario: `hobtiv_${Date.now()}`,
            senha: Math.random().toString(36).substring(2, 10).toUpperCase(),
            url: 'http://vip.hobtv.pro'
        };
    }

    async sendMessage(to, message) {
        try {
            if (this.humanDetected.get(to)) {
                console.log(`🚫 Humano ativo - Bot pausado`.yellow);
                return;
            }
            
            console.log(`📤 Enviando: ${message.substring(0, 50)}...`.green);
            await this.client.sendMessage(to, message);
            console.log(`✅ Mensagem enviada!`.green);
        } catch (error) {
            console.error('❌ Erro ao enviar:', error);
        }
    }

    async start() {
        console.log('🚀 Iniciando HOBTiv com FUNIL REAL...'.yellow);
        await this.client.initialize();
    }
}

const hobtiv = new HOBTivFunilReal();
hobtiv.start().catch(console.error);

module.exports = HOBTivFunilReal;
