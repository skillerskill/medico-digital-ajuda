
// Rotas para gerenciamento de consultas
const express = require('express');
const { pool } = require('../config/db');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Criar nova consulta (usuário autenticado)
router.post('/', verifyToken, async (req, res) => {
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
router.get('/my-appointments', verifyToken, async (req, res) => {
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
router.put('/:id/cancel', verifyToken, async (req, res) => {
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
router.get('/doctor-appointments', verifyToken, async (req, res) => {
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
router.put('/:id/status', verifyToken, async (req, res) => {
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
