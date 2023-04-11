const { AddToTopic, Topic, Article } = require("../models");
const { handleSearchQuery, handleResponse, handleError, getPagination, sortingData, getPagingResults, getResponse } = require("../utils/helper");


exports.create = async (req, res) => {
    const article = await Article.findOne({ where: { id: req.params.article_id } })
    if (article === null) {
        return handleError('invalid article Id', req, res)
    }

    const topics_ids = []

    req.body.topic_id.map((item) => {

        topics_ids.push({
            article_id: req.params.article_id,
            topic_id: item,
        })
    })

    const topic = await Topic.findAll({ where: { id: req.body.topic_id } })
    if (topic.length === 0) {
        return handleError('Invalid topic Ids', req, res)
    } else {
        await AddToTopic.bulkCreate(topics_ids)
            .then(data => {
                handleResponse(res, data)
            }).catch((err) => {
                handleError(err, req, res)
            })
    }
}

exports.findAll = async (req, res) => {
    const { page, size, sort, type } = req.query
    const { limit, offset } = getPagination(page, size)

    const sortResponse = sortingData(req)
    const sdvds = handleSearchQuery(req, ['article_id', 'topic_id', 'id'], type);


    await AddToTopic.findAndCountAll({
        where: sdvds,
        order: [[sortResponse.sortKey, sortResponse.sortValue]],
        limit, offset,
    })
        .then(data => {
            handleResponse(res, getPagingResults(data, page, limit))
        })
        .catch((err) => {
            handleError(err, req, res)
        })
}

exports.removeTopic = async (req, res) => {

    const article = await AddToTopic.findOne({ where: { article_id: req.params.article_id } })
    const topic = await AddToTopic.findOne({ where: { topic_id: req.body.topic_id } })

    if (article === null) {
        return handleError('Invalid article Id', req, res)
    }
    if (topic === null) {
        return handleError('Invalid topic Id', req, res)
    }
    else {
        await AddToTopic.destroy({
            where: { article_id: req.params.article_id, topic_id: req.body.topic_id }
        })
            .then(async (data) => {
                getResponse(res, 'Topic has been Successfully deleted')
            }).catch(err => {
                handleError(err, req, res)
            })
    }
}