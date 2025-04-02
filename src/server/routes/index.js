
// Arquivo de rotas unificado
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../config/db');

// Middleware de autenticação
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta');
    
    // Busca o usuário na base
    const [users] = await db.pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }
    
    const user = users[0];
    delete user.password; // Remove a senha do objeto antes de passar adiante
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

// Middleware para verificar permissões de admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acesso negado: permissões de administrador necessárias' });
  }
};

// Rota para login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verifica credenciais de usuário (paciente)
    const [users] = await db.pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    // Verifica credenciais de médico se não encontrar como usuário
    let user = null;
    let isDoctor = false;
    
    if (users.length === 0) {
      const [doctors] = await db.pool.query('SELECT * FROM doctors WHERE email = ?', [email]);
      if (doctors.length > 0) {
        user = doctors[0];
        isDoctor = true;
      }
    } else {
      user = users[0];
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }
    
    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }
    
    // Remove a senha antes de enviar
    const userResponse = { ...user };
    delete userResponse.password;
    
    // Adiciona o tipo de papel do usuário
    userResponse.role = isDoctor ? 'doctor' : user.role;
    
    // Gera o token JWT
    const token = jwt.sign(
      { id: user.id, role: userResponse.role },
      process.env.JWT_SECRET || 'sua_chave_secreta',
      { expiresIn: '24h' }
    );
    
    res.json({ user: userResponse, token });
    
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro ao processar login' });
  }
});

// Rota para registro de usuários (pacientes)
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, cpf, phone } = req.body;
    
    // Verificar se o email já está em uso (em ambas as tabelas)
    const [existingUsers] = await db.pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const [existingDoctors] = await db.pool.query('SELECT * FROM doctors WHERE email = ?', [email]);
    
    if (existingUsers.length > 0 || existingDoctors.length > 0) {
      return res.status(400).json({ message: 'Este email já está em uso' });
    }
    
    // Verificar se o CPF já está cadastrado
    const [existingCpf] = await db.pool.query('SELECT * FROM users WHERE cpf = ?', [cpf]);
    if (existingCpf.length > 0) {
      return res.status(400).json({ message: 'Este CPF já está cadastrado' });
    }
    
    // Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Inserir o novo usuário
    const [result] = await db.pool.query(
      'INSERT INTO users (name, email, password, cpf, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, cpf, phone, 'patient']
    );
    
    // Buscar o usuário recém-criado
    const [users] = await db.pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const user = users[0];
    delete user.password;
    
    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'sua_chave_secreta',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro ao processar registro' });
  }
});

// Rota para obter perfil do usuário logado
router.get('/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Rota para obter todas as especialidades médicas
router.get('/specialties', async (req, res) => {
  try {
    const [specialties] = await db.pool.query('SELECT * FROM specialties');
    res.json(specialties);
  } catch (error) {
    console.error('Erro ao buscar especialidades:', error);
    res.status(500).json({ message: 'Erro ao buscar especialidades' });
  }
});

// Rota para obter médicos por especialidade
router.get('/doctors/specialty/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [doctors] = await db.pool.query(
      'SELECT d.id, d.name, d.specialty_id, d.crm, d.bio, d.profile_image, d.consultation_price, s.name AS specialty_name ' +
      'FROM doctors d ' +
      'JOIN specialties s ON d.specialty_id = s.id ' +
      'WHERE d.specialty_id = ? AND d.active = true',
      [id]
    );
    res.json(doctors);
  } catch (error) {
    console.error('Erro ao buscar médicos:', error);
    res.status(500).json({ message: 'Erro ao buscar médicos' });
  }
});

// Rota para agendar consulta
router.post('/appointments', authenticate, async (req, res) => {
  try {
    const { doctor_id, scheduled_date, notes } = req.body;
    const patient_id = req.user.id;
    
    // Verifica se o horário está disponível
    const [existingAppointments] = await db.pool.query(
      'SELECT * FROM appointments WHERE doctor_id = ? AND scheduled_date = ? AND status != "canceled"',
      [doctor_id, scheduled_date]
    );
    
    if (existingAppointments.length > 0) {
      return res.status(400).json({ message: 'Este horário não está disponível' });
    }
    
    // Cria o agendamento
    const [result] = await db.pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, scheduled_date, notes) VALUES (?, ?, ?, ?)',
      [patient_id, doctor_id, scheduled_date, notes]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      patient_id, 
      doctor_id, 
      scheduled_date, 
      notes,
      status: 'pending',
      payment_status: 'pending'
    });
  } catch (error) {
    console.error('Erro ao agendar consulta:', error);
    res.status(500).json({ message: 'Erro ao agendar consulta' });
  }
});

// Rota para listar consultas do paciente
router.get('/patient/appointments', authenticate, async (req, res) => {
  try {
    const [appointments] = await db.pool.query(
      'SELECT a.*, d.name AS doctor_name, d.profile_image AS doctor_image, s.name AS specialty ' +
      'FROM appointments a ' +
      'JOIN doctors d ON a.doctor_id = d.id ' +
      'JOIN specialties s ON d.specialty_id = s.id ' +
      'WHERE a.patient_id = ? ' +
      'ORDER BY a.scheduled_date DESC',
      [req.user.id]
    );
    
    res.json(appointments);
  } catch (error) {
    console.error('Erro ao listar consultas:', error);
    res.status(500).json({ message: 'Erro ao listar consultas' });
  }
});

// ROTAS DE ADMINISTRAÇÃO

// Rota para listar médicos (admin)
router.get('/admin/doctors', authenticate, isAdmin, async (req, res) => {
  try {
    const [doctors] = await db.pool.query(
      'SELECT d.*, s.name AS specialty_name ' +
      'FROM doctors d ' +
      'JOIN specialties s ON d.specialty_id = s.id'
    );
    
    // Remove as senhas dos resultados
    doctors.forEach(doctor => delete doctor.password);
    
    res.json(doctors);
  } catch (error) {
    console.error('Erro ao listar médicos:', error);
    res.status(500).json({ message: 'Erro ao listar médicos' });
  }
});

// Rota para adicionar médico (admin)
router.post('/admin/doctors', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email, specialty_id, crm, phone, bio, consultation_price } = req.body;
    
    // Verifica se o email já está em uso
    const [existingUsers] = await db.pool.query('SELECT * FROM users WHERE email = ? UNION SELECT * FROM doctors WHERE email = ?', [email, email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Este email já está em uso' });
    }
    
    // Verifica se o CRM já está cadastrado
    const [existingCrm] = await db.pool.query('SELECT * FROM doctors WHERE crm = ?', [crm]);
    if (existingCrm.length > 0) {
      return res.status(400).json({ message: 'Este CRM já está cadastrado' });
    }
    
    // Gera uma senha padrão inicial
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('medico123', salt); // Senha padrão inicial que o médico deve alterar no primeiro login
    
    // Insere o novo médico
    const [result] = await db.pool.query(
      'INSERT INTO doctors (name, email, password, specialty_id, crm, phone, bio, consultation_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, specialty_id, crm, phone, bio, consultation_price]
    );
    
    // Busca o médico recém-criado
    const [doctors] = await db.pool.query('SELECT * FROM doctors WHERE id = ?', [result.insertId]);
    const doctor = doctors[0];
    delete doctor.password;
    
    res.status(201).json(doctor);
  } catch (error) {
    console.error('Erro ao adicionar médico:', error);
    res.status(500).json({ message: 'Erro ao adicionar médico' });
  }
});

// Rota para editar médico (admin)
router.put('/admin/doctors/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialty_id, crm, phone, bio, consultation_price, active } = req.body;
    
    // Atualiza os dados do médico
    await db.pool.query(
      'UPDATE doctors SET name = ?, specialty_id = ?, crm = ?, phone = ?, bio = ?, consultation_price = ?, active = ? WHERE id = ?',
      [name, specialty_id, crm, phone, bio, consultation_price, active, id]
    );
    
    // Busca o médico atualizado
    const [doctors] = await db.pool.query('SELECT * FROM doctors WHERE id = ?', [id]);
    
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Médico não encontrado' });
    }
    
    const doctor = doctors[0];
    delete doctor.password;
    
    res.json(doctor);
  } catch (error) {
    console.error('Erro ao editar médico:', error);
    res.status(500).json({ message: 'Erro ao editar médico' });
  }
});

// Rota para excluir médico (admin)
router.delete('/admin/doctors/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifica se existem consultas marcadas para este médico
    const [appointments] = await db.pool.query(
      'SELECT * FROM appointments WHERE doctor_id = ? AND status IN ("pending", "confirmed")',
      [id]
    );
    
    if (appointments.length > 0) {
      return res.status(400).json({ 
        message: 'Não é possível excluir este médico, pois existem consultas marcadas.' 
      });
    }
    
    // Exclui o médico
    await db.pool.query('DELETE FROM doctors WHERE id = ?', [id]);
    
    res.json({ message: 'Médico excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir médico:', error);
    res.status(500).json({ message: 'Erro ao excluir médico' });
  }
});

// Rota padrão para teste
router.get('/', (req, res) => {
  res.json({ message: 'API de telemedicina online funcionando!' });
});

module.exports = router;
