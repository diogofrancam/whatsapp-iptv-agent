const fs = require('fs-extra');
const path = require('path');

class InternalCRM {
  constructor() {
    this.dataPath = path.join(__dirname, '../../data/crm');
    this.contactsFile = path.join(this.dataPath, 'contacts.json');
    this.conversationsFile = path.join(this.dataPath, 'conversations.json');
    this.statsFile = path.join(this.dataPath, 'stats.json');
    
    this.contacts = new Map();
    this.conversations = [];
    this.stats = {
      totalContacts: 0,
      totalConversations: 0,
      leadsQuentes: 0,
      leadsFrios: 0,
      clientesAtivos: 0,
      ofertasEnviadas: 0,
      taxaConversao: 0
    };
    
    this.initializeStorage();
  }

  async initializeStorage() {
    try {
      // Criar diretório se não existir
      await fs.ensureDir(this.dataPath);
      
      // Carregar dados existentes
      await this.loadData();
      
      console.log('✅ CRM Interno inicializado com sucesso');
      console.log(`📊 Contatos carregados: ${this.contacts.size}`);
      console.log(`💬 Conversas carregadas: ${this.conversations.length}`);
    } catch (error) {
      console.error('❌ Erro ao inicializar CRM:', error);
      await this.createDefaultFiles();
    }
  }

  async createDefaultFiles() {
    try {
      const defaultContacts = {};
      const defaultConversations = [];
      const defaultStats = this.stats;

      await fs.writeJson(this.contactsFile, defaultContacts, { spaces: 2 });
      await fs.writeJson(this.conversationsFile, defaultConversations, { spaces: 2 });
      await fs.writeJson(this.statsFile, defaultStats, { spaces: 2 });
      
      console.log('✅ Arquivos padrão do CRM criados');
    } catch (error) {
      console.error('❌ Erro ao criar arquivos padrão:', error);
    }
  }

  async loadData() {
    try {
      // Carregar contatos
      if (await fs.pathExists(this.contactsFile)) {
        const contactsData = await fs.readJson(this.contactsFile);
        this.contacts = new Map(Object.entries(contactsData));
      }
      
      // Carregar conversas
      if (await fs.pathExists(this.conversationsFile)) {
        this.conversations = await fs.readJson(this.conversationsFile);
      }
      
      // Carregar estatísticas
      if (await fs.pathExists(this.statsFile)) {
        this.stats = await fs.readJson(this.statsFile);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    }
  }

  async saveData() {
    try {
      // Salvar contatos
      const contactsObj = Object.fromEntries(this.contacts);
      await fs.writeJson(this.contactsFile, contactsObj, { spaces: 2 });
      
      // Salvar conversas
      await fs.writeJson(this.conversationsFile, this.conversations, { spaces: 2 });
      
      // Atualizar e salvar estatísticas
      await this.updateStats();
      await fs.writeJson(this.statsFile, this.stats, { spaces: 2 });
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error);
    }
  }

  async updateStats() {
    this.stats.totalContacts = this.contacts.size;
    this.stats.totalConversations = this.conversations.length;
    
    // Contar leads por categoria
    let leadsQuentes = 0;
    let leadsFrios = 0;
    let clientesAtivos = 0;

    this.contacts.forEach(contact => {
      const tags = contact.tags || [];
      if (tags.some(tag => tag.includes('Lead Quente'))) leadsQuentes++;
      if (tags.some(tag => tag.includes('Lead Frio'))) leadsFrios++;
      if (tags.some(tag => tag.includes('Cliente Ativo'))) clientesAtivos++;
    });

    this.stats.leadsQuentes = leadsQuentes;
    this.stats.leadsFrios = leadsFrios;
    this.stats.clientesAtivos = clientesAtivos;
    
    // Calcular taxa de conversão
    if (this.stats.totalContacts > 0) {
      this.stats.taxaConversao = ((clientesAtivos / this.stats.totalContacts) * 100).toFixed(2);
    }
  }

  async addContact(contactData) {
    try {
      const id = this.generateId();
      const contact = {
        id,
        name: contactData.name,
        phone: contactData.phone,
        source: contactData.source || 'WhatsApp',
        status: contactData.status || 'new',
        tags: contactData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastInteraction: new Date().toISOString(),
        interactions: 0,
        metadata: contactData.metadata || {}
      };

      this.contacts.set(contact.phone, contact);
      await this.saveData();
      
      console.log(`✅ Novo contato adicionado: ${contact.name} (${contact.phone})`);
      return contact;
    } catch (error) {
      console.error('❌ Erro ao adicionar contato:', error);
      return null;
    }
  }

  async getContactByPhone(phone) {
    return this.contacts.get(phone) || null;
  }

  async updateContact(contactId, updateData) {
    try {
      // Encontrar contato por ID
      let contact = null;
      for (const [phone, contactData] of this.contacts.entries()) {
        if (contactData.id === contactId) {
          contact = contactData;
          break;
        }
      }

      if (!contact) {
        console.log(`⚠️ Contato não encontrado: ID ${contactId}`);
        return false;
      }

      // Atualizar dados
      Object.assign(contact, updateData, {
        updatedAt: new Date().toISOString()
      });

      await this.saveData();
      console.log(`✅ Contato atualizado: ${contact.name}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar contato:', error);
      return false;
    }
  }

  async addConversation(phone, message, direction, metadata = {}) {
    try {
      const conversation = {
        id: this.generateId(),
        phone,
        message,
        direction, // 'sent' ou 'received'
        timestamp: new Date().toISOString(),
        metadata
      };

      this.conversations.push(conversation);

      // Atualizar estatísticas do contato
      const contact = this.contacts.get(phone);
      if (contact) {
        contact.interactions++;
        contact.lastInteraction = conversation.timestamp;
      }

      await this.saveData();
      return conversation;
    } catch (error) {
      console.error('❌ Erro ao adicionar conversa:', error);
      return null;
    }
  }

  async getConversationsByPhone(phone, limit = 50) {
    return this.conversations
      .filter(conv => conv.phone === phone)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  async getLeadsByOrigin(origin) {
    const leads = [];
    this.contacts.forEach(contact => {
      const tags = contact.tags || [];
      if (tags.some(tag => tag.includes(origin))) {
        leads.push(contact);
      }
    });
    return leads;
  }

  async getActiveLeads() {
    const activeLeads = [];
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    this.contacts.forEach(contact => {
      if (new Date(contact.lastInteraction) > oneDayAgo) {
        activeLeads.push(contact);
      }
    });
    
    return activeLeads.sort((a, b) => 
      new Date(b.lastInteraction) - new Date(a.lastInteraction)
    );
  }

  async generateReport() {
    await this.updateStats();
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.stats,
      recentActivity: await this.getActiveLeads(),
      topPerformingOrigins: await this.getOriginStats()
    };

    // Salvar relatório
    const reportFile = path.join(this.dataPath, `report-${Date.now()}.json`);
    await fs.writeJson(reportFile, report, { spaces: 2 });
    
    return report;
  }

  async getOriginStats() {
    const origins = {};
    this.contacts.forEach(contact => {
      const tags = contact.tags || [];
      tags.forEach(tag => {
        if (tag.includes('Lead')) {
          origins[tag] = (origins[tag] || 0) + 1;
        }
      });
    });
    return origins;
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Métodos de análise avançada
  async getConversionRate() {
    return this.stats.taxaConversao;
  }

  async getResponseTime() {
    const recentConvs = this.conversations
      .slice(-100)
      .filter(conv => conv.direction === 'sent');
    
    if (recentConvs.length === 0) return 0;
    
    return recentConvs.length; // Simplificado - pode ser melhorado
  }

  async getStats() {
    await this.updateStats();
    return this.stats;
  }

  async backup() {
    try {
      const backupDir = path.join(this.dataPath, 'backups');
      await fs.ensureDir(backupDir);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
      
      const backupData = {
        contacts: Object.fromEntries(this.contacts),
        conversations: this.conversations,
        stats: this.stats,
        timestamp
      };
      
      await fs.writeJson(backupFile, backupData, { spaces: 2 });
      console.log(`✅ Backup criado: ${backupFile}`);
      
      return backupFile;
    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
      return null;
    }
  }
}

module.exports = InternalCRM;