// index.js

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Rota para servir o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/pages/index.html'));
});

// Inicia o servidor Express
app.listen(port, () => {
    console.log(`Servidor Express está rodando em http://localhost:${port}`);
});
