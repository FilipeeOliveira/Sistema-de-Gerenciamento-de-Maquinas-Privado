const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('../config/database');
const authRoutes = require('../routes/auth');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/auth', authRoutes);

sequelize.sync()
    .then(() => {
        console.log('Database sincronizado');
    })
    .catch((error) => {
        console.error('Error ao sincronizar com o database:', error);
    });

app.listen(3000, () => {
    console.log('Server esta rodando na porta 3000');
});
