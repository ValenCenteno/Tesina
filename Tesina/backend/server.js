const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'rio-tercero-municipal-secret-2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Configurar multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Middleware de autenticación
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// ==================== AUTH ====================

// Registro
app.post('/api/auth/registro', (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  
  const exists = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  if (exists) return res.status(400).json({ error: 'El email ya está registrado' });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)').run(nombre, email, hash);
  
  const token = jwt.sign({ id: result.lastInsertRowid, nombre, email, rol: 'usuario' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: result.lastInsertRowid, nombre, email, rol: 'usuario' } });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  const token = jwt.sign({ id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
});

// ==================== REPORTES ====================

// Obtener todos los reportes
app.get('/api/reportes', (req, res) => {
  const reportes = db.prepare(`
    SELECT r.*, u.nombre as usuario_nombre 
    FROM reportes r 
    LEFT JOIN usuarios u ON r.usuario_id = u.id 
    ORDER BY r.creado_en DESC
  `).all();
  res.json(reportes);
});

// Crear reporte
app.post('/api/reportes', authMiddleware, upload.single('imagen'), (req, res) => {
  const { titulo, tipo, descripcion, direccion, latitud, longitud } = req.body;
  if (!titulo || !tipo || !descripcion || !direccion) {
    return res.status(400).json({ error: 'Campos obligatorios faltantes' });
  }
  const imagen = req.file ? '/uploads/' + req.file.filename : null;
  const result = db.prepare(
    'INSERT INTO reportes (titulo, tipo, descripcion, direccion, latitud, longitud, imagen, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(titulo, tipo, descripcion, direccion, latitud || -32.1733, longitud || -64.1133, imagen, req.user.id);
  
  res.json({ id: result.lastInsertRowid, message: 'Reporte creado exitosamente' });
});

// Actualizar estado del reporte (admin)
app.patch('/api/reportes/:id/estado', authMiddleware, (req, res) => {
  if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Solo administradores' });
  const { estado } = req.body;
  db.prepare('UPDATE reportes SET estado = ? WHERE id = ?').run(estado, req.params.id);
  res.json({ message: 'Estado actualizado' });
});

// Eliminar reporte (admin)
app.delete('/api/reportes/:id', authMiddleware, (req, res) => {
  if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Solo administradores' });
  db.prepare('DELETE FROM reportes WHERE id = ?').run(req.params.id);
  res.json({ message: 'Reporte eliminado' });
});

// ==================== USUARIOS (admin) ====================

app.get('/api/usuarios', authMiddleware, (req, res) => {
  if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Solo administradores' });
  const usuarios = db.prepare('SELECT id, nombre, email, rol, creado_en FROM usuarios').all();
  res.json(usuarios);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
