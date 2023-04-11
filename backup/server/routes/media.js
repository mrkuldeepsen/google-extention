var router = require('express').Router()
const path = require("path")



module.exports = app => {

    router.get('/media/:type/:name', (req, res) => {
        const { type, name } = req.params
        res.sendFile(path.join(__dirname, `../upload/${type}/${name}`,))
    })


    app.use('/api', router)
};