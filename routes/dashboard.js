const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/machineController');

// Rota para a dashboard
router.get('/view', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = startDate && endDate ? { startDate, endDate } : null;
        const stats = await dashboardController.getDashboardStats(filter);
        res.render('pages/dashboard', {
            title: 'Dashboard',
            site_name: 'Geral - Conservação e Limpeza',
            version: '1.0',
            year: new Date().getFullYear(),
            stats: stats
        });
    } catch (err) {
        console.error('Erro ao carregar a dashboard:', err);
        res.status(500).send('Erro ao carregar a dashboard');
    }
});

module.exports = router;