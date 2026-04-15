const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_municipal_2024';

// Crear carpeta uploads
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif/;
        const mimetype = allowed.test(file.mimetype);
        const extname = allowed.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Solo imágenes'));
    }
});

// Middleware de autenticación
const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) throw new Error();
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'No autorizado' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) throw new Error();
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.userId !== 1) return res.status(403).json({ message: 'Acceso denegado' });
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'No autorizado' });
    }
};

// ========== RUTAS ==========

// Verificar si email existe
app.post('/api/verificar-email', async (req, res) => {
    try {
        const { email } = req.body;
        const [users] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        res.json({ existe: users.length > 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar email' });
    }
});

// Registro
app.post('/api/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        if (!nombre || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }
        const [existing] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
            [nombre, email, hashedPassword]
        );
        res.status(201).json({ message: 'Usuario registrado exitosamente', userId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ message: 'Credenciales inválidas' });
        const user = users[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Credenciales inválidas' });
        const token = jwt.sign({ userId: user.id, email: user.email, nombre: user.nombre }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
});

// Obtener reportes (con filtros)
app.get('/api/reportes', async (req, res) => {
    try {
        const { tipo, estado, search } = req.query;
        let query = `SELECT r.*, u.nombre as usuario_nombre FROM reportes r JOIN usuarios u ON r.usuario_id = u.id WHERE 1=1`;
        const params = [];
        if (tipo && tipo !== 'todos') { query += ' AND r.tipo = ?'; params.push(tipo); }
        if (estado && estado !== 'todos') { query += ' AND r.estado = ?'; params.push(estado); }
        if (search) { query += ' AND (r.descripcion LIKE ? OR u.nombre LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
        query += ' ORDER BY r.fecha DESC';
        const [reportes] = await db.execute(query, params);
        res.json(reportes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener reportes' });
    }
});

// Crear reporte
app.post('/api/reportes', auth, upload.single('imagen'), async (req, res) => {
    try {
        const { tipo, descripcion, latitud, longitud } = req.body;
        if (!tipo || !descripcion || !latitud || !longitud) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }
        const imagen = req.file ? `/uploads/${req.file.filename}` : null;
        const [result] = await db.execute(
            `INSERT INTO reportes (tipo, descripcion, imagen, latitud, longitud, usuario_id, estado) VALUES (?, ?, ?, ?, ?, ?, 'pendiente')`,
            [tipo, descripcion, imagen, latitud, longitud, req.userId]
        );
        res.status(201).json({ message: 'Reporte creado exitosamente', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear reporte' });
    }
});

// Actualizar estado de reporte
app.put('/api/reportes/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const [reporte] = await db.execute('SELECT * FROM reportes WHERE id = ?', [id]);
        if (reporte.length === 0) return res.status(404).json({ message: 'Reporte no encontrado' });
        await db.execute('UPDATE reportes SET estado = ? WHERE id = ?', [estado, id]);
        res.json({ message: 'Estado actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar' });
    }
});

// Eliminar reporte
app.delete('/api/reportes/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM reportes WHERE id = ?', [id]);
        res.json({ message: 'Reporte eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar' });
    }
});

// Estadísticas
app.get('/api/estadisticas', async (req, res) => {
    try {
        const [total] = await db.execute('SELECT COUNT(*) as total FROM reportes');
        const [porTipo] = await db.execute('SELECT tipo, COUNT(*) as cantidad FROM reportes GROUP BY tipo');
        const [porEstado] = await db.execute('SELECT estado, COUNT(*) as cantidad FROM reportes GROUP BY estado');
        res.json({ total: total[0].total, porTipo, porEstado });
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));