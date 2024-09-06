const express = require("express");
require('dotenv').config();
const mongoose = require('mongoose');
const app = express();

// Middlewares
app.use(express.json());

// Importar rotas
const rotaLogin = require('../src/routes/login');
const rotaRegistro = require('../src/routes/registro');
const rotaUser = require('../src/routes/usersRoute')
const rotaInstall = require('../src/routes/install');
const rotaDocs = require('../src/routes/docs');
const rotaPosts = require('../src/routes/postRoute');
const countUser = require('../src/routes/numeroUsers')
// Rotas
app.use('/registrar', rotaRegistro);
app.use('/perfil',rotaUser)
app.use('/login', rotaLogin);
app.use('/install', rotaInstall);
app.use('/docs', rotaDocs);
app.use('/posts', rotaPosts);
app.use('/numeroUsers',countUser)



// Iniciar o servidor e conectar ao MongoDB
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Conectado ao MongoDB e servidor rodando na porta ${PORT}...`);

    } catch (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    }
});
