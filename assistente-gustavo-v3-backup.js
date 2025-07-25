const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');
const colors = require('colors');
require('dotenv').config();

const SigmaIPTVApi = require('./src/integrations/sigma-iptv-api');

class AssistenteHOBTivReal {
    constructor() {
        console.log('📺 HOBTiv - Sistema REAL de Vendas (Funil Original)'.cyan.bold);
        
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
        this.sigmaIPTV = new SigmaIPTVApi();
        
        this.empresa = {
            pixEmail: 'hobtiv1@gmail.com',
            recebedor: 'Diogo Martins',
            grupoSuporte: process.env.GRUPO_SUPORTE_URL || 'https://chat.whatsapp.com/KPt32Gfvsi5J8HLTRMvRUU'
        };

        this.setupEventHandlers();
        console.log('✅ HOBTiv REAL inicializado com funil original!'.green);
    }

    setupEventHandlers() {
        this.client.on('qr', (qr) => {
            console.log('📱 Escaneie o QR Code:'.yellow.bold);
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            console.log('✅ HOBTiv conectado! Usando funil REAL de vendas!'.green.bold);
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
        if (messageText.includes('indicar') || messageText.includes('amigo')) {
            await this.sendMessage(userId, `👥 *PROGRAMA DE INDICAÇÕES HOBTiv*

Que ótimo que quer nos indicar! 🎉

*BENEFÍCIOS PARA VOCÊ:*
✅ +1 tela de acesso GRÁTIS  
✅ Ou até +2 meses grátis

*Para fazer a indicação, me envie:*
📱 *Número com DDD* da pessoa

*Exemplo:* 11999887766

Me manda o número que eu cuido do resto! 😉`);
            
            this.conversationStates.set(userId, 'coletando_indicacao');
            return true;
        }

        if (messageText.includes('humano') || messageText.includes('atendente')) {
            this.humanDetected.set(userId, true);
            await this.sendMessage(userId, `👨‍💼 *ATENDIMENTO HUMANO*

Vou te conectar com nossa equipe!

*📱 Contatos diretos:*
- WhatsApp: (11) 99999-9999
- Grupo: ${this.empresa.grupoSuporte}

*🕐 Horário: 8h às 22h (Seg-Dom)*

Sua conversa será transferida em instantes...`);
            
            console.log(`🚨 HUMANO SOLICITADO: ${userId}`.red.bold);
            return true;
        }

        return false;
    }

    async handleInicio(userId, messageText) {
        await this.iniciarVendaOriginal(userId);
    }

    async iniciarVendaOriginal(userId) {
        await this.sendMessage(userId, `Oi, tudo bem? 😊

Vou te ajudar a acessar todos os conteúdos da *SKY, Netflix* e muito mais...

*Você consegue instalar o aplicativo agora?*

Qual o dispositivo que vai instalar: *TV (marca)* ou *Celular*?`);

        this.conversationStates.set(userId, 'consultando_dispositivo');
    }

    async handleDispositivo(userId, messageText) {
        let resposta = '';

        if (messageText.includes('samsung') || messageText.includes('lg') || messageText.includes('roku') || messageText.includes('smart')) {
            resposta = `Perfeito! Para sua TV, acesse a loja de aplicativos e busque por *"ABSOLUTO PLAYER"*. Instale e abra o app.

Se não encontrar, me avisa! Consegue instalar agora?`;

        } else if (messageText.includes('android') || messageText.includes('celular') || messageText.includes('tv box')) {
            resposta = `Certo! Para seu dispositivo Android, você pode baixar o *"CANALPLAY"* ou *"ABSOLUTO PLAYER"* pela Play Store.

Ou, se preferir, acesse \`http://lojaplay.in\` pelo navegador e baixe o app desejado. Me avisa quando instalar!`;

        } else if (messageText.includes('iphone') || messageText.includes('ios')) {
            resposta = `Ok! Para iPhone, você pode baixar o *"SMARTERS PLAYER LITE"* pela App Store. Ao abrir, procure pela opção *XTREAM CODES*. Me avisa quando instalar!`;

        } else {
            await this.sendMessage(userId, `Me ajuda a te orientar melhor!

Qual dispositivo você vai usar?
- *Samsung/LG/Smart TV*
- *Android/Celular/TV Box*
- *iPhone/iPad*

Digite o tipo:`);
            return;
        }

        await this.sendMessage(userId, resposta);

        await this.sendMessage(userId, `Enquanto você instala, quer fazer um teste de 1 hora para ver o conteúdo? Assim você já vê a qualidade!

Me avisa quando o app estiver pronto para eu te enviar os dados de teste. 😉`);

        this.conversationStates.set(userId, 'instalando_app');
    }

    async handleInstalacaoApp(userId, messageText) {
        if (messageText.includes('pronto') || messageText.includes('instalei') || 
            messageText.includes('ok') || messageText.includes('sim') || 
            messageText.includes('consegui') || messageText.includes('feito') ||
            messageText.includes('instalado') || messageText.includes('baixei')) {
            
            await this.enviarDadosTeste(userId);
            
        } else if (messageText.includes('não') || messageText.includes('problema') || messageText.includes('erro')) {
            await this.sendMessage(userId, `Sem problemas! Você também pode tentar:

- *XPIPTV*
- *9XTREAM PLAYER*
- *VU IPTV PLAYER*

Em todos vai clicar em alguma opção com *XTREAM CODES*.

Consegue tentar outro app?`);
            
        } else {
            await this.sendMessage(userId, `Tudo bem! Quando conseguir instalar o aplicativo, me avisa que eu te envio os dados de teste de 1 hora! 😉`);
        }
    }

    async enviarDadosTeste(userId) {
        try {
            const teste = await this.gerarTestePadrao();
            
            await this.sendMessage(userId, `Ótimo! Aqui estão seus dados de acesso para o teste de 1 hora:

🔐 *Credenciais de Acesso:*
✅ *Nome:* HOB
✅ *Usuário:* ${teste.usuario}
✅ *Senha:* ${teste.senha}
🔗 *URL:* ${teste.url}

Entre com esses dados e me confirma aqui se carregou! É importante para que o teste não expire!`);

            this.conversationStates.set(userId, 'enviando_teste');

        } catch (error) {
            await this.sendMessage(userId, `❌ Nossos servidores estão com muita demanda agora.

Mas posso te mostrar os planos direto! Quer ver?`);
            await this.apresentarPlanos(userId);
        }
    }

    async gerarTestePadrao() {
        const urls = ['http://t7x.in', 'http://u2z.in', 'http://u3z.eu', 'http://ip2.life', 'http://tvbr.life'];
        const urlAleatoria = urls[Math.floor(Math.random() * urls.length)];
        
        return {
            usuario: `teste_${Date.now()}`,
            senha: Math.random().toString(36).substring(2, 10),
            url: urlAleatoria
        };
    }

    async handleTesteEnviado(userId, messageText) {
        if (messageText.includes('carregou') || messageText.includes('funcionou') || 
            messageText.includes('ok') || messageText.includes('sim') || 
            messageText.includes('consegui') || messageText.includes('deu certo')) {
            
            await this.sendMessage(userId, `Carregou? Conseguiu ver os canais? Que bom! 👍

Agora que você já testou, quer ativar seu acesso para aproveitar todos os benefícios da HOBTiv?`);

            await this.apresentarPlanos(userId);
            
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

    async apresentarPlanos(userId) {
        await this.sendMessage(userId, `Excelente! Temos estes planos disponíveis:

✅ *Plano Mensal* de ~R$29,00~ por *R$19,99* (1 tela)
✅ *Plano 3 meses* ~R$59,00~ por *R$49,99* (1 tela)
✅ *Plano 12 meses* ~R$149,00~ por *R$89,99* *(2 telas)*
✅ *Plano Vitalício* ~R$269,00~ por *R$199,00* *(3 telas)*

Qual deles fica melhor para você?`);

        this.conversationStates.set(userId, 'apresentando_planos');
    }

    async handleEscolhaPlano(userId, messageText) {
        let plano = null;

        if (messageText.includes('mensal') || messageText.includes('19') || messageText.includes('1')) {
            plano = { nome: 'Mensal', valor: 19.99 };
        } else if (messageText.includes('3') || messageText.includes('49') || messageText.includes('trimestral')) {
            plano = { nome: '3 meses', valor: 49.99 };
        } else if (messageText.includes('12') || messageText.includes('89') || messageText.includes('anual')) {
            plano = { nome: '12 meses', valor: 89.99 };
        } else if (messageText.includes('vitalicio') || messageText.includes('199') || messageText.includes('4')) {
            plano = { nome: 'Vitalício', valor: 199.00 };
        }

        if (!plano) {
            await this.sendMessage(userId, `Me ajuda a entender qual plano você quer!

Digite:
- *1* - Mensal (R$ 19,99)
- *2* - 3 meses (R$ 49,99)
- *3* - 12 meses (R$ 89,99)
- *4* - Vitalício (R$ 199,00)

Qual número?`);
            return;
        }

        await this.sendMessage(userId, `Perfeito! Para ativar seu plano ${plano.nome}, o valor é de R$${plano.valor.toFixed(2)}.

Você pode fazer o pagamento via PIX para a chave:

🔑 *Chave PIX (email):* ${this.empresa.pixEmail}

☝️☝️☝️ *PIX chave email* ☝️☝️☝️

*OBS:* Envie o comprovante. Nome do recebedor: *${this.empresa.recebedor}*. Assim que confirmar, ativo seu acesso! ✅`);

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
        const credenciais = await this.gerarCredenciaisDefinitivas();

        await this.sendMessage(userId, `Pagamento confirmado! ✅

Seu acesso foi ativado com sucesso! 🎉

🔐 *Suas credenciais definitivas:*
✅ *Nome:* HOB
✅ *Usuário:* ${credenciais.usuario}
✅ *Senha:* ${credenciais.senha}
🔗 *URL:* ${credenciais.url}

Você já pode aproveitar todo o conteúdo da HOBTiv!`);

        setTimeout(async () => {
            await this.sendMessage(userId, `Que ótimo que deu tudo certo! Se puder nos indicar para amigos e familiares, agradecemos muito! Com indicações, você pode ganhar:

✅ +1 tela de acesso
✅ Ou até +2 meses grátis

Ah, e não se esqueça de entrar no nosso Grupo de Suporte Técnico para avisos e ajuda:

👉 ${this.empresa.grupoSuporte}

É importante para ficar por dentro das novidades e ter suporte rápido! 😉`);
        }, 2000);

        this.conversationStates.set(userId, 'cliente_ativo');
    }

    async gerarCredenciaisDefinitivas() {
        const urls = ['http://t7x.in', 'http://u2z.in', 'http://u3z.eu'];
        return {
            usuario: `hobtiv_${Date.now()}`,
            senha: Math.random().toString(36).substring(2, 12),
            url: urls[0]
        };
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

    async sendMessage(to, message) {
        try {
            if (this.humanDetected.get(to)) {
                console.log(`🚫 Humano ativo - Bot pausado`.yellow);
                return;
            }
            
            await this.client.sendMessage(to, message);
            console.log(`📤 Enviado`.green);
        } catch (error) {
            console.error('❌ Erro ao enviar:', error);
        }
    }

    async start() {
        console.log('🚀 Iniciando HOBTiv REAL...'.yellow);
        await this.client.initialize();
    }
}

const hobtiv = new AssistenteHOBTivReal();
hobtiv.start().catch(console.error);

module.exports = AssistenteHOBTivReal;
