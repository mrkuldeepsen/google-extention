var router = require('express').Router();
const { auths } = require('../controllers/index');
const { authJWT } = require('../middlewares/middleware');



module.exports = app => {

    router.get('/email-verify', auths.emailVerify);
    router.post('/email-resend', auths.resend);


    router.post('/login', auths.login)

    router.get('/logout', auths.logout)

    router.post('/reset-password-email', auths.forgotPassword)
    router.post('/update-password', auths.forgotPasswordVerify)

    router.get('/me', auths.me)

    app.use('/api', router);
};