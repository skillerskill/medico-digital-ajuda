
// Rotas para gerenciamento de médicos
const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Obter todos os médicos (público)
router.get('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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
router.get('/specialty/:id', async (req, res) => {
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
router.post('/', [verifyToken, isAdmin], async (req, res) => {
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
router.put('/:id', [verifyToken, isAdmin], async (req, res) => {
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
router.delete('/:id', [verifyToken, isAdmin], async (req, res) => {
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
router.get('/specialties/all', async (req, res) => {
  try {
    const [specialties] = await pool.query('SELECT * FROM specialties');
    res.status(200).send(specialties);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao buscar especialidades" });
  }
});

module.exports = router;
