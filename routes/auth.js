const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Verifique o caminho do modelo User

router.get('/auth-login', (req, res) => {
    res.render('pages/auth-login', {
        error: null,
        title: 'Auth Login',
        site_name: 'Geral - Conservação e Limpeza',
        version: '1.0',
        year: new Date().getFullYear()
    });
});

router.post('/auth-login', async (req, res) => {
    console.log('POST /auth/auth-login');
    const { email, password } = req.body;

    try {
        console.log('Recebendo requisição POST em /auth-login');
        console.log('Dados recebidos:', { email, password });

        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('Usuário não encontrado');
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            console.log('Senha inválida');
            return res.status(401).json({ error: 'Senha Inválida' });
        }

        console.log('Login bem-sucedido para o usuário:', user.email);
        res.status(200).json({ message: 'Login bem-sucedido' });
    } catch (error) {
        console.error('Erro durante o Login:', error);
        res.status(500).json({ error: 'Erro interno do Servidor' });
    }
});

router.get('/auth-forgot-password', (req, res) => {
    res.render('pages/auth-forgot-password', {
        title: 'Forgot Password',
        site_name: 'Geral - Conservação e Limpeza',
        version: '1.0',
        year: new Date().getFullYear()
    });
});

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcrypt');
// const User = require('../models/User'); // Verifique o caminho do modelo User

// router.get('/auth-login', (req, res) => {
//     res.render('pages/auth-login', {
//         error: null,
//         title: 'Auth Login',
//         site_name: 'Geral - Conservação e Limpeza',
//         version: '1.0',
//         year: new Date().getFullYear()
//     });
// });

// router.post('/auth-login', async (req, res) => {
//     console.log('POST /auth/auth-login');
//     const { email, password } = req.body;

//     try {
//         console.log('Recebendo requisição POST em /auth-login');
//         console.log('Dados recebidos:', { email, password });

//         const user = await User.findOne({ where: { email } });

//         if (user) {
//             console.log('Usuário não encontrado');
//             return res.render('pages/auth-login', {
//                 error: 'Usuário não encontrado',
//                 title: 'Auth Login',
//                 site_name: 'Geral - Conservação e Limpeza',
//                 version: '1.0',
//                 year: new Date().getFullYear()
//             });
//         }

//         const match = await bcrypt.compare(password, user.password);

//         if (!match) {
//             console.log('Senha inválida');
//             return res.render('pages/auth-login', {
//                 error: 'Senha Inválida',
//                 title: 'Auth Login',
//                 site_name: 'Geral - Conservação e Limpeza',
//                 version: '1.0',
//                 year: new Date().getFullYear()
//             });
//         }

//         console.log('Login bem-sucedido para o usuário:', user.email);
//         res.redirect('/'); // Redirecionamento após login bem-sucedido
//     } catch (error) {
//         console.error('Erro durante o Login:', error);
//         res.status(500).send('Erro interno do Servidor');
//     }
// });



// router.get('/auth-forgot-password', (req, res) => {
//     res.render('pages/auth-forgot-password', {
//         title: 'Forgot Password',
//         site_name: 'Geral - Conservação e Limpeza',
//         version: '1.0',
//         year: new Date().getFullYear()
//     });
// });
// // router.post('/auth-forgot-password', async (req, res) => {
// //     const { email } = req.body;

// //     try {
// //         const user = await User.findOne({ where: { email } });

// //         if (!user) {
// //             console.log('Usuário não encontrado');
// //             return res.render('pages/auth-forgot-password', {
// //                 error: 'Usuário não encontrado',
// //                 title: 'Forgot Password',
// //                 site_name: 'Geral - Conservação e Limpeza',
// //                 version: '1.0',
// //                 year: new Date().getFullYear()
// //             });
// //         }

// //         // Lógica para enviar email de redefinição de senha
// //         console.log('Email de redefinição de senha enviado para:', user.email);
// //         res.render('pages/auth-forgot-password', {
// //             success: 'Email de redefinição de senha enviado',
// //             title: 'Forgot Password',
// //             site_name: 'Geral - Conservação e Limpeza',
// //             version: '1.0',
// //             year: new Date().getFullYear()
// //         });
// //     } catch (error) {
// //         console.error('Erro durante a solicitação de redefinição de senha:', error);
// //         res.status(500).send('Erro interno do Servidor');
// //     }
// // });

// module.exports = router;
