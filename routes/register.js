const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
    res.render('pages/register',{
        title: 'Register',
        site_name: 'Geral - Conservação e Limpeza',
        version: '1.0.0'
    })
});

module.exports = router