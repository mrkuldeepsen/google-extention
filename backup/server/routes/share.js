var router = require('express').Router()
const { shares } = require('../controllers')

module.exports = app => {

    router.post('/share/:group_id', shares.create)
    router.delete('/remove-article/:group_id', shares.delete)
    router.get('/shares', shares.findAll)

    app.use('/api', router)
};