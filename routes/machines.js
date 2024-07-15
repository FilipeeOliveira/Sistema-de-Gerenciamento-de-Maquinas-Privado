const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');

router.get('/views', async (req, res) => {
    try {
        const machines = await machineController.listMachines();

        res.render('pages/machines', {
            title: 'Posts',
            site_name: 'Geral - Conservação e Limpeza',
            version: '1.0',
            year: new Date().getFullYear(),
            machines: machines
        });
    } catch (err) {
        console.error('Error fetching machines:', err);
        res.status(500).send('Erro ao buscar máquinas');
    }
});

module.exports = router;
