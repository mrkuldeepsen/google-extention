const { groups } = require('../controllers');

var router = require('express').Router()

module.exports = app => {

    router.post('/create-group', groups.create)

    router.get('/groups', groups.findAll)

    router.get('/group/:id', groups.findOne)

    router.patch('/update-group/:id', groups.update)

    //add group member
    router.post('/add-member/:group_id', groups.addGroupMember)
    //Remove member
    router.delete('/remove-member/:group_id/:member_id', groups.removeGroupMember)


    //Delete 
    router.delete('/remove-group/:group_id', groups.removeGroup)
    app.use('/api', router)
}