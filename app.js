const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const logger = require('morgan');
const path = require('path');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/evidence', express.static(path.join(__dirname, 'public/evidence')));
app.use('/machines/documents', express.static(path.join(__dirname, 'public/documents')));
app.use('/documents', express.static(path.join(__dirname, 'public/documents')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');

// CORS 
app.use(cors());

app.use(session({
    secret: ':33ob/%~56BR',
    store: new SequelizeStore({
        db: sequelize,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 2 }
}));

// Middleware para disponibilizar o usuário para todos os templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/');
}

// Rotas
app.use('/', authRoutes);
app.use('/auth-register', require('./routes/auth-register'));
app.use('/auth-forgot-password', require('./routes/auth-forgot-password'));

app.use(ensureAuthenticated);

app.use('/dashboard', require('./routes/dashboard'));
app.use('/profile', require('./routes/profile'));
app.use('/machine', require('./routes/machine-create'));
app.use('/machines', require('./routes/machines'));
app.use('/table', require('./routes/documentsTable'));
app.use('/mechanism', require('./routes/machineLog'));

sequelize.sync()
    .then(() => {
        console.log('Database sincronizado');
    })
    .catch((error) => {
        console.error('Erro ao sincronizar com o banco de dados:', error);
    });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor está rodando na porta ${PORT}`);
});
