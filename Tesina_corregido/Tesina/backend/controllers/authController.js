const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { SECRET_KEY } = require('../middleware/auth');

const register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
    if (username.length < 3) {
        return res.status(400).json({ error: 'El usuario debe tener al menos 3 caracteres' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    User.findByUsername(username, async (err, existingUser) => {
        if (err) {
            console.error('Error al buscar usuario:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (existingUser) {
            return res.status(400).json({ error: 'Ese nombre de usuario ya está en uso' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        User.create({ username, password: hashedPassword }, (err) => {
            if (err) {
                console.error('Error al crear usuario:', err);
                return res.status(500).json({ error: 'Error interno al crear el usuario' });
            }
            res.status(201).json({ message: 'Usuario creado exitosamente' });
        });
    });
};

const login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    User.findByUsername(username, async (err, user) => {
        if (err) {
            console.error('Error al buscar usuario:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            SECRET_KEY,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });
    });
};

const getMe = (req, res) => {
    User.findById(req.user.id, (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ id: user.id, username: user.username, role: user.role });
    });
};

module.exports = { register, login, getMe };