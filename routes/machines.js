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

router.get('/views', async (req, res) => {
    try {
        const search = req.query.search || '';
        const status = req.query.status || '';
        const currentPage = parseInt(req.query.page) || 1;
        const pageSize = 10;
        const offset = (currentPage - 1) * pageSize;

        const { machines, count } = await machineController.searchAndFilterMachines(search, status, pageSize, offset);

        const totalPages = Math.ceil(count / pageSize);

        const counts = await machineController.getDashboardStats();

        res.render('pages/machines', {
            title: 'Máquinas',
            site_name: 'Geral - Conservação e Limpeza',
            version: '1.0',
            year: new Date().getFullYear(),
            machines: machines,
            currentPage: currentPage,
            totalPages: totalPages,
            counts: counts,
            search: search,
            filterStatus: status
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

        if (status === 'Em chamado') {
            try {
                const documentBuffer = await machineController.generateDocument(machine);
                if (!res.headersSent) {
                    res.setHeader('Content-Disposition', `attachment; filename=${machine.name}-detalhes.docx`);
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                    res.end(documentBuffer);
                }
            } catch (docError) {
                console.error('Erro ao gerar o documento:', docError);
                if (!res.headersSent) {
                    res.status(500).json({ message: 'Erro ao gerar documento', error: docError.message });
                }
            }
        } else {
            if (!res.headersSent) {
                res.json({ message: 'Máquina atualizada com sucesso', machine });
            }
        }
    } catch (error) {
        console.error('Erro ao atualizar a máquina:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Erro ao atualizar a máquina', error: error.message });
        }
    }
});





module.exports = router;
