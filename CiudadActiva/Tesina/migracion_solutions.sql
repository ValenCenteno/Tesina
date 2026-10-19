-- =====================================================================
-- MIGRACIÓN: crear la tabla "solutions"
-- =====================================================================
-- Guarda la información de cómo se solucionó un reporte, asociada
-- por report_id. UNIQUE en report_id = máximo una solución por reporte.
--
-- CÓMO USARLO EN phpMyAdmin:
-- 1. Abrí phpMyAdmin → seleccioná la base de datos "tesina_db".
-- 2. Pestaña "SQL" → pegá el contenido de este archivo → "Continuar".
-- 3. Después corré: DESCRIBE solutions;  para confirmar.
-- =====================================================================

USE tesina_db;

CREATE TABLE IF NOT EXISTS solutions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    solved_date DATE NOT NULL,
    image VARCHAR(255) DEFAULT NULL,
    created_by INT DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Verificación
DESCRIBE solutions;
