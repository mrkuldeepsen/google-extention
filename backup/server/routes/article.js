var router = require('express').Router()
const { articles } = require('../controllers/index');
const { fileUploader } = require('../middlewares/middleware');
const { Article } = require('../models');



module.exports = app => {

    router.post('/article', fileUploader, articles.create)

    router.get('/article/:id', articles.findOne)

    router.get('/articles', articles.findAll)

    router.get('/account/articles', articles.getOwnArticle)

    router.patch('/article/:id', fileUploader, articles.update)

    router.delete('/article/:id', articles.delete)

    app.use('/api', router)
};