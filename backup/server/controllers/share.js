const { Share, Article, Group } = require("../models");
const { shareArticleInGroup } = require("../utils/common");
const { handleSearchQuery, handleResponse, handleError, getPagination, sortingData, getPagingResults, getGroupArticle, getResponse } = require("../utils/helper");

// 
exports.create = async (req, res) => {

    const { error } = shareArticleInGroup.validate(req.body,)
    if (error) {
        handleError(error, req, res)
        return
    }

    const article = await Article.findAll({ where: { id: req.body.article_id } })

    if (article.length === 0) {
        handleError('Invalid article id', req, res)
    } else {
        const { article_id } = req.body
        const memberIDs = []
        const memId = []

        memId.push({ user_id: req.user.id })
        memId.push(article_id)

        article_id.map((item) => {

            memberIDs.push({
                group_id: req.params.group_id,
                user_id: req.user.id,
                article_id: item,
            })
        })

        await Share.bulkCreate(memberIDs)
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
    const searchQuery = handleSearchQuery(req, ['article_id', 'user_id', 'group_id'], type)

    Share.findAndCountAll({
        where: searchQuery,
        order: [[sortResponse.sortKey, sortResponse.sortValue]],
        limit, offset,

    }).then(async (data) => {

        const d = await getGroupArticle(data)

        handleResponse(res, getPagingResults(data, page, limit))
    })
        .catch((err) => {
            handleError(err, req, res)
        })
}


exports.delete = async (req, res) => {

    const group = await Group.findOne({ where: { id: req.params.group_id } })
    if (group === null) {
        handleError('Invalid group ID', req, res)
    }
    else {

        Share.destroy({
            where: { group_id: req.params.group_id, user_id: req.user.id, article_id: req.body.article_id }
        })
            .then(async (data) => {
                // const addToTopic = await AddToTopic.update({ article_id: null }, { where: { article_id: req.params.id } })
                getResponse(res, 'Article has been Successfully removed in the group')
            }).catch(err => {
                handleError(err, req, res)
            })
    }
}