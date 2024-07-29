const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');
const multer = require('multer');
const path = require('path');

const uploadDir = path.join(__dirname, '../public/uploads');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()} - ${file.originalname}`);
    }
});
const upload = multer({ storage });

/* router.get('/views', async (req, res) => {
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
}); */

router.get('/views', async (req, res) => {
    try {
        const { status } = req.query;
        const machines = await machineController.listMachines(status);
        const pageSize = 10;
        const currentPage = parseInt(req.query.page) || 1;

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const machinesOnPage = machines.slice(startIndex, endIndex);

        const totalPages = Math.ceil(machines.length / pageSize);

        // Obter contagem de cada status
        const counts = await machineController.getDashboardStats();

        res.render('pages/machines', {
            title: 'Máquinas',
            site_name: 'Geral - Conservação e Limpeza',
            version: '1.0',
            year: new Date().getFullYear(),
            machines: machinesOnPage,
            currentPage: currentPage,
            totalPages: totalPages,
            counts: counts,
            filterStatus: status || ''
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

router.get('/:id', async (req, res) => {
    try {
        const machine = await machineController.getMachineById(req.params.id);
        res.json(machine);
    } catch (err) {
        console.error('Erro ao buscar máquina:', err);
        res.status(500).json({ message: 'Erro ao buscar máquina', error: err.message });
    }
});

router.put('/update/:id', upload.array('images', 10), async (req, res) => {
    const id = req.params.id;
    const { name, client, tags, status, description, imagesToRemove } = req.body;

    console.log('Dados do Body:', { name, client, tags, status, description });
    console.log('Arquivos recebidos:', req.files);
    console.log('Imagens a serem removidas:', imagesToRemove);

    let updatedData = {
        name,
        client,
        tags: tags ? tags.split(',') : [],
        status,
        description,
    };

    try {
        const machine = await machineController.updateMachine(id, updatedData, req.files, JSON.parse(imagesToRemove));
        res.json({ message: 'Máquina atualizada com sucesso', machine });
    } catch (error) {
        console.error('Erro ao atualizar a máquina:', error);
        res.status(500).json({ message: 'Erro ao atualizar a máquina', error: error.message });
    }
});




module.exports = router;
