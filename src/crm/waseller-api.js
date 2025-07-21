const fs = require('fs').promises;
const path = require('path');

class InternalCRM {
  constructor() {
    this.dataDir = './data/crm/';
    this.contactsFile = path.join(this.dataDir, 'contacts.json');
    this.conversationsFile = path.join(this.dataDir, 'conversations.json');
    this.templatesFile = path.join(this.dataDir, 'templates.json');
    this.tagsFile = path.join(this.dataDir, 'tags.json');
    
    console.log('🏗️ Inicializando CRM Interno...');
    this.ensureDataDir();
  }

  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      console.log('✅ Diretório de dados criado');
    } catch (error) {
      console.log('⚠️ Diretório já existe');
    }
  }

  // === GESTÃO DE CONTATOS ===
  async addContact(contactData) {
    const contacts = await this.getContacts();
    
    const contact = {
      id: this.generateId(),
      name: contactData.name,
      phone: contactData.phone,
      email: contactData.email || '',
      source: contactData.source || 'WhatsApp',
      status: contactData.status || 'new',
      tags: contactData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastContact: new Date().toISOString(),
      notes: contactData.notes || ''
    };

    contacts.push(contact);
    await this.saveContacts(contacts);
    console.log(`✅ Contato adicionado: ${contact.name} (${contact.phone})`);
    return contact;
  }

  async getContacts() {
    try {
      const data = await fs.readFile(this.contactsFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async saveContacts(contacts) {
    await fs.writeFile(this.contactsFile, JSON.stringify(contacts, null, 2));
  }

  async getContactByPhone(phone) {
    const contacts = await this.getContacts();
    return contacts.find(c => c.phone === phone);
  }

  async updateContact(id, updates) {
    const contacts = await this.getContacts();
    const index = contacts.findIndex(c => c.id === id);
    
    if (index !== -1) {
      contacts[index] = {
        ...contacts[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await this.saveContacts(contacts);
      console.log(`✅ Contato atualizado: ${id}`);
      return contacts[index];
    }
    console.log(`⚠️ Contato não encontrado: ${id}`);
    return null;
  }

  // === GESTÃO DE CONVERSAS ===
  async addConversation(phone, message, direction = 'received', metadata = {}) {
    const conversations = await this.getConversations();
    
    const conversation = {
      id: this.generateId(),
      phone,
      message,
      direction, // 'received' ou 'sent'
      timestamp: new Date().toISOString(),
      processed: false,
      type: metadata.type || 'text',
      metadata: metadata
    };
    
    conversations.push(conversation);
    await this.saveConversations(conversations);
    
    // Atualizar último contato
    await this.updateLastContact(phone);
    
    console.log(`📝 Conversa registrada: ${phone} (${direction})`);
    return conversation;
  }

  async getConversations(limit = null) {
    try {
      const data = await fs.readFile(this.conversationsFile, 'utf8');
      const conversations = JSON.parse(data);
      
      if (limit) {
        return conversations.slice(-limit);
      }
      return conversations;
    } catch {
      return [];
    }
  }

  async saveConversations(conversations) {
    await fs.writeFile(this.conversationsFile, JSON.stringify(conversations, null, 2));
  }

  async getConversationsByPhone(phone) {
    const conversations = await this.getConversations();
    return conversations.filter(c => c.phone === phone);
  }

  async updateLastContact(phone) {
    const contact = await this.getContactByPhone(phone);
    if (contact) {
      await this.updateContact(contact.id, {
        lastContact: new Date().toISOString()
      });
    }
  }

  // === TEMPLATES E RESPOSTAS RÁPIDAS ===
  async addTemplate(name, content, category = 'general') {
    const templates = await this.getTemplates();
    
    const template = {
      id: this.generateId(),
      name,
      content,
      category,
      usageCount: 0,
      createdAt: new Date().toISOString()
    };

    templates.push(template);
    await this.saveTemplates(templates);
    console.log(`✅ Template adicionado: ${name}`);
    return template;
  }

  async getTemplates() {
    try {
      const data = await fs.readFile(this.templatesFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async saveTemplates(templates) {
    await fs.writeFile(this.templatesFile, JSON.stringify(templates, null, 2));
  }

  async useTemplate(templateId) {
    const templates = await this.getTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (template) {
      template.usageCount += 1;
      await this.saveTemplates(templates);
      return template.content;
    }
    return null;
  }

  // === TAGS E ETIQUETAS ===
  async addTag(name, color = '#3498db') {
    const tags = await this.getTags();
    
    const tag = {
      id: this.generateId(),
      name,
      color,
      count: 0,
      createdAt: new Date().toISOString()
    };

    tags.push(tag);
    await this.saveTags(tags);
    console.log(`🏷️ Tag adicionada: ${name}`);
    return tag;
  }

  async getTags() {
    try {
      const data = await fs.readFile(this.tagsFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async saveTags(tags) {
    await fs.writeFile(this.tagsFile, JSON.stringify(tags, null, 2));
  }

  async tagContact(contactId, tagName) {
    const contact = await this.getContactById(contactId);
    if (contact && !contact.tags.includes(tagName)) {
      contact.tags.push(tagName);
      await this.updateContact(contactId, { tags: contact.tags });
      console.log(`🏷️ Tag aplicada: ${tagName} -> ${contact.name}`);
    }
  }

  async getContactById(id) {
    const contacts = await this.getContacts();
    return contacts.find(c => c.id === id);
  }

  // === ESTATÍSTICAS E RELATÓRIOS ===
  async getStats() {
    const contacts = await this.getContacts();
    const conversations = await this.getConversations();
    const templates = await this.getTemplates();
    const tags = await this.getTags();
    
    const today = new Date().toDateString();
    const thisWeek = this.getWeekStart();
    const thisMonth = new Date().getMonth();

    return {
      // Contatos
      totalContacts: contacts.length,
      newContactsToday: contacts.filter(c => 
        new Date(c.createdAt).toDateString() === today
      ).length,
      newContactsThisWeek: contacts.filter(c => 
        new Date(c.createdAt) >= thisWeek
      ).length,
      
      // Conversas
      totalConversations: conversations.length,
      conversationsToday: conversations.filter(c => 
        new Date(c.timestamp).toDateString() === today
      ).length,
      receivedToday: conversations.filter(c => 
        c.direction === 'received' && 
        new Date(c.timestamp).toDateString() === today
      ).length,
      sentToday: conversations.filter(c => 
        c.direction === 'sent' && 
        new Date(c.timestamp).toDateString() === today
      ).length,
      
      // Outros
      totalTemplates: templates.length,
      totalTags: tags.length,
      
      // Status dos contatos
      contactsByStatus: this.groupBy(contacts, 'status'),
      
      // Atividade recente
      recentContacts: contacts
        .sort((a, b) => new Date(b.lastContact) - new Date(a.lastContact))
        .slice(0, 5),
      
      recentConversations: conversations
        .slice(-10)
        .reverse()
    };
  }

  // === BUSCA E FILTROS ===
  async searchContacts(query) {
    const contacts = await this.getContacts();
    const lowerQuery = query.toLowerCase();
    
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(lowerQuery) ||
      contact.phone.includes(query) ||
      (contact.email && contact.email.toLowerCase().includes(lowerQuery)) ||
      contact.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  async getContactsByTag(tagName) {
    const contacts = await this.getContacts();
    return contacts.filter(contact => contact.tags.includes(tagName));
  }

  async getContactsByStatus(status) {
    const contacts = await this.getContacts();
    return contacts.filter(contact => contact.status === status);
  }

  // === UTILITÁRIOS ===
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  getWeekStart() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key] || 'undefined';
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  // === EXPORTAR DADOS ===
  async exportData() {
    const data = {
      contacts: await this.getContacts(),
      conversations: await this.getConversations(),
      templates: await this.getTemplates(),
      tags: await this.getTags(),
      stats: await this.getStats(),
      exportedAt: new Date().toISOString()
    };

    const exportFile = `./data/crm/export-${Date.now()}.json`;
    await fs.writeFile(exportFile, JSON.stringify(data, null, 2));
    console.log(`📄 Dados exportados para: ${exportFile}`);
    
    return {
      file: exportFile,
      summary: {
        contacts: data.contacts.length,
        conversations: data.conversations.length,
        templates: data.templates.length,
        tags: data.tags.length
      }
    };
  }
}

module.exports = InternalCRM;
