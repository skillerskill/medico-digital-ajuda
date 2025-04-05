
// Configuração da conexão com o MySQL
const mysql = require('mysql2/promise');

let pool;

const getConnection = async () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'telemedicina',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  
  // Testar a conexão
  const connection = await pool.getConnection();
  connection.release();
  return connection;
};

module.exports = {
  getConnection,
  pool
};
