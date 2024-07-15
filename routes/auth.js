const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.get('/auth-login', (req, res) => {
    res.render('pages/auth-login', {
        error: null,
        title: 'Auth Login',
        site_name: 'Geral - Conservação e Limpeza',
        version: '1.0',
        year: new Date().getFullYear()
    });
});
router.post('/auth-login', async (req, res) => {
    console.log('POST /auth/auth-login');
    const { email, password } = req.body;

    try {
        console.log('Recebendo requisição POST em /auth-login');
        console.log('Dados recebidos:', { email, password });

        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('Usuário não encontrado');
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            console.log('Senha inválida');
            return res.status(401).json({ error: 'Senha Inválida' });
        }

        req.session.user = {
            id: user.id,
            email: user.email,
            password: user.password
        };

        console.log('Login bem-sucedido para o usuário:', user.email);

        console.log('Email do usuário na sessão:', req.session.user.email);

        res.status(200).json({ message: 'Login bem-sucedido' });
    } catch (error) {
        console.error('Erro durante o Login:', error);
        res.status(500).json({ error: 'Erro interno do Servidor' });
    }
});


router.get('/auth-reset-password', (req, res) => {
    res.render('pages/auth-reset-password', {
        title: 'Forgot Password',
        site_name: 'Geral - Conservação e Limpeza',
        version: '1.0',
        year: new Date().getFullYear()
    });
});

module.exports = router;
