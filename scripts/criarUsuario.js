const db = require('../models/index');

async function criarUsuario() {
    try {
        const novoUsuario = await db.User.create({
            email: 'novoemail@example.com',
            password: 'senha123',
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