CREATE DATABASE IF NOT EXISTS tesina_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tesina_db;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reportes
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    status ENUM('pendiente', 'en_proceso', 'resuelto') NOT NULL DEFAULT 'pendiente',
    image VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Usuario administrador por defecto (contraseña: admin123)
-- El hash corresponde a bcrypt de 'admin123'
INSERT INTO users (username, password, role) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE role = 'admin';