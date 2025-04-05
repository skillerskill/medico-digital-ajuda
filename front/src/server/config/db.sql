
-- Script SQL para criar as tabelas no banco de dados

CREATE DATABASE IF NOT EXISTS telemedicina;

USE telemedicina;

-- Tabela de usuários (pacientes e administradores)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('patient', 'admin') DEFAULT 'patient',
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de especialidades médicas
CREATE TABLE IF NOT EXISTS specialties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de médicos
CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  specialty_id INT,
  crm VARCHAR(20) NOT NULL UNIQUE,
  phone VARCHAR(20),
  bio TEXT,
  profile_image VARCHAR(255),
  consultation_price DECIMAL(10,2),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (specialty_id) REFERENCES specialties(id)
);

-- Tabela de consultas
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  scheduled_date DATETIME NOT NULL,
  status ENUM('pending', 'confirmed', 'canceled', 'completed') DEFAULT 'pending',
  notes TEXT,
  payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- Inserir algumas especialidades para começar
INSERT INTO specialties (name, description, icon) VALUES 
('Clínica Geral', 'Consultas médicas gerais e diagnósticos iniciais', 'stethoscope'),
('Cardiologia', 'Especialidade médica que trata de doenças relacionadas ao coração', 'heart-pulse'),
('Dermatologia', 'Especialidade médica focada em diagnóstico e tratamento de doenças de pele', 'activity'),
('Psiquiatria', 'Especialidade médica focada em saúde mental', 'brain'),
('Pediatria', 'Especialidade médica dedicada à saúde de crianças e adolescentes', 'baby');

-- Inserir um usuário administrador padrão (senha: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Administrador', 'admin@telemedicina.com', '$2a$10$MQzKTCrjO7a1KvdXQNS3OOsJ9lzm2WfKlxKndE7S/jNPnZx1MrHLW', 'admin');
