const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, '../../data/database.sqlite');
        this.db = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('❌ Erro ao conectar banco:', err);
                    reject(err);
                } else {
                    console.log('📊 Banco de dados conectado!');
                    this.createTables();
                    resolve();
                }
            });
        });
    }

    createTables() {
        // Tabela de conversas
        this.db.run(`
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone_number TEXT NOT NULL,
                user_name TEXT,
                message TEXT NOT NULL,
                response TEXT,
                message_type TEXT DEFAULT 'text',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de clientes
        this.db.run(`
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone_number TEXT UNIQUE NOT NULL,
                name TEXT,
                email TEXT,
                status TEXT DEFAULT 'lead',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_interaction DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de configurações
        this.db.run(`
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT NOT NULL,
                description TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('🗄️ Tabelas criadas/verificadas!');
    }

    // Salvar conversa
    async saveConversation(phoneNumber, userName, message, response) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO conversations (phone_number, user_name, message, response)
                VALUES (?, ?, ?, ?)
            `;
            
            this.db.run(sql, [phoneNumber, userName, message, response], function(err) {
                if (err) {
                    console.error('❌ Erro ao salvar conversa:', err);
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    // Criar/atualizar cliente
    async upsertCustomer(phoneNumber, name) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT OR REPLACE INTO customers (phone_number, name, last_interaction)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            `;
            
            this.db.run(sql, [phoneNumber, name], function(err) {
                if (err) {
                    console.error('❌ Erro ao salvar cliente:', err);
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    // Buscar histórico do cliente
    async getCustomerHistory(phoneNumber, limit = 10) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM conversations 
                WHERE phone_number = ? 
                ORDER BY created_at DESC 
                LIMIT ?
            `;
            
            this.db.all(sql, [phoneNumber, limit], (err, rows) => {
                if (err) {
                    console.error('❌ Erro ao buscar histórico:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async close() {
        if (this.db) {
            this.db.close();
            console.log('📊 Banco de dados desconectado.');
        }
    }
}

module.exports = Database;