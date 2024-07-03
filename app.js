const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const logger = require('morgan');
const path = require('path');

const app = express();

// Middleware
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');

const index = require('./routes/dashboard')
const register = require('./routes/register')

// Rotas
//app.use('/', index)
app.use('/', register)
// app.use('/auth', authRoutes);
sequelize.sync()
    .then(() => {
        console.log('Database sincronizado');
    })
    .catch((error) => {
        console.error('Erro ao sincronizar com o banco de dados:', error);
    });

app.listen(3000, () => {
    console.log('Servidor está rodando na porta 3000');
});
