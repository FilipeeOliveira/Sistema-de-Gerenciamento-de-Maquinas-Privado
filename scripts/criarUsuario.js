const bcrypt = require('bcrypt');
const db = require('../models/index');

async function criarUsuario() {
    const senhaPlana = 'senha123';
    const saltRounds = 10;

    try {
        const hashedPassword = await bcrypt.hash(senhaPlana, saltRounds);

        const novoUsuario = await db.User.create({
            email: 'test1@gmail.com',
            password: hashedPassword,
        });

        console.log('Novo usuário criado:');
        console.log(novoUsuario.toJSON());

    } catch (error) {
        console.error('Erro ao criar usuário:', error);
    } finally {
        await db.sequelize.close();
    }
}

criarUsuario();
