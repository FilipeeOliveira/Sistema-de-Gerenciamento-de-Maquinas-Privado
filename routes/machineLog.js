const express = require('express');
const router = express.Router();
const LogMachine = require('../models/logMachine');
const { Op } = require('sequelize');

router.get('/logs/:id', async (req, res) => {
    try {
        const machineId = req.params.id;
        const { startDate, endDate } = req.query;

        let whereClause = { machineId };

        if (startDate && endDate) {
            whereClause.changeDate = {
                [Op.between]: [
                    new Date(`${startDate}T00:00:00`),
                    new Date(`${endDate}T23:59:59`)
                ]
            };
        }

        const logs = await LogMachine.findAll({
            where: whereClause,
            order: [['changeDate', 'DESC']]
        });

        res.render('pages/machinesLog', {
            machineId,
            logs,
            title: 'Logs de Máquinas',
            site_name: 'Geral - Conservação e Limpeza',
            year: new Date().getFullYear(),
            version: '1.0'
        });
    } catch (err) {
        console.error('Erro ao buscar logs de máquinas:', err);
        res.status(500).send('Erro ao buscar logs de máquinas');
    }
});

module.exports = router;
