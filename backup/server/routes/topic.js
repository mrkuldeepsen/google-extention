var router = require('express').Router()
const { topics } = require('../controllers/index');



module.exports = app => {

    router.post('/topic', topics.create)

    router.get('/topics', topics.findAll)
    router.get('/topic/:id', topics.findOne)

    router.get('/account/topics', topics.getOwnTopic)

    router.patch('/topic/:id', topics.update)

    router.delete('/topic/:id', topics.delete)

    app.use('/api', router)
};