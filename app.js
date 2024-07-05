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
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');

const index = require('./routes/dashboard')
const register = require('./routes/register')
const profile = require('./routes/profile')
const navigation = require('./routes/navigation')
const post = require('./routes/post')
const postCreate = require('./routes/post-create')
const authRegister = require('./routes/auth-register')
const authLogin = require('./routes/auth')
const forgotPassword = require('./routes/auth-forgot-password')
const resetPassword = require('./routes/auth-reset-password')


// Rotas
app.use('/', index)
//app.use('/', register)
//app.use('/', profile)
//app.use('/', navigation)
//app.use('/', post)
//app.use('/', postCreate)
//app.use('/', authRegister)
app.use('/auth', authLogin);
//app.use('/', forgotPassword);
//app.use('/', resetPassword);


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
