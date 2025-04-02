
// Rotas de autenticação
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Rota de registro de usuários (pacientes)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Verificar se o email já existe
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).send({ message: "Email já está em uso!" });
    }
    
    // Hash da senha
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Inserir novo usuário
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone]
    );
    
    // Gerar token JWT
    const token = jwt.sign(
      { id: result.insertId, role: 'patient' },
      process.env.JWT_SECRET || 'sua_chave_secreta',
      { expiresIn: '24h' }
    );
    
    res.status(201).send({
      message: "Usuário registrado com sucesso!",
      user: {
        id: result.insertId,
        name,
        email,
        role: 'patient'
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao registrar usuário" });
  }
});

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verificar usuários normais
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length > 0) {
      const user = users[0];
      const passwordIsValid = bcrypt.compareSync(password, user.password);
      
      if (!passwordIsValid) {
        return res.status(401).send({ message: "Senha inválida!" });
      }
      
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'sua_chave_secreta',
        { expiresIn: '24h' }
      );
      
      return res.status(200).send({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    }
    
    // Verificar médicos
    const [doctors] = await pool.query('SELECT * FROM doctors WHERE email = ?', [email]);
    
    if (doctors.length > 0) {
      const doctor = doctors[0];
      const passwordIsValid = bcrypt.compareSync(password, doctor.password);
      
      if (!passwordIsValid) {
        return res.status(401).send({ message: "Senha inválida!" });
      }
      
      const token = jwt.sign(
        { id: doctor.id, role: 'doctor' },
        process.env.JWT_SECRET || 'sua_chave_secreta',
        { expiresIn: '24h' }
      );
      
      return res.status(200).send({
        user: {
          id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          role: 'doctor',
          specialty_id: doctor.specialty_id
        },
        token
      });
    }
    
    return res.status(404).send({ message: "Usuário não encontrado!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro no servidor" });
  }
});

// Rota para obter informações do usuário atual
router.get('/me', verifyToken, async (req, res) => {
  try {
    // Verificar se é um usuário normal
    const [users] = await pool.query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?', [req.userId]);
    
    if (users.length > 0) {
      return res.status(200).send(users[0]);
    }
    
    // Verificar se é um médico
    const [doctors] = await pool.query(
      'SELECT d.id, d.name, d.email, "doctor" as role, d.specialty_id, d.crm, d.phone, d.bio, d.profile_image, s.name as specialty_name FROM doctors d JOIN specialties s ON d.specialty_id = s.id WHERE d.id = ?',
      [req.userId]
    );
    
    if (doctors.length > 0) {
      return res.status(200).send(doctors[0]);
    }
    
    return res.status(404).send({ message: "Usuário não encontrado!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro no servidor" });
  }
});

module.exports = router;
