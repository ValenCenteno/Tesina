-- Crear base de datos
CREATE DATABASE IF NOT EXISTS app_municipal;
USE app_municipal;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reportes
CREATE TABLE IF NOT EXISTS reportes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    imagen VARCHAR(255),
    latitud DECIMAL(10,8) NOT NULL,
    longitud DECIMAL(11,8) NOT NULL,
    estado ENUM('pendiente', 'en_proceso', 'resuelto') DEFAULT 'pendiente',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Insertar usuario administrador (contraseña: admin123)
-- La contraseña encriptada es: $2a$10$N9qo8uLOickgx2ZMRZoMy.MrJQkqKZkZkZkZkZkZkZkZkZkZkZ
INSERT INTO usuarios (nombre, email, password) 
VALUES ('Administrador', 'admin@reporte.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrJQkqKZkZkZkZkZkZkZkZkZkZkZ')
ON DUPLICATE KEY UPDATE id=id;

-- Insertar algunos reportes de ejemplo
INSERT INTO reportes (tipo, descripcion, latitud, longitud, estado, usuario_id) VALUES
('bache', 'Bache profundo en Av. Reforma, peligroso para autos', 19.4326, -99.1332, 'pendiente', 1),
('basura', 'Acumulación de basura en la esquina de Insurgentes', 19.4340, -99.1350, 'en_proceso', 1),
('luminaria', 'Luminaria apagada en el parque central', 19.4300, -99.1300, 'resuelto', 1);

-- Tabla de sesiones (agregar a database.sql)
CREATE TABLE IF NOT EXISTS sesiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 7 DAY)),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token)
);