-- =====================================================================
-- MIGRACIÓN: agregar columnas lat/lng a la tabla "reports"
-- =====================================================================
-- El código del backend (models/Report.js) ya intentaba insertar valores
-- de latitud/longitud, pero la tabla "reports" creada por database.sql
-- nunca tuvo esas columnas. Por eso cada intento de crear un reporte
-- fallaba con el error de MySQL "Unknown column 'lat' in 'field list'".
--
-- Este script agrega las columnas faltantes a una base de datos
-- "tesina_db" que ya existe (por ejemplo, en tu XAMPP actual).
-- Si vas a crear la base de datos desde cero, no hace falta correr esto:
-- alcanza con el database.sql actualizado, que ya incluye lat/lng.
--
-- CÓMO USARLO EN phpMyAdmin:
-- 1. Abrí phpMyAdmin → seleccioná la base de datos "tesina_db".
-- 2. Pestaña "SQL" → pegá el contenido de este archivo → "Continuar".
-- =====================================================================

USE tesina_db;

ALTER TABLE reports
    ADD COLUMN IF NOT EXISTS lat DECIMAL(10,7) DEFAULT NULL AFTER location,
    ADD COLUMN IF NOT EXISTS lng DECIMAL(10,7) DEFAULT NULL AFTER lat;
