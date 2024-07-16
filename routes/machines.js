const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');

// Rota para listar máquinas
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

// Rota para atualizar uma máquina
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name, tags, client, status, description } = req.body;

    try {
        const machine = await machineController.updateMachine(id, { name, tags, client, status, description });
        if (machine) {
            res.status(200).json({ message: 'Máquina atualizada com sucesso' });
        } else {
            res.status(404).json({ message: 'Máquina não encontrada' });
        }
    } catch (error) {
        console.error('Error updating machine:', error);
        res.status(500).json({ message: 'Erro ao atualizar a máquina', error });
    }
});

module.exports = router;
