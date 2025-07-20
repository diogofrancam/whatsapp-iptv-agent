// src/index.js
// Bot Principal - WhatsApp IPTV Agent
// Arquivo de inicialização principal que conecta todos os módulos

const WhatsAppHandler = require('./bot/whatsapp-handler');
const config = require('./config');
const { logger, logSystemStart, healthMonitor } = require('./utils/logger');

class IPTVAgent {
    constructor() {
        this.whatsappHandler = null;
        this.isRunning = false;
        this.startTime = new Date();
        
        // Configurar manipuladores de sinal
        this.setupSignalHandlers();
        
        logger.info('🤖 IPTV Agent inicializando...');
    }

    /**
     * Inicializa o bot completo
     */
    async start() {
        try {
            logSystemStart();
            
            console.log('\n🤖 ===== WHATSAPP IPTV AGENT =====');
            console.log(`📅 Iniciado em: ${this.startTime.toLocaleString('pt-BR')}`);
            console.log(`🌐 Ambiente: ${config.app.env}`);
            console.log(`📊 Versão: ${config.app.version}`);
            console.log('=====================================\n');

            // 1. Inicializar WhatsApp Handler
            await this.initializeWhatsApp();
            
            // 2. Configurar monitoramento de saúde
            this.setupHealthMonitoring();
            
            this.isRunning = true;
            
            logger.info('✅ IPTV Agent iniciado com sucesso!');
            console.log('🎉 Bot IPTV funcionando! Aguardando conexão WhatsApp...\n');
            
            // Manter processo vivo
            this.keepAlive();
            
        } catch (error) {
            logger.error('❌ Erro crítico ao iniciar bot:', error);
            console.error('\n❌ Erro ao iniciar o bot:', error.message);
            process.exit(1);
        }
    }

    /**
     * Inicializa o manipulador do WhatsApp
     */
    async initializeWhatsApp() {
        try {
            logger.info('📱 Inicializando conexão WhatsApp...');
            
            this.whatsappHandler = new WhatsAppHandler();
            await this.whatsappHandler.initialize();
            
            logger.info('✅ WhatsApp Handler configurado');
            
        } catch (error) {
            logger.error('❌ Erro ao inicializar WhatsApp:', error);
            throw new Error(`Falha na inicialização do WhatsApp: ${error.message}`);
        }
    }

    /**
     * Configura monitoramento de saúde
     */
    setupHealthMonitoring() {
        logger.info('🏥 Configurando monitoramento de saúde...');

        // Verificação de saúde a cada 5 minutos
        setInterval(() => {
            this.checkSystemHealth();
        }, 300000); // 5 minutos

        logger.info('✅ Monitoramento de saúde ativo');
    }

    /**
     * Verifica saúde do sistema
     */
    checkSystemHealth() {
        try {
            const health = {
                timestamp: new Date(),
                isRunning: this.isRunning,
                uptime: Date.now() - this.startTime.getTime(),
                whatsappConnected: this.whatsappHandler?.isConnected() || false,
                memory: process.memoryUsage(),
                stats: healthMonitor.getHealthReport()
            };

            // Log de saúde apenas se houver problemas
            if (!health.whatsappConnected || health.memory.heapUsed > 500 * 1024 * 1024) { // 500MB
                logger.warn('⚠️ Alerta de saúde do sistema:', health);
            }

            return health;

        } catch (error) {
            logger.error('❌ Erro na verificação de saúde:', error);
            return null;
        }
    }

    /**
     * Mantém o processo vivo
     */
    keepAlive() {
        // Evita que o processo termine
        process.stdin.resume();
        
        // Log periódico de status
        setInterval(() => {
            if (config.isDevelopment()) {
                const stats = healthMonitor.getHealthReport();
                console.log(`🤖 Status: ${stats.messagesReceived} msgs recebidas | ${stats.messagesSent} msgs enviadas | Uptime: ${stats.uptimeHours}h`);
            }
        }, 300000); // A cada 5 minutos
    }

    /**
     * Configura manipuladores de sinais do sistema
     */
    setupSignalHandlers() {
        const gracefulShutdown = async (signal) => {
            logger.info(`🛑 Recebido sinal ${signal}. Iniciando shutdown graceful...`);
            console.log(`\n🛑 Shutdown graceful iniciado (${signal})...`);
            
            try {
                // Parar de aceitar novas mensagens
                this.isRunning = false;
                
                // Aguardar processamento de mensagens pendentes
                await this.sleep(5000);
                
                // Finalizar conexão WhatsApp
                if (this.whatsappHandler) {
                    await this.whatsappHandler.destroy();
                }
                
                logger.info('✅ Shutdown concluído com sucesso');
                console.log('✅ Bot finalizado com segurança!\n');
                
                process.exit(0);
                
            } catch (error) {
                logger.error('❌ Erro durante shutdown:', error);
                console.error('❌ Erro ao finalizar:', error.message);
                process.exit(1);
            }
        };

        // Sinais de término
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

        // Erros não tratados
        process.on('uncaughtException', (error) => {
            logger.error('❌ Exceção não tratada:', error);
            console.error('❌ Erro crítico:', error.message);
            gracefulShutdown('uncaughtException');
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('❌ Promise rejeitada não tratada:', { reason, promise });
            console.error('❌ Promise rejeitada:', reason);
            gracefulShutdown('unhandledRejection');
        });
    }

    /**
     * Utilitário para aguardar
     */
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Função principal
async function main() {
    try {
        // Verificar se o ambiente está configurado
        if (!config.waseller.apiKey) {
            console.error('\n❌ Erro: Chave da API Waseller não configurada!');
            console.log('📝 Execute: node setup.js para configurar\n');
            process.exit(1);
        }

        // Criar e iniciar o bot
        const agent = new IPTVAgent();
        await agent.start();

    } catch (error) {
        console.error('\n❌ Erro fatal ao iniciar o bot:', error.message);
        console.error('\n📋 Verifique:');
        console.error('   1. Se executou: node setup.js');
        console.error('   2. Se o arquivo .env está configurado');
        console.error('   3. Se as dependências estão instaladas: npm install');
        console.error('   4. Se há erros nos logs: tail -f logs/app.log\n');
        process.exit(1);
    }
}

// Executar se for o arquivo principal
if (require.main === module) {
    main();
}

module.exports = IPTVAgent;