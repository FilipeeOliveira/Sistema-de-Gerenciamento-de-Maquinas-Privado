const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
    res.render('pages/features-profile',{
        title: 'Profile',
        site_name: 'Geral - Conservação e Limpeza',
        version: '1.0',
        year: new Date().getFullYear()
    })
});

module.exports = router