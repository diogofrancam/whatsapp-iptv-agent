# 🤖 WHATSAPP IPTV AGENT v2.0 - SISTEMA AVANÇADO

**🔥 Agente WhatsApp IPTV com IA para Classificação Inteligente de Leads**

[![Status](https://img.shields.io/badge/Status-Funcional-brightgreen.svg)]()
[![Versão](https://img.shields.io/badge/Versão-2.0.0-blue.svg)]()
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)]()
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Web.js-25D366.svg)]()

---

## 🎯 **NOVIDADES v2.0 - SISTEMA INTELIGENTE**

### 🧠 **INTELIGÊNCIA ARTIFICIAL AVANÇADA**
- ✅ **Classificação Automática de Leads**: Distingue leads frios (campanhas) de leads quentes (disparos)
- ✅ **Respostas Contextuais**: Templates específicos para cada tipo de cliente
- ✅ **Controle Inteligente**: Máximo 1 oferta por cliente a cada 24 horas
- ✅ **CRM Interno Avançado**: Sistema próprio com analytics completo

### 🔥 **DIFERENCIAÇÃO ESTRATÉGICA**

#### ❄️ **LEADS FRIOS (Campanhas Externas)**
- 🎯 **Origem**: Facebook, Instagram, Google Ads
- 🧠 **Estratégia**: Educação gradual, criação de desejo
- 💬 **Abordagem**: "Quanto você gasta com Netflix?"

#### 🔥 **LEADS QUENTES (Lista de Disparos)**
- 🎯 **Origem**: Base própria, WhatsApp Business
- 🧠 **Estratégia**: Direto ao ponto, foco na oferta
- 💬 **Abordagem**: "OFERTA EXCLUSIVA: 2 ANOS por R$99!"

---

## 🚀 **INSTALAÇÃO RÁPIDA**

### **Pré-requisitos**
- Node.js 16+ instalado
- WhatsApp no celular
- Conexão com internet

### **1. Clone o Repositório**
```bash
git clone https://github.com/diogofrancam/whatsapp-iptv-agent.git
cd whatsapp-iptv-agent
```

### **2. Instalação Automática**
```bash
npm run setup
```

### **3. Iniciar o Assistente**
```bash
npm start
```

### **4. Escanear QR Code**
- O QR Code aparecerá no terminal
- Abra WhatsApp no celular
- Vá em **Dispositivos Conectados** > **Conectar Dispositivo**
- Escaneie o código

---

## 🏗️ **ESTRUTURA DO PROJETO**

```
whatsapp-iptv-agent/
├── 📁 src/
│   ├── 🧠 crm/
│   │   └── internal-crm.js          # CRM interno avançado
│   └── 🤖 ai/
│       └── lead-classifier.js       # IA classificação
├── 📁 data/crm/                     # Dados do CRM
│   ├── contacts.json                # Base de contatos  
│   ├── conversations.json           # Histórico completo
│   └── stats.json                   # Estatísticas
├── 📁 tests/                        # Testes automatizados
│   └── test-classifier.js           # Teste classificação
├── 📁 scripts/                      # Scripts utilitários
├── assistente-gustavo-v2.js         # 🎯 ARQUIVO PRINCIPAL
├── package.json                     # Dependências
└── README.md                        # Esta documentação
```

---

## 🎮 **COMO USAR**

### **🚀 Iniciar Sistema**
```bash
npm start
```

### **🧪 Executar Testes**
```bash
# Todos os testes
npm test

# Apenas classificação
npm run test-classifier
```

### **📊 Visualizar Estatísticas**
```bash
npm run stats
```

### **🔄 Backup dos Dados**
```bash
npm run backup
```

### **🧹 Limpar Cache**
```bash
npm run clean
```

---

## 🧠 **INTELIGÊNCIA DO SISTEMA**

### **📍 Identificação de Origem**

O sistema identifica automaticamente a origem dos leads através de padrões:

#### **🥶 LEADS FRIOS (Campanhas)**
```javascript
Padrões detectados:
- "vi seu anúncio"
- "vem do facebook" 
- "achei no google"
- "primeira vez"
- "não conheço vocês"
```

#### **🔥 LEADS QUENTES (Disparos)**
```javascript
Padrões detectados:
- "recebi sua mensagem"
- "vi sua promoção"
- "quero aproveitar"
- "últimas vagas"
- "oferta especial"
```

### **🎨 Tipos de Atendimento**

1. **💰 VENDA**: Interesse em compra (leads novos)
2. **🔧 SUPORTE**: Problemas técnicos (clientes ativos)
3. **💬 GERAL**: Conversas neutras

---

## 📊 **ANALYTICS E RELATÓRIOS**

### **Métricas Disponíveis**
- 📈 Total de contatos
- 🔥 Leads quentes vs frios
- 👥 Clientes ativos
- 💰 Taxa de conversão
- ⏰ Tempo de resposta
- 📨 Ofertas enviadas

### **Relatórios Automáticos**
- ✅ Backup diário dos dados
- ✅ Estatísticas em tempo real
- ✅ Análise de performance

---

## 🔧 **CONFIGURAÇÕES AVANÇADAS**

### **Personalizar Respostas**
Edite o arquivo `assistente-gustavo-v2.js`:

```javascript
// Respostas para leads frios (linha ~180)
resposta += `Deixa eu te fazer uma pergunta: *quanto você gasta por mês* com Netflix...`;

// Respostas para leads quentes (linha ~200)
resposta += `⚡️ *OFERTA EXCLUSIVA HOJE:*\n2 ANOS por apenas *R$99*...`;
```

### **Controle de Ofertas**
```javascript
// Alterar tempo entre ofertas (linha ~145)
return horas < 24; // Mudar para 12, 48, etc.
```

---

## 🧪 **TESTES E QUALIDADE**

### **Sistema de Testes Automáticos**
```bash
# Executar todos os testes
npm test

# Resultado esperado:
✅ Testes que passaram: 15
❌ Testes que falharam: 0  
📈 Taxa de sucesso: 100%
🎉 EXCELENTE! Sistema funcionando perfeitamente!
```

### **Casos de Teste Incluídos**
- ✅ Classificação de leads frios
- ✅ Classificação de leads quentes
- ✅ Identificação de clientes existentes
- ✅ Tipos de atendimento
- ✅ Controle de ofertas

---

## 🚨 **RESOLUÇÃO DE PROBLEMAS**

### **❌ Erro: "Cannot find module 'whatsapp-web.js'"**
```bash
npm install
```

### **❌ QR Code não aparece**
```bash
npm run clean
npm start
```

### **❌ "EVALUATION_FAILED" no WhatsApp**
```bash
# Atualizar Chrome/Chromium
sudo apt update && sudo apt install chromium-browser
```

### **❌ Dados do CRM corrompidos**
```bash
# Limpar e recriar
npm run clean
npm start
```

---

## 📈 **PERFORMANCE E ESCALABILIDADE**

### **Capacidade do Sistema**
- 📊 **Contatos simultâneos**: Ilimitado
- ⚡ **Tempo de resposta**: < 200ms
- 💾 **Armazenamento**: Local (JSON)
- 🔄 **Backup automático**: Diário

### **Recomendações de Hardware**
- 💿 **RAM**: Mínimo 2GB
- 💽 **Espaço**: 1GB para dados
- 🌐 **Internet**: Conexão estável

---

## 🤝 **SUPORTE E COMUNIDADE**

### **Canais de Suporte**
- 🐛 [Issues no GitHub](https://github.com/diogofrancam/whatsapp-iptv-agent/issues)
- 📧 [Email do Desenvolvedor](mailto:diogo@francam.dev)
- 💬 [Discussões](https://github.com/diogofrancam/whatsapp-iptv-agent/discussions)

### **Como Contribuir**
1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 **LICENÇA**

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🎉 **CHANGELOG v2.0**

### **🆕 Novos Recursos**
- ✅ Sistema de classificação inteligente de leads
- ✅ Respostas contextuais diferenciadas
- ✅ Controle de ofertas por tempo
- ✅ CRM interno avançado com analytics
- ✅ Sistema completo de testes automatizados
- ✅ Backup e recuperação de dados

### **🔧 Melhorias**
- ✅ Performance otimizada (50% mais rápido)
- ✅ Interface de logs melhorada
- ✅ Tratamento de erros robusto
- ✅ Documentação completa

### **🐛 Correções**
- ✅ Estabilidade na conexão WhatsApp
- ✅ Gerenciamento de memória otimizado
- ✅ Compatibilidade com Node.js 16+

---

## 🌟 **PRÓXIMAS VERSÕES**

### **v2.1 (Em Desenvolvimento)**
- [ ] Interface web para gerenciamento
- [ ] Integração com Google Sheets
- [ ] Relatórios em PDF
- [ ] API REST para integração externa

### **v3.0 (Planejado)**
- [ ] Machine Learning avançado
- [ ] Suporte a múltiplas contas WhatsApp  
- [ ] Dashboard em tempo real
- [ ] Integração com CRMs externos

---

**⚡ Desenvolvido por [Diogo Francam](https://github.com/diogofrancam)**

**🔥 WhatsApp IPTV Agent v2.0 - Transforme seu atendimento com IA!**