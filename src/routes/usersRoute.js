const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { authMiddleware, adminMiddleware } = require('../controllers/userController');
const router = express.Router();

// Atualizar dados pessoais 
router.put('/meusDados', authMiddleware, async (req, res) => {
    const updates = req.body;
    const userId = req.user.usuarioId;

    try {
        if (updates.senha) {
            const salt = await bcrypt.genSalt(10);
            updates.senha = await bcrypt.hash(updates.senha, salt);
        }

        const usuarioAtualizado = await User.findByIdAndUpdate(userId, updates, { new: true });
        if (!usuarioAtualizado) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });

        res.json({ mensagem: 'Dados atualizados com sucesso.', usuario: usuarioAtualizado });
    } catch (err) {
        res.status(400).json({ mensagem: 'Erro ao atualizar dados.', erro: err.message });
    }
});


// Listar usuários
router.get('/', authMiddleware, async (req, res) => {
    const { limite = 5, pagina = 1 } = req.query;
    const limitesPermitidos = [5, 10, 30];
    const limiteNum = parseInt(limite);
    const paginaNum = parseInt(pagina);

    if (!limitesPermitidos.includes(limiteNum)) {
        return res.status(400).json({ mensagem: `Limite deve ser um dos seguintes valores: ${limitesPermitidos.join(', ')}` });
    }

    try {
        const usuarios = await User.find()
            .limit(limiteNum)
            .skip((paginaNum - 1) * limiteNum)
            .select('-senha'); // Exclui a senha da resposta

        res.json({ usuarios, pagina: paginaNum, limite: limiteNum });
    } catch (err) {
        res.status(500).json({ mensagem: 'Erro ao listar usuários.', erro: err.message });
    }
});

module.exports = router;
