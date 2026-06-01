const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Kilimanjar0.1', // Change this
            database: 'vasma'
        });
        
        console.log('Connected to database successfully!');
        
        // Test query
        const [rows] = await connection.query('SELECT NOW() as current_time');
        console.log('Current database time:', rows[0].current_time);
        
        await connection.end();
    } catch (error) {
        console.error('Connection failed:', error.message);
    }
}

testConnection();