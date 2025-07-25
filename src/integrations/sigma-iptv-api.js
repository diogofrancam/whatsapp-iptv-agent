const axios = require('axios');
require('dotenv').config();

class SigmaIPTVApi {
    constructor() {
        this.baseURL = process.env.SIGMA_API_URL || 'https://api.sigma-iptv.com';
        this.apiKey = process.env.SIGMA_API_KEY;
        
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
    }

    async criarTeste(duracao = 1) {
        try {
            const response = await this.client.post('/teste/criar', {
                duracao_horas: duracao,
                tipo: 'teste_gratuito'
            });
            
            return {
                sucesso: true,
                dados: response.data
            };
        } catch (error) {
            console.error('Erro ao criar teste:', error.message);
            return {
                sucesso: false,
                erro: error.message
            };
        }
    }

    async criarContaDefinitiva(plano, dadosCliente) {
        try {
            const response = await this.client.post('/conta/criar', {
                plano: plano,
                cliente: dadosCliente,
                ativo: true
            });
            
            return {
                sucesso: true,
                dados: response.data
            };
        } catch (error) {
            console.error('Erro ao criar conta:', error.message);
            return {
                sucesso: false,
                erro: error.message
            };
        }
    }

    async verificarServidor() {
        try {
            const response = await this.client.get('/status');
            return response.data.status === 'online';
        } catch (error) {
            return false;
        }
    }
}

module.exports = SigmaIPTVApi;
