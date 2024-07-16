const express = require('express');
const router = express.Router();

router.get('/view', async (req, res) => {
    res.render('pages/dashboard', {
        title: 'Dashboard',
        site_name: 'Geral',
        year: new Date().getFullYear(),
        version: '1.0'
    });
});

module.exports = router;
