const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
    res.render('pages/index', { title: 'Dashboard', page: 'index.ejs' })
});

module.exports = router