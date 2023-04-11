var router = require('express').Router()
const { shares, addtotopics } = require('../controllers')
module.exports = app => {

    router.post('/add-to-topic/:article_id', addtotopics.create)
    router.get('/getTopics', addtotopics.findAll)

    router.delete('/remove-to-topic/:article_id', addtotopics.removeTopic)

    app.use('/api', router)
};