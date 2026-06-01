// db.js
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Kilimanjar0.1', // Change this
    database: 'vasma',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool = null;

async function getPool() {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
        
        // Test connection
        try {
            const connection = await pool.getConnection();
            console.log('Database connected successfully');
            connection.release();
        } catch (error) {
            console.error('Database connection failed:', error);
            throw error;
        }
    }
    return pool;
}

async function query(sql, params) {
    const pool = await getPool();
    return pool.query(sql, params);
}

module.exports = { getPool, query };