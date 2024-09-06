const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Post = require('../models/post')
const router = express.Router();
/**
 * @swagger
 * /install/install:
 *   get:
 *     summary: Instala o banco de dados e cria um usuário administrador.
 *     tags: [Instalação]
 *     responses:
 *       200:
 *         description: Banco de dados instalado com sucesso.
 *       500:
 *         description: Erro durante a instalação.
 */

router.get('/install', async (req, res) => {
    //também da pra selecionar por id ,caso seja admin não criar outro
    //const adminExist = await User.findOne({isAdmin})
    try {
        // Limpar
        await User.deleteMany({});
        

        // Criar usuario root
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('senha123', salt);

        
        const usuarioRoot = new User({
            nome: `usuarioRoot`,
            email: `usuarioRoot@gmail.com`,
            senha: hashedPassword,
            isAdmin: true,
            acesso:0
        });
        await usuarioRoot.save()

        for(var i = 0; i<5;i++){

            const novoPost = new Post({
                titulo:"tituloAuto",
                conteudo:"dedwedewdw",
                autor:usuarioRoot._id
            });
    
            await novoPost.save();
        }
        

        

        res.json({ mensagem: 'Banco de dados instalado com sucesso.', usuarioRoot });
    } catch (err) {
        res.status(500).json({ mensagem: 'Erro durante a instalação.', erro: err.message });
    }
});

module.exports = router;
