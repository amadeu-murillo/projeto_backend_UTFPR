const express = require('express');
const Post = require('../models/post');
const { authMiddleware, adminMiddleware } = require('../controllers/userController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Operações relacionadas a posts
 */

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Cria um novo post
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - conteudo
 *             properties:
 *               titulo:
 *                 type: string
 *               conteudo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro no servidor
 */
router.post('/', authMiddleware, async (req, res) => {
    const { titulo, conteudo } = req.body;

    try {
        if (!titulo || !conteudo) {
            return res.status(400).json({ mensagem: 'Título e conteúdo são obrigatórios.' });
        }

        const novoPost = new Post({
            titulo,
            conteudo,
            autor: req.user.usuarioId
        });

        await novoPost.save();
        res.status(201).json({ mensagem: 'Post criado com sucesso.', post: novoPost });
    } catch (err) {
        res.status(500).json({ mensagem: 'Erro ao criar post.', erro: err.message });
    }
});

// Listar posts com paginação
/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Lista todos os posts com paginação
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           enum: [5, 10, 30]
 *         description: Número de posts a serem retornados
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *         description: Número da página
 *     responses:
 *       200:
 *         description: Lista de posts
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro no servidor
 */
router.get('/', async (req, res) => {
    const { limite = 5, pagina = 1 } = req.query;
    const limitesPermitidos = [5, 10, 30];
    const limiteNum = parseInt(limite);
    const paginaNum = parseInt(pagina);

    if (!limitesPermitidos.includes(limiteNum)) {
        return res.status(400).json({ mensagem: `Limite deve ser um dos seguintes valores: ${limitesPermitidos.join(', ')}` });
    }

    try {
        const posts = await Post.find()
            .populate('autor', 'nome email')
            .limit(limiteNum)
            .skip((paginaNum - 1) * limiteNum)
            .sort({ createdAt: -1 });

        res.json({ posts, pagina: paginaNum, limite: limiteNum });
    } catch (err) {
        res.status(500).json({ mensagem: 'Erro ao listar posts.', erro: err.message });
    }
});

// Atualizar um post
/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Atualiza um post existente
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do post a ser atualizado
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               conteudo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Permissão negada
 *       404:
 *         description: Post não encontrado
 *       500:
 *         description: Erro no servidor
 */
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ mensagem: 'Post não encontrado.' });

        // Verificar se o usuário é o autor ou admin
        if (post.autor.toString() !== req.user.usuarioId && !req.user.isAdmin) {
            return res.status(403).json({ mensagem: 'Permissão negada.' });
        }

        const postAtualizado = await Post.findByIdAndUpdate(id, updates, { new: true });
        res.json({ mensagem: 'Post atualizado com sucesso.', post: postAtualizado });
    } catch (err) {
        res.status(500).json({ mensagem: 'Erro ao atualizar post.', erro: err.message });
    }
});

// Deletar um post
/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Deleta um post existente
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do post a ser deletado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deletado com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Permissão negada
 *       404:
 *         description: Post não encontrado
 *       500:
 *         description: Erro no servidor
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ mensagem: 'Post não encontrado.' });

        // Verificar se o usuário é o autor ou admin
        if (post.autor.toString() !== req.user.usuarioId && !req.user.isAdmin) {
            return res.status(403).json({ mensagem: 'Permissão negada.' });
        }

        await Post.findByIdAndDelete(id);
        res.json({ mensagem: 'Post deletado com sucesso.' });
    } catch (err) {
        res.status(500).json({ mensagem: 'Erro ao deletar post.', erro: err.message });
    }
});

module.exports = router;
