const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');


/**
 * @swagger
 * tags:
 *   name: Login
 *   description: Operações relacionadas ao login de usuários
 */

/**
 * @swagger
 * /login/logar:
 *   post:
 *     summary: Autentica um usuário
 *     tags: [Login]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Autenticado com sucesso
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro no servidor
 */

router.post('/logar', async (req, res) => {
    const { email, senha } = req.body;

    try {
        if (!email || !senha) {
            return res.status(400).json({ logged: false, mensagem: 'Email e senha são obrigatórios.' });
        }

        const usuario = await User.findOne({ email: email });
        if (!usuario) {
            return res.status(403).json({ logged: false, mensagem: 'Usuário ou senha inválidos!' });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(403).json({ logged: false, mensagem: 'Usuário ou senha inválidos!' });
        }

        const token = jwt.sign(
            { usuarioId: usuario._id, isAdmin: usuario.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ logged: true, token: token });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ logged: false, mensagem: 'Erro no servidor', error: error.message });
    }
});

module.exports = router;





