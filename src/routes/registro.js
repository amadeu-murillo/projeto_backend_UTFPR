const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { authMiddleware, adminMiddleware } = require('../controllers/userController');
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Registro
 *   description: Operações relacionadas ao registro de usuários
 */

/**
 * @swagger
 * /registrar/cadastrar:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Registro]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Dados inválidos ou e-mail já está em uso
 *       500:
 *         description: Erro no servidor
 */

// Cadastro comum
router.post('/cadastrar', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
        }

        const usuarioExistente = await User.findOne({ email: email });
        if (usuarioExistente) {
            return res.status(400).json({ mensagem: 'Email já está em uso.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        const novoUsuario = new User({
            nome,
            email,
            senha: hashedPassword
        });

        await novoUsuario.save();
        res.status(201).json({ mensagem: 'Usuário criado com sucesso.' });
    } catch (err) {
        res.status(500).json({ mensagem: 'Erro no servidor.', erro: err.message });
    }
});
/**
 * @swagger
 * /registrar/admins:
 *   post:
 *     summary: Cria um novo administrador
 *     tags: [Registro]
 *     security:
 *       - BearerAuth: []
 *     description: Apenas usuários autenticados com privilégios de administrador podem acessar esta rota.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Administrador criado com sucesso
 *       400:
 *         description: Limite de administradores atingido ou e-mail já está em uso
 *       403:
 *         description: Permissão negada. Apenas administradores podem criar novos administradores.
 *       500:
 *         description: Erro no servidor
 */


// Criar adm
router.post('/admins', authMiddleware, adminMiddleware, async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
        }

        const usuarioExistente = await User.findOne({ email: email });
        if (usuarioExistente) {
            return res.status(400).json({ mensagem: 'Email já está em uso.' });
        }

        const adminCount = await User.countDocuments({ isAdmin: true });
        if (adminCount >= 5) {
            return res.status(400).json({ mensagem: 'O limite de 5 administradores foi atingido.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        const novoAdmin = new User({
            nome,
            email,
            senha: hashedPassword,
            isAdmin: true
        });

        await novoAdmin.save();
        res.status(201).json({ mensagem: 'Administrador criado com sucesso.' });
    } catch (err) {
        res.status(500).json({ mensagem: 'Erro no servidor.', erro: err.message });
    }
});

/**
 * @swagger
 * /registrar/users/{id}:
 *   put:
 *     summary: Atualiza um usuário existente
 *     tags: [Registro]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário a ser atualizado
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 format: password
 *               isAdmin:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos ou limite de administradores atingido
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro no servidor
 */
// Atualizar
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        //  usuário existe
        const userToUpdate = await User.findById(id);
        if (!userToUpdate) {
            return res.status(404).send('Usuário não encontrado.');
        }

        // coloquei limite de cinco adm
        if (updates.isAdmin && !userToUpdate.isAdmin) {
            const adminCount = await User.countDocuments({ isAdmin: true });
            if (adminCount >= 5) {
                return res.status(400).json({ mensagem: 'O limite de 5 administradores foi atingido.' });
            }
        }

        // altera senha
        if (updates.senha) {
            const salt = await bcrypt.genSalt(10);
            updates.senha = await bcrypt.hash(updates.senha, salt);
        }

        // Atualizar os dados do usuário
        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
        
        res.send('Dados atualizados com sucesso.',updatedUser);
    } catch (err) {
        res.status(500).send('Erro ao tentar atualizar os dados do usuário.');
    }
});

/**
 * @swagger
 * /registrar/users/{id}:
 *   delete:
 *     summary: Deleta um usuário existente
 *     tags: [Registro]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário a ser deletado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *       403:
 *         description: Administradores não podem excluir outros administradores
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro no servidor
 */
// Deletar 
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const userToDelete = await User.findById(id);

        if (!userToDelete) {
            return res.status(404).send('Usuário não encontrado.');
        }

        if (userToDelete.isAdmin) {
            return res.status(403).send('Administradores não podem excluir outros administradores.');
        }

        await User.findByIdAndDelete(id);
        res.send('Usuário excluído com sucesso.');
    } catch (err) {
        res.status(500).send('Erro no servidor ao tentar excluir o usuário.');
    }
});

module.exports = router;



