const { Article, AddToTopic, Share, GroupMember, Topic } = require("../models")
const { handleError, handleResponse, getPagination, sortingData, handleSearchQuery, getPagingResults, getData, getResponse, getStorage } = require('../utils/helper')
const { createArticle, updateArticle } = require('../utils/common')
const { Op } = require("sequelize")
var fs = require('fs');
const path = require("path")

//Create article
exports.create = async (req, res) => {
    try {
        const { title, description, date, url, } = req.body

        const { error } = createArticle.validate(req.body, { abortEarly: false })

        if (error) {
            handleError(error, req, res)
            return
        }

        const fileUrl = req.file ? req.file.mimetype.split('/') : null
        const newFileURL = fileUrl ? fileUrl[0] : ""
        let file_URL = "";
        if (req.file) {
            switch (newFileURL) {
                case "image":
                    file_URL = `/media/images/${req.file.filename}`
                    break;
                case "audio":
                    file_URL = `/media/audio/${req.file.filename}`
                    break;
                case "video":
                    file_URL = `/media/videos/${req.file.filename}`
                    break;
                case "application":
                    file_URL = `/media/docs/${req.file.filename}`
                    break;

                default:
                    break;
            }
        }

        const data = {
            title: title,
            description: description,
            url: url,
            file_URL,
            file_size: req.file?.size ? req.file.size : 0,
            type: newFileURL ? newFileURL : null,
            date: date,
            status: (description === '' || url === '' || date === '' || req.file === undefined) ? 'draft' : 'publish',
            original_file_name: req.file?.originalname,
            file_name: req.file?.filename,
            user_id: req.user.id,
        }

        Article.create(data).then(data => {
            handleResponse(res, data)
        })
            .catch(err => {
                handleError(err, req, res)
            })
    } catch (error) {

    }


}

//Get all articles
exports.findAll = async (req, res) => {

    const { page, size, sort, filters = {} } = req.query
    const { limit, offset } = getPagination(page, size)

    const whereCondition = {
        [Op.or]: [
            {
                [Op.like]: [
                    { 'title': req.query.q },
                    { 'description': req.query.q }
                ]
            },
            {
                [Op.or]: [
                    { 'title': req.query.q },
                    { 'description': req.query.q }
                ]
            },
            {
                [Op.in]: [
                    { 'title': req.query.q },
                    { 'description': req.query.q }
                ]
            }
        ]
    }

    const sortResponse = sortingData(req)
    //for filter[topic]
    if (filters?.topic) {
        const awedfv = await Topic.findAll({
            where: {
                [Op.or]: [
                    {
                        id: filters.topic
                    },
                ]
            },
            attributes: ['id']
        })

        const dfgbvcdswdfb = await getNestedTopics(awedfv.map(v => v.id) || [])

        let addToTopic = await AddToTopic.findAll({
            where: {
                topic_id: {
                    [Op.in]: dfgbvcdswdfb
                }
            },
            attributes: ['article_id']
        });

        addToTopic = addToTopic?.map(v => v.article_id)

        req.query.filters["id"] = addToTopic
        req.query.filters["user_id"] = req.user.id

        // console.log(req.query.filters);

        const searchQuery = handleSearchQuery(req, ['title', 'description', 'date', 'type', 'user_id', 'status', 'file_name',]);

        return Article.findAndCountAll(
            {
                where: searchQuery,
                order: [[sortResponse.sortKey, sortResponse.sortValue]],
                limit, offset,
                include: [{
                    model: AddToTopic,
                }, {
                    model: Share,
                }]
            })
            .then(async (data) => {
                const d = await getData(data)
                handleResponse(res, getPagingResults(d, page, limit))
            })
            .catch(err => {
                handleError(err, req, res)
            })
    }
    else
        if (filters?.group) {
            //for filter[group]
            GroupMember.findOne({
                where: {
                    group_id: filters?.group,
                    member_id: req.user.id
                }
            }).then(async (data) => {
                if (!data) return res.status(403).json({ error: "No permission" })
                let shares = await Share.findAll({
                    where: {
                        // user_id: req.user.id,
                        group_id: filters.group
                    },
                    attributes: ['article_id']
                });
                shares = shares?.map(v => v.article_id)
                req.query.filters["id"] = shares

                // req.query.filters["user_id"] = req.user.id
                const searchQuery = handleSearchQuery(req, ['title', 'description', 'date', 'type', 'user_id', 'status', 'file_name',]);
                return Article.findAndCountAll(
                    {
                        where: searchQuery,
                        order: [[sortResponse.sortKey, sortResponse.sortValue]],
                        limit, offset,
                        include: [{
                            model: AddToTopic,
                        },
                        {
                            model: Share,
                        }
                        ]
                    })
                    .then(async (data) => {

                        const d = await getData(data)
                        handleResponse(res, getPagingResults(d, page, limit))
                    })
                    .catch(err => {
                        handleError(err, req, res)
                    })
            }).catch(err => {
                return handleError(err, req, res)
            })
        }
        else {

            //for filter[others type]
            filters["user_id"] = req.user.id
            req.query.filters = filters;

            const searchQuery = handleSearchQuery(req, ['title', 'description', 'date', 'type', 'user_id', 'status', 'file_name', 'id', 'url']);

            Article.findAndCountAll(
                {
                    where: searchQuery,

                    order: [[sortResponse.sortKey, sortResponse.sortValue]],
                    limit, offset,
                    include: [{
                        model: AddToTopic,
                    }, {
                        model: Share,
                    }]
                })
                .then(async (data) => {

                    const d = await getData(data)
                    handleResponse(res, getPagingResults(d, page, limit))
                })
                .catch(err => {
                    handleError(err, req, res)
                })
        }
}

// Get article by Id
exports.findOne = async (req, res) => {
    Article.findOne({ where: { id: req.params.id, user_id: req.user.id } })
        .then(data => {
            handleResponse(res, data)
        }).catch(err => {
            handleError(err, req, res)
        })
}

//Get own articles
exports.getOwnArticle = async (req, res) => {
    Article.findAll({
        where: { user_id: req.user.id },
    })
        .then(data => {
            handleResponse(res, data)
        }).catch((err) => {
            handleError(err.message, req, res)
        })
}

//Article deleted
exports.delete = async (req, res) => {

    const article = await Article.findOne({ where: { id: req.params.id, user_id: req.user.id } })

    const fileUrl = article?.file_URL.replace("/media", "/")
    const fileName = path.join(__dirname, `../upload/${fileUrl}`,)

    if (!article) {
        handleError('Invalid article Id', req, res)
    }
    else {
        try {
            fs.unlinkSync(fileName);
            console.log('File has been deleted successfully >>>>>>');
        }
        catch (error) {
            console.log('error>>>', error);
        }

        Article.destroy({
            where: { id: req.params.id }
        })
            .then(async (data) => {
                const addToTopic = await AddToTopic.update({ article_id: null }, { where: { article_id: req.params.id } })
                getResponse(res, 'Article has been Successfully deleted')
            }).catch(err => {
                handleError(err, req, res)
            })
    }
}

// Update Article
exports.update = async (req, res) => {

    const { title, description, date, url, } = req.body
    const { error } = updateArticle.validate(req.body, { abortEarly: false })
    const article = await Article.findOne({ where: { id: req.params.id, user_id: req.user.id } })

    if (error) {
        handleError(error, req, res)
        return
    }

    if (!article) {
        handleError('Invalid article Id', req, res)
    }
    else {
        let file_URL = ""

        const fileUrl = req.file?.mimetype.split('/')
        const newFileURL = fileUrl ? fileUrl[0] : ""
        if (req.file) {
            switch (newFileURL) {
                case "image":
                    file_URL = `/media/images/${req.file.filename}`
                    break;
                case "audio":
                    file_URL = `/media/audio/${req.file.filename}`
                    break;
                case "video":
                    file_URL = `/media/videos/${req.file.filename}`
                    break;
                case "application":
                    file_URL = `/media/docs/${req.file.filename}`
                    break;

                default:
                    break;
            }
        }


        const data = {
            title: title ? title : article.title,
            description: description ? description : article.description,
            url: url ? url : article.url,
            file_URL: file_URL ? file_URL : article.file_URL,
            file_size: req.file?.size ? req.file.size : article.file_size,
            type: newFileURL ? newFileURL : article.type,
            date: date ? date : article.date,
            status: (description === '' || url === '' || date === '' || req.file === undefined) ? 'draft' : 'publish',
            original_file_name: req.file?.originalname ? req.file?.originalname : article.original_file_name,
            file_name: req.file?.filename ? req.file?.filename : article.fileName,
            user_id: req.user.id,
        }

        Article.update(data, { where: { id: req.params.id, user_id: req.user.id } }).then(data => {
            if (req.file) {
                try {
                    const filePath = path.join(__dirname, `../upload/${article?.file_URL.replace("/media", "/")}`,)
                    fs.unlinkSync(filePath);
                    console.log('File has been deleted successfully >>>>>>');
                }
                catch (error) {
                    console.log('error>>>', error);
                }
            }

            getResponse(res, 'Your article has been successfully updated')
        })
            .catch(err => {
                handleError(err, req, res)
            })
    }
}


const getNestedTopics = async (topic_ids = []) => {

    const awedfv = await Topic.findAll({
        where: {
            parent_id: {
                [Op.in]: topic_ids
            },
        },
    })
    if (awedfv.length) {
        return [...topic_ids, ...(await getNestedTopics(awedfv.map(v => v.id)))]
    } else {
        return topic_ids;
    }
}