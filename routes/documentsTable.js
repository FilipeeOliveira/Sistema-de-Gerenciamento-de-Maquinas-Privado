const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');

router.get('/:machineId', machineController.getDocumentsTable);

router.get('/documents/:filename', (req, res) => {
    const file = path.join(__dirname, '../public/documents', req.params.filename);
    res.download(file);
});

module.exports = router;
