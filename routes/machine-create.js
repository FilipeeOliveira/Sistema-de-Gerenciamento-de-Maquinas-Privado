const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Machine = require('../models/machine');

// Função para garantir a existência do diretório
const ensureDirectoryExistence = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const uploadDir = path.join(__dirname, '../public/uploads');
ensureDirectoryExistence(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()} - ${file.originalname}`);
    }
});


const upload = multer({ storage });

// Middleware para parsear application/json e application/x-www-form-urlencoded
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Rota para exibir o formulário de cadastro
router.get('/create', (req, res) => {
    res.render('pages/machine-create', {
        title: 'Cadastro de Máquinas',
        site_name: 'Geral - Conservação e Limpeza',
        year: new Date().getFullYear(),
        version: '1.0',
    });
});

// Rota para lidar com o envio do formulário de criação de máquina
router.post('/create', upload.array('images', 10), async (req, res) => {
    const { name, client, tags, status, description } = req.body;
    const images = req.files.map(file => `/uploads/${file.filename}`);

    console.log('Dados recebidos:', { name, client, images, tags, status, description });

    try {
        const machine = await Machine.create({
            name,
            client,
            images: images,
            tags: tags ? tags.split(',') : [],
            status,
            description,
        });

        res.status(201).json({ machine });
    } catch (error) {
        console.error('Erro ao criar máquina:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});


module.exports = router;
