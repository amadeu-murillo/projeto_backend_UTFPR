const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ mensagem: 'Sem token de autenticação.' });

    const token = authHeader.replace('Bearer ', '');
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ mensagem: 'Token inválido.' });
    }
};

const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.usuarioId);
        if (!user) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ mensagem: 'Necessita de permissão de administrador.' });
        }

        next();
    } catch (err) {
        res.status(500).json({ mensagem: 'Erro no servidor.' });
    }
};

module.exports = { authMiddleware, adminMiddleware };



