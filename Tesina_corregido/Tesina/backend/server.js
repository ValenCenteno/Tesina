const express = require('express');
const cors    = require('cors');
const path    = require('path');

const reportsRoutes = require('./routes/reports');
const authRoutes    = require('./routes/auth');

const app  = express();
const PORT = 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos: imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Archivos estáticos: frontend (para abrirlo desde localhost:3000)
app.use(express.static(path.join(__dirname, '../frontend')));


app.use('/api/reports', reportsRoutes);
app.use('/api/auth',    authRoutes);

// Ruta raíz → index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/index.html'));
});


app.get('/html/:page', (req, res) => {
    res.sendFile(path.join(__dirname, `../frontend/html/${req.params.page}`));
});


app.use((req, res) => {
    res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});


app.use((err, req, res, next) => {
    console.error('Error no controlado:', err);
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});


app.listen(PORT, () => {
    console.log('');
    console.log('Servidor CiudadActiva corriendo');
    console.log(`   → http://localhost:${PORT}`);
    console.log(`   → API: http://localhost:${PORT}/api`);
    console.log('');
});