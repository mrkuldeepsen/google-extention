var router = require('express').Router();
const { ext } = require('../controllers/index');
const { authJWTExt } = require('../middlewares/middleware');

module.exports = app => {
    app.use(authJWTExt)

    router.post('/login', ext.login)

    router.get('/val', ext.validate)

    router.post('/article-exists', ext.articleExists)
    router.post('/upload-audio', ext.uploadAudio)
    router.post('/save-article', ext.saveArticle)
    router.post('/video', ext.video)
    router.post('/upload', ext.upload)

    app.use('/api/ext', router);
};
