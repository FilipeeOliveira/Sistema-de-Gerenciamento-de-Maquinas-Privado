const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');

// Rota para exibir a tabela de documentos da máquina
router.get('/:machineId', machineController.getDocumentsTable);

// Rota para download de documentos
router.get('/documents/:filename', (req, res) => {
    const file = path.join(__dirname, '../public/documents', req.params.filename);
    res.download(file); // Envia o arquivo para download
});

module.exports = router;
