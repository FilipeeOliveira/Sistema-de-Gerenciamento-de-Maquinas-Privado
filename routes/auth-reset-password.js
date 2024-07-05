const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
    res.render('pages/auth-reset-password',{
        title: 'Auth Reset Password',
        site_name: 'Geral - Conservação e Limpeza',
        version: '1.0',
        year: new Date().getFullYear()
    })
});

module.exports = router