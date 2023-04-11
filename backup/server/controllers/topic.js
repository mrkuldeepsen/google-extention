const { Topic, AddToTopic } = require('../models/index')
const { handleError, handleResponse, getPagination, sortingData, handleSearchQuery, getPagingResults, getResponse } = require('../utils/helper')
const { createTopic, updateTopic } = require('../utils/common')

// Create topic

exports.create = async (req, res) => {
    const { title, description, parent_id } = req.body
    const { error } = createTopic.validate(req.body, { abortEarly: false })

    if (error) {
        handleError(error, req, res)
        return
    }

    const data = {
        title: title,
        description: description,
        user_id: req.user.id,
        parent_id: parent_id ? parent_id : null
    }
    Topic.create(data).then(data => {
        handleResponse(res, data)
    })
        .catch(err => {
            handleError(err, req, res)
        })
}

exports.findAll = async (req, res) => {
    const { page, size, sort, } = req.query
    const { limit, offset } = getPagination(page, size)

    const sortResponse = sortingData(req)

    Topic.findAndCountAll(
        {
            where: handleSearchQuery(req, ['title', 'description', 'user_id', 'parent_id']),
            order: [[sortResponse.sortKey, sortResponse.sortValue]],
            limit, offset,
        })
        .then(data => {
            handleResponse(res, getPagingResults(data, page, limit))
        }).catch(err => {
            handleError(err, req, res)
        })
}

exports.findOne = async (req, res) => {

    Topic.findOne({ where: { id: req.params.id } })
        .then(data => {
            handleResponse(res, data)
        }).catch(err => {
            handleError(err, req, res)
        })
}

exports.getOwnTopic = async (req, res) => {
    Topic.findAll({
        where: { user_id: req.user.id },
    })
        .then(data => {
            handleResponse(res, data)
        }).catch((err) => {
            handleError(err.message, req, res)
        })
}

exports.update = async (req, res) => {
    const { title, description, parent_id } = req.body
    const topic = await Topic.findOne({ where: { id: req.params.id, user_id: req.user.id } })

    const { error } = updateTopic.validate(req.body, { abortEarly: false })

    if (error) {
        handleError(error, req, res)
        return
    }

    const data = {
        title: title,
        description: description,
        parent_id: parent_id ? parent_id : topic.parent_id
    }
    if (!topic) {
        handleError('Invalid topic Id', req, res)
    }
    else {

        Topic.update(data, { where: { id: req.params.id, user_id: req.user.id } })
        const addToTopic = await AddToTopic.update({ topic_id: null }, { where: { topic_id: req.params.id } })
            .then(data => {
                getResponse(res, 'Topic has been updated')
            }).catch(err => {
                handleError(err, req, res)
            })
    }
}

exports.delete = async (req, res) => {

    const topic = await Topic.findOne({ where: { id: req.params.id, user_id: req.user.id } })

    if (topic === null) {
        handleError('Invalid topic Id', req, res)
    }
    else {
        Topic.destroy({
            where: { id: req.params.id }
        })
            .then(async (data) => {

                await Topic.update({ parent_id: null }, { where: { parent_id: req.params.id, user_id: req.user.id } })

                // await addToTopic.update({ parent_id: null }, { where: { parent_id: req.params.id, user_id: req.user.id } })

                getResponse(res, 'Topic has been Successfully deleted')


            }).catch(err => {
                handleError(err, req, res)
            })
    }
}
