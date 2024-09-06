const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {authMiddleware} = require('../controllers/userController')


router.get('/', authMiddleware, async (req,res)=>{
    const usuario = await User.findById(req.user.usuarioId);

    res.json({ nome: usuario.nome, acesso: usuario.acesso });
})

module.exports = router