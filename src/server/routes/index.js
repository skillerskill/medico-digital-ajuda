
// Arquivo unificado de rotas
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const router = express.Router();

// Middleware de autenticação
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  
  if (!token) {
    return res.status(403).send({
      message: "Nenhum token fornecido!"
    });
  }

  // Remove 'Bearer ' do token se existir
  const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
  
  try {
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET || 'sua_chave_secreta');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).send({
      message: "Não autorizado!"
    });
  }
};

const isAdmin = (req, res, next) => {
  if (req.userRole === 'admin') {
    next();
  } else {
    res.status(403).send({
      message: "Requer privilégios de administrador!"
    });
  }
};

// ================ ROTAS DE AUTENTICAÇÃO ================

// Rota de registro de usuários (pacientes)
router.post('/auth/register', async (req, res) => {
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
router.post('/auth/login', async (req, res) => {
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
router.get('/auth/me', verifyToken, async (req, res) => {
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

// ================ ROTAS DE MÉDICOS ================

// Obter todos os médicos (público)
router.get('/doctors', async (req, res) => {
  try {
    const [doctors] = await pool.query(
      'SELECT d.id, d.name, d.email, d.specialty_id, d.crm, d.phone, d.bio, d.profile_image, d.consultation_price, s.name as specialty_name FROM doctors d JOIN specialties s ON d.specialty_id = s.id WHERE d.active = 1'
    );
    
    res.status(200).send(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao buscar médicos" });
  }
});

// Obter médico por ID (público)
router.get('/doctors/:id', async (req, res) => {
  try {
    const [doctors] = await pool.query(
      'SELECT d.id, d.name, d.email, d.specialty_id, d.crm, d.phone, d.bio, d.profile_image, d.consultation_price, s.name as specialty_name FROM doctors d JOIN specialties s ON d.specialty_id = s.id WHERE d.id = ? AND d.active = 1',
      [req.params.id]
    );
    
    if (doctors.length === 0) {
      return res.status(404).send({ message: "Médico não encontrado" });
    }
    
    res.status(200).send(doctors[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao buscar médico" });
  }
});

// Obter médicos por especialidade (público)
router.get('/doctors/specialty/:id', async (req, res) => {
  try {
    const [doctors] = await pool.query(
      'SELECT d.id, d.name, d.email, d.specialty_id, d.crm, d.phone, d.bio, d.profile_image, d.consultation_price, s.name as specialty_name FROM doctors d JOIN specialties s ON d.specialty_id = s.id WHERE d.specialty_id = ? AND d.active = 1',
      [req.params.id]
    );
    
    res.status(200).send(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao buscar médicos por especialidade" });
  }
});

// Adicionar um novo médico (apenas admin)
router.post('/doctors', [verifyToken, isAdmin], async (req, res) => {
  try {
    const { name, email, password, specialty_id, crm, phone, bio, consultation_price } = req.body;
    
    // Verificar se o email já existe
    const [existingDoctors] = await pool.query('SELECT * FROM doctors WHERE email = ? OR crm = ?', [email, crm]);
    
    if (existingDoctors.length > 0) {
      return res.status(400).send({ message: "Email ou CRM já está em uso!" });
    }
    
    // Hash da senha
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Inserir novo médico
    const [result] = await pool.query(
      'INSERT INTO doctors (name, email, password, specialty_id, crm, phone, bio, consultation_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, specialty_id, crm, phone, bio, consultation_price]
    );
    
    res.status(201).send({
      message: "Médico adicionado com sucesso!",
      doctor: {
        id: result.insertId,
        name,
        email,
        specialty_id,
        crm
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao adicionar médico" });
  }
});

// Atualizar médico (apenas admin)
router.put('/doctors/:id', [verifyToken, isAdmin], async (req, res) => {
  try {
    const { name, email, specialty_id, crm, phone, bio, consultation_price, active } = req.body;
    
    // Verificar se o médico existe
    const [existingDoctors] = await pool.query('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
    
    if (existingDoctors.length === 0) {
      return res.status(404).send({ message: "Médico não encontrado" });
    }
    
    // Atualizar médico
    await pool.query(
      'UPDATE doctors SET name = ?, email = ?, specialty_id = ?, crm = ?, phone = ?, bio = ?, consultation_price = ?, active = ? WHERE id = ?',
      [name, email, specialty_id, crm, phone, bio, consultation_price, active, req.params.id]
    );
    
    res.status(200).send({ message: "Médico atualizado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao atualizar médico" });
  }
});

// Remover médico (apenas admin)
router.delete('/doctors/:id', [verifyToken, isAdmin], async (req, res) => {
  try {
    // Verificar se o médico existe
    const [existingDoctors] = await pool.query('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
    
    if (existingDoctors.length === 0) {
      return res.status(404).send({ message: "Médico não encontrado" });
    }
    
    // Desativar médico em vez de excluir (soft delete)
    await pool.query('UPDATE doctors SET active = 0 WHERE id = ?', [req.params.id]);
    
    res.status(200).send({ message: "Médico removido com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao remover médico" });
  }
});

// Obter todas as especialidades (público)
router.get('/specialties', async (req, res) => {
  try {
    const [specialties] = await pool.query('SELECT * FROM specialties');
    res.status(200).send(specialties);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao buscar especialidades" });
  }
});

// ================ ROTAS DE CONSULTAS ================

// Criar nova consulta (usuário autenticado)
router.post('/appointments', verifyToken, async (req, res) => {
  try {
    const { doctor_id, scheduled_date, notes } = req.body;
    const patient_id = req.userId;
    
    // Verificar se o médico existe e está ativo
    const [doctors] = await pool.query('SELECT * FROM doctors WHERE id = ? AND active = 1', [doctor_id]);
    
    if (doctors.length === 0) {
      return res.status(404).send({ message: "Médico não encontrado ou inativo" });
    }
    
    // Verificar disponibilidade do horário
    const [existingAppointments] = await pool.query(
      'SELECT * FROM appointments WHERE doctor_id = ? AND scheduled_date = ? AND status NOT IN ("canceled")',
      [doctor_id, scheduled_date]
    );
    
    if (existingAppointments.length > 0) {
      return res.status(400).send({ message: "Horário indisponível" });
    }
    
    // Inserir nova consulta
    const [result] = await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, scheduled_date, notes) VALUES (?, ?, ?, ?)',
      [patient_id, doctor_id, scheduled_date, notes]
    );
    
    res.status(201).send({
      message: "Consulta agendada com sucesso!",
      appointment: {
        id: result.insertId,
        patient_id,
        doctor_id,
        scheduled_date,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao agendar consulta" });
  }
});

// Obter consultas do paciente (usuário autenticado)
router.get('/appointments/my-appointments', verifyToken, async (req, res) => {
  try {
    const [appointments] = await pool.query(
      `SELECT a.*, d.name as doctor_name, d.profile_image as doctor_image, s.name as specialty 
       FROM appointments a 
       JOIN doctors d ON a.doctor_id = d.id 
       JOIN specialties s ON d.specialty_id = s.id 
       WHERE a.patient_id = ? 
       ORDER BY a.scheduled_date DESC`,
      [req.userId]
    );
    
    res.status(200).send(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao buscar consultas" });
  }
});

// Cancelar consulta (usuário autenticado)
router.put('/appointments/:id/cancel', verifyToken, async (req, res) => {
  try {
    // Verificar se a consulta existe e pertence ao usuário
    const [appointments] = await pool.query(
      'SELECT * FROM appointments WHERE id = ? AND patient_id = ?',
      [req.params.id, req.userId]
    );
    
    if (appointments.length === 0) {
      return res.status(404).send({ message: "Consulta não encontrada" });
    }
    
    // Verificar se a consulta já foi cancelada ou realizada
    if (['canceled', 'completed'].includes(appointments[0].status)) {
      return res.status(400).send({ message: `Não é possível cancelar uma consulta ${appointments[0].status === 'canceled' ? 'já cancelada' : 'já realizada'}` });
    }
    
    // Cancelar consulta
    await pool.query(
      'UPDATE appointments SET status = "canceled" WHERE id = ?',
      [req.params.id]
    );
    
    res.status(200).send({ message: "Consulta cancelada com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao cancelar consulta" });
  }
});

// Obter consultas do médico (médico autenticado)
router.get('/appointments/doctor-appointments', verifyToken, async (req, res) => {
  try {
    // Verificar se o usuário é um médico
    const [doctors] = await pool.query('SELECT * FROM doctors WHERE id = ?', [req.userId]);
    
    if (doctors.length === 0) {
      return res.status(403).send({ message: "Acesso restrito a médicos" });
    }
    
    const [appointments] = await pool.query(
      `SELECT a.*, u.name as patient_name, u.phone as patient_phone 
       FROM appointments a 
       JOIN users u ON a.patient_id = u.id 
       WHERE a.doctor_id = ? 
       ORDER BY a.scheduled_date ASC`,
      [req.userId]
    );
    
    res.status(200).send(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao buscar consultas" });
  }
});

// Atualizar status da consulta (médico autenticado)
router.put('/appointments/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    // Verificar se a consulta existe e pertence ao médico
    const [appointments] = await pool.query(
      'SELECT * FROM appointments WHERE id = ? AND doctor_id = ?',
      [req.params.id, req.userId]
    );
    
    if (appointments.length === 0) {
      return res.status(404).send({ message: "Consulta não encontrada" });
    }
    
    // Atualizar status da consulta
    await pool.query(
      'UPDATE appointments SET status = ?, notes = ? WHERE id = ?',
      [status, notes, req.params.id]
    );
    
    res.status(200).send({ message: "Status da consulta atualizado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao atualizar status da consulta" });
  }
});

module.exports = router;
