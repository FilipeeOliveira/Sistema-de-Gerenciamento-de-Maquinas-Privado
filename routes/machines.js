const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');

router.get('/views', async (req, res) => {
    try {
        const machines = await machineController.listMachines();
        const pageSize = 10;
        const currentPage = parseInt(req.query.page) || 1;

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const machinesOnPage = machines.slice(startIndex, endIndex);

        const totalPages = Math.ceil(machines.length / pageSize);

        res.render('pages/machines', {
            title: 'Posts',
            site_name: 'Geral - Conservação e Limpeza',
            version: '1.0',
            year: new Date().getFullYear(),
            machines: machinesOnPage,
            currentPage: currentPage,
            totalPages: totalPages
        });
    } catch (err) {
        console.error('Error fetching machines:', err);
        res.status(500).send('Erro ao buscar máquinas');
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const machineId = req.params.id;
        await machineController.deleteMachine(machineId);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting machine:', err);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
