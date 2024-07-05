const bcrypt = require('bcrypt');
const db = require('../models/index');

async function criarUsuario() {
    const senhaPlana = 'senha123'; // Senha em texto plano
    const saltRounds = 10;

    try {
        // Criptografar a senha antes de salvar no banco de dados
        const hashedPassword = await bcrypt.hash(senhaPlana, saltRounds);

        const novoUsuario = await db.User.create({
            email: 'novoemail@example.com',
            password: hashedPassword, // Salvar a senha criptografada no banco
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
