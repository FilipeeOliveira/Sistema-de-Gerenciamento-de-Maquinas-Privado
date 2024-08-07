const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const logger = require('morgan');
const path = require('path');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const authRoutes = require('./routes/auth');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const app = express();

// Middleware
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/machines/documents', express.static(path.join(__dirname, 'public/documents')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.set('views', path.join(__dirname, 'src/views'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'seu_segredo_super_secreto',
    store: new SequelizeStore({
        db: sequelize,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 } // 1 hora
}));

// Middleware para disponibilizar o usuário para todos os templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Rotas
app.use('/dashboard', require('./routes/dashboard'));
app.use('/', require('./routes/auth'));
app.use('/profile', require('./routes/profile'));
app.use('/machine', require('./routes/machine-create'));
app.use('/machines', require('./routes/machines'));
app.use('/auth-register', require('./routes/auth-register'));
app.use('/table', require('./routes/documentsTable'));
app.use('/auth-forgot-password', require('./routes/auth-forgot-password'));
app.use('/auth-reset-password', require('./routes/auth-reset-password'));

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
