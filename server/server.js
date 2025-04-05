
// Servidor principal de Express
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes/index');
const db = require('./config/db');
const bcryptjs = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');

// Configuração de variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Testar conexão com o banco de dados
db.getConnection()
  .then(() => console.log('Conexão com o MySQL estabelecida!'))
  .catch(err => console.error('Erro ao conectar com o MySQL:', err));

// Rotas
app.use('/api', routes);

// Rota padrão
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API de Assistência Médica Online' });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
