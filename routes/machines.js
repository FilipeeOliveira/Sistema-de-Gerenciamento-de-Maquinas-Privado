const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');
const MachineDetail = require('../models/machineDetails');

const uploadDir = path.join(__dirname, '../public/uploads');
const evidenceDir = path.join(__dirname, '../public/evidence');
const documentsDir = path.join(__dirname, '../public/documents');
const devolutionDir = path.join(__dirname, '../public/documents/devolution');
const ordersDir = path.join(__dirname, '../public/documents/orders');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let targetDir;
        if (file.fieldname === 'evidence') {
            targetDir = evidenceDir;
        } else if (file.fieldname === 'document' && req.url.includes('export-devolution')) {
            targetDir = devolutionDir;
        } else if (file.fieldname === 'document' && req.url.includes('orders')) {
            targetDir = ordersDir;
        } else if (file.fieldname === 'images') {
            targetDir = uploadDir;
        } else {
            targetDir = documentsDir;
        }
        cb(null, targetDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()} - ${file.originalname}`);
    }
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não permitido'), false);
        }
    }
});

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

//editar
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

        if (status === 'Em chamado') {
            process.nextTick(async () => {
                try {
                    const documentBuffer = await machineController.generateDocument(machine);
                    const docResponse = await fetch(`/machines/generate-document/${id}`);
                    if (docResponse.ok) {
                        const contentDisposition = docResponse.headers.get('Content-Disposition');
                        const blob = await docResponse.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = contentDisposition.split('filename=')[1];
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                    } else {
                        console.error('Erro ao gerar o documento');
                        alert('Erro ao gerar o documento');
                    }
                } catch (docError) {
                    console.error('Erro ao gerar o documento:', docError);
                    if (!res.headersSent) {
                        res.status(500).json({ message: 'Erro ao gerar documento', error: docError.message });
                    }
                }
            });
        }
    } catch (error) {
        console.error('Erro ao atualizar a máquina:', error);
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Erro ao atualizar a máquina', error: error.message });
        }
    }
});



router.get('/generate-document/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const machine = await machineController.getMachineById(id);
        if (!machine) {
            return res.status(404).json({ message: 'Máquina não encontrada' });
        }

        if (machine.status !== 'Em chamado') {
            return res.status(400).json({ message: 'O documento só pode ser gerado para máquinas "Em chamado"' });
        }

        const documentBuffer = await machineController.generateDocument(machine);
        if (documentBuffer) {
            res.setHeader('Content-Disposition', `attachment; filename=${machine.name}-detalhes.docx`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.end(documentBuffer);
        } else {
            res.status(500).json({ message: 'Erro ao gerar documento' });
        }
    } catch (error) {
        console.error('Erro ao gerar o documento:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Erro ao gerar o documento', error: error.message });
        }
    }
});

router.get('/generateDocument/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const machine = await machineController.getMachineById(id);
        if (!machine) {
            return res.status(404).json({ message: 'Máquina não encontrada' });
        }

        if (machine.status !== 'Em espera') {
            return res.status(400).json({ message: 'O documento só pode ser gerado para máquinas "Em chamado"' });
        }

        const documentBuffer = await machineController.generateOtherDocument(machine);
        if (documentBuffer) {
            res.setHeader('Content-Disposition', `attachment; filename=${machine.name}-detalhes.docx`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.end(documentBuffer);
        } else {
            res.status(500).json({ message: 'Erro ao gerar documento' });
        }
    } catch (error) {
        console.error('Erro ao gerar o documento:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Erro ao gerar o documento', error: error.message });
        }
    }
});

//rota do modal de peças
router.post('/update-details', upload.fields([
    { name: 'evidence', maxCount: 10 },
    { name: 'document', maxCount: 1 }
]), async (req, res) => {
    console.log('Arquivos recebidos:', req.files);

    try {
        const { id, description, parts, quantity, value, totalValue } = req.body;
        const files = req.files;

        const images = files['evidence'] ? files['evidence'].map(file => `/evidence/${file.filename}`) : [];
        const document = files['document'] ? `/documents/${files['document'][0].filename}` : null;

        console.log('Caminhos das imagens:', images);
        console.log('Caminho do documento:', document);

        const calculatedTotalValue = parseFloat(totalValue) || 0;
        console.log('Valor total calculado:', calculatedTotalValue);

        const ordemDeServicoPath = await machineController.generateOrderDocument(
            id, description, parts, quantity, value, calculatedTotalValue
        );

        console.log('Caminho do documento de ordem de serviço gerado:', ordemDeServicoPath);

        const updatedMachineDetail = await machineController.updateAdditionalDetails(
            id, description, parts, quantity, value, images, document, calculatedTotalValue, ordemDeServicoPath
        );

        res.status(200).json({
            message: 'Detalhes adicionais atualizados e documento gerado com sucesso.',
            machineDetail: updatedMachineDetail,
            ordemDeServicoPath: `/documents/orders/${ordemDeServicoPath}`
        });
    } catch (error) {
        console.error('Erro ao salvar os detalhes adicionais e gerar o documento:', error);
        res.status(500).json({ message: 'Erro ao salvar os detalhes adicionais e gerar o documento.', error: error.message });
    }
});

//rota de modal de documento de manutecao
router.post('/upload-maintenance-document', upload.single('document'), async (req, res) => {
    console.log('Arquivo recebido:', req.file);

    try {
        const { id } = req.body;
        const file = req.file;

        // Verifica se o arquivo foi recebido corretamente
        if (!file) {
            return res.status(400).json({ message: 'Nenhum documento foi enviado' });
        }

        const documentPath = `/documents/${file.filename}`;
        console.log('Caminho do documento:', documentPath);

        // Use a função do controller para salvar o documento de manutenção
        const newMachineDetail = await machineController.uploadMaintenanceDocument(id, documentPath);

        res.status(200).json({
            message: 'Documento de manutenção enviado com sucesso.',
            machineDetail: newMachineDetail
        });
    } catch (error) {
        console.error('Erro ao enviar documento de manutenção:', error);
        res.status(500).json({ message: 'Erro ao enviar documento de manutenção.', error: error.message });
    }
});

router.post('/export-devolution', upload.single('document'), async (req, res) => {
    console.log('Arquivo de devolução recebido:', req.file);
    console.log('ID da máquina recebido:', req.body.id);

    try {
        const { id } = req.body;
        const document = req.file ? `/documents/devolution/${req.file.filename}` : null;

        if (!id) {
            return res.status(400).json({ message: 'ID da máquina é necessário.' });
        }

        const updatedMachineDetail = await machineController.updateDevolutionDocument(id, document);

        console.log('Detalhes da máquina atualizados:', updatedMachineDetail);

        res.status(200).json({ message: 'Documento de devolução exportado com sucesso.', updatedMachineDetail });
    } catch (error) {
        console.error('Erro ao exportar documento de devolução:', error);
        res.status(500).json({ message: 'Erro ao exportar documento de devolução.', error: error.message });
    }
});

// Rota para renderizar a tabela de documentos com filtragem
router.get('/documents/:id', async (req, res) => {
    try {
        const machineId = req.params.id;
        const { startDate, endDate } = req.query;

        const whereClause = { machineId };

        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [
                    new Date(`${startDate}T00:00:00`),
                    new Date(`${endDate}T23:59:59`)
                ]
            };
        }

        const documents = await MachineDetail.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        res.render('pages/tableDocuments', {
            machineId,
            documents,
            title: 'Tabela de Documentos',
            site_name: 'Geral - Conservação e Limpeza',
            year: new Date().getFullYear(),
            version: '1.0'
        });
    } catch (err) {
        console.error('Erro ao buscar documentos:', err);
        res.status(500).send('Erro ao buscar documentos');
    }
});


module.exports = router;

