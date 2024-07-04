const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {

    res.render('pages/index', {
        title: 'Dashboard',
        site_name: 'Meu Site',
        year: new Date().getFullYear(),
        version: '1.0'
    });
});

module.exports = router;
