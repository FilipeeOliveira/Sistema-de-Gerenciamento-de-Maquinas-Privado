const express = require('express');
const router = express.Router();

router.get('/user', async (req, res) => {
    if (!req.session.user || !req.session.user.email) {
        if (!req.session.user || !req.session.user.email || !req.session.user.password) {
            return res.redirect('/auth-login');
        }
    }

    const userEmail = req.session.user.email;
    const userPassword = req.session.user.password;


    console.log('Email do usuário:', userEmail);

    res.render('pages/profile', {
        title: 'Profile',
        site_name: 'Geral - Conservação e Limpeza',
        version: '1.0',
        year: new Date().getFullYear(),
        userEmail: userEmail,
        userPassword: userPassword
    });
});

module.exports = router;
