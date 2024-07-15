const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const logger = require('morgan');
const path = require('path');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const app = express();

// Middleware
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.set('views', path.join(__dirname, 'src/views'));
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


const index = require('./routes/dashboard')
const register = require('./routes/register')
const profile = require('./routes/profile')
const navigation = require('./routes/navigation')
const machines = require('./routes/machines')
const machineCreate = require('./routes/machine-create')
const authRegister = require('./routes/auth-register')
const authLogin = require('./routes/auth')
const forgotPassword = require('./routes/auth-forgot-password')
const resetPassword = require('./routes/auth-reset-password')

// Rotas
app.use('/', index);
app.use('/auth', authLogin);
app.use('/profile', profile);
app.use('/machine', machineCreate)
//app.use('/', register);
//app.use('/', navigation);
app.use('/machines', machines); //machines views
//app.use('/', authRegister);


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
