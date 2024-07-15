const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');

router.get('/views', async (req, res) => {
    try {
        const machines = await machineController.listMachines();
        const pageSize = 10; // Tamanho da página
        const currentPage = req.query.page || 1; // Página atual, pode ser passada via query string

        // Calcular índices das máquinas na página atual
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const machinesOnPage = machines.slice(startIndex, endIndex);

        // Calcular informações de paginação
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

module.exports = router;
