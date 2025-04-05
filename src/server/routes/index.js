
// Arquivo de rotas unificado
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Acesso não autorizado' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'seu_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido ou expirado' });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar se é admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito a administradores' });
  }
  next();
};

// Rota base
router.get('/', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Rotas de autenticação
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'patient' } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    // Verificar se o email já está em uso
    const connection = await db.getConnection();
    const [existingUser] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Email já está em uso' });
    }
    
    // Hash da senha
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    
    // Inserir novo usuário
    const [result] = await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    
    connection.release();
    
    const user = {
      id: result.insertId,
      name,
      email,
      role
    };
    
    const token = jwt.sign(user, process.env.JWT_SECRET || 'seu_jwt_secret', { expiresIn: '8h' });
    
    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
      user
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }
    
    const connection = await db.getConnection();
    const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    connection.release();
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    const user = users[0];
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    const userForToken = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    const token = jwt.sign(userForToken, process.env.JWT_SECRET || 'seu_jwt_secret', { expiresIn: '8h' });
    
    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: userForToken
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
  }
});

// Rotas administrativas
router.get('/admin/doctors', authenticateToken, isAdmin, async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [doctors] = await connection.query(
      'SELECT id, name, email, specialty FROM users WHERE role = "doctor"'
    );
    connection.release();
    
    res.json(doctors);
  } catch (error) {
    console.error('Erro ao buscar médicos:', error);
    res.status(500).json({ message: 'Erro ao buscar médicos', error: error.message });
  }
});

router.post('/admin/doctors', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, email, password, specialty } = req.body;
    
    if (!name || !email || !password || !specialty) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    // Verificar se o email já está em uso
    const connection = await db.getConnection();
    const [existingUser] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Email já está em uso' });
    }
    
    // Hash da senha
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    
    // Inserir novo médico
    const [result] = await connection.query(
      'INSERT INTO users (name, email, password, role, specialty) VALUES (?, ?, ?, "doctor", ?)',
      [name, email, hashedPassword, specialty]
    );
    
    connection.release();
    
    res.status(201).json({
      message: 'Médico adicionado com sucesso',
      doctor: {
        id: result.insertId,
        name,
        email,
        specialty
      }
    });
  } catch (error) {
    console.error('Erro ao adicionar médico:', error);
    res.status(500).json({ message: 'Erro ao adicionar médico', error: error.message });
  }
});

router.delete('/admin/doctors/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await db.getConnection();
    
    // Verificar se o médico existe
    const [doctor] = await connection.query(
      'SELECT * FROM users WHERE id = ? AND role = "doctor"',
      [id]
    );
    
    if (doctor.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Médico não encontrado' });
    }
    
    // Deletar o médico
    await connection.query('DELETE FROM users WHERE id = ?', [id]);
    connection.release();
    
    res.json({ message: 'Médico removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover médico:', error);
    res.status(500).json({ message: 'Erro ao remover médico', error: error.message });
  }
});

module.exports = router;
