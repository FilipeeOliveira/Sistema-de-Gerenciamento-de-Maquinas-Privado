const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models/User');

router.get('/auth-login', (req, res) => {
    res.render('auth-login', { error: null });
});

router.post('/auth-login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Recebendo requisição POST em /auth-login');
        console.log('Dados recebidos:', { email, password });

        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('Usuário não encontrado');
            return res.render('auth-login', { error: 'Usuario não encontrado' });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            console.log('Senha inválida');
            return res.render('auth-login', { error: 'Senha Invalida' });
        }

        console.log('Login bem-sucedido para o usuário:', user.email);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error durante o Login:', error);
        res.status(500).send('Error interno do Servidor');
    }
});

module.exports = router;
