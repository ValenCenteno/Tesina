const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend (opcional)
app.use(express.static(path.join(__dirname, '../frontend')));

// Importar rutas
const reportsRoutes = require('./routes/reports');

// Usar rutas
app.use('/api/reports', reportsRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📱 Frontend disponible en http://localhost:${PORT}/html/index.html`);
});