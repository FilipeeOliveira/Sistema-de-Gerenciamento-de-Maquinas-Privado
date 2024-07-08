const express = require('express');
const router = express.Router();
const Machine = require('../models/machine');

// Rota para exibir o formulário de cadastro
router.get('/create', (req, res) => {
    res.render('pages/features-post-create', {
        title: 'Cadastro de Máquinas',
        site_name: 'Geral - Conservação e Limpeza',
        year: new Date().getFullYear(),
        version: '1.0',
    });
});

// Rota para lidar com o envio do formulário
router.post('/create', async (req, res) => {
    const { name, client, images, tags, status, description } = req.body;

    try {
        const machine = await Machine.create({
            name,
            client,
            images: images ? images.split(',') : [],
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
