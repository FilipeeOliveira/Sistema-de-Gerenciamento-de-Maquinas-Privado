const express = require('express');
const router = express.Router();
const multer = require('multer');
const Machine = require('../models/machine')(sequelize);

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

router.post('/machines/create', upload.array('images', 10), async (req, res) => {
    try {
        const { name, client, tags, status, description } = req.body;
        const images = req.files.map(file => file.path);

        await Machine.create({
            name,
            client,
            tags,
            status,
            description,
            images,
        });

        res.redirect('/path/to/redirect');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
