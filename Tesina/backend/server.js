const express = require('express');
const cors = require('cors');
const path = require('path');
const reportsRoutes = require('./routes/reports');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

// Rutas
app.use('/api/reports', reportsRoutes);
app.use('/api/auth', authRoutes);

// Ruta principal para servir el frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/index.html'));
});

app.get('/html/:page', (req, res) => {
    res.sendFile(path.join(__dirname, `../frontend/html/${req.params.page}`));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});