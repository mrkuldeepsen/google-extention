const nodemailer = require('nodemailer')
const { Op, } = require('sequelize')

const { Session, User, Topic, AddToTopic, Article, Group, } = require('../models');
const user = require('../models/user');

exports.handleError = (error, req, res,) => {
    // console.log('error>>>>>>>>>>>>>dddddddddd>>>>>>>>>>>>>', error)

    if (error.details) {
        const data = {};
        error?.details.forEach(v => {
            data[v.context?.key] = [v.message.replace(/"/g, '')];
        })

        return res.status(400).send({ error: data })
    }

    const obj = {
        error: {
            message: [error],
        }
    }

    if (error.errors) {
        let data
        error.errors?.forEach(e => {
            const obj = {
                error: { message: [e.message], },
            }
            return data = obj
        })
        return res.status(400).send(data)
    }

    res.status(400).send(error.error ? error.error.message : error?.original?.sqlMessage ? error?.original?.sqlMessage : error.message ? error : { ...obj },
    )
}

exports.handleResponse = (res, data, message) => {
    res.status(200).send(data)
}
exports.getResponse = (res, message) => {
    res.status(200).send({
        message: message
    })
}

//Searching and filetering queries
exports.handleSearchQuery = (req, fields,) => {
    const { filters, q } = req.query

    let splsdcit = null
    if (q)
        splsdcit = q.split(" ").map(v => {
            return {
                [Op.like]: `%${v}%`
            }
        })

    const query = []
    let queryKeys = fields.map((key) => {
        return {
            [key]: {
                [Op.or]: splsdcit
            }
        }
    })

    q && query.push({
        [Op.or]: queryKeys
    })

    for (var key in filters) {
        if (fields.includes(key) && filters[key]) {
            query.push({
                [key]: {
                    [Op.like]: `${filters[key]}`
                }
            })
        } else if (key === "id") {
            query.push({
                id: {
                    [Op.in]: filters[key]
                }
            })

        }
    }
    return query
}

exports.getPagination = (page, size) => {
    const limit = size ? +size : 10
    const offset = page ? (page - 1) * limit : 0

    return { limit, offset }
}

exports.getPagingResults = (data, page, limit) => {
    const { count: total_items, rows: items } = data
    const current_page = page ? +page : 1
    const total_pages = Math.ceil(total_items / limit)
    const per_page = limit
    return { items, pagination: { total_items, per_page, total_pages, current_page } }
}

exports.generateOTP = () => {
    var digits = '0123456789'; var otpLength = 6; var otp = ''

    for (let i = 1; i <= otpLength; i++) {
        var index = Math.floor(Math.random() * (digits.length))
        otp = otp + digits[index]
    }

    return otp
}

exports.createUUID = () => {
    var dt = new Date().getTime()
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0
        dt = Math.floor(dt / 16)
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })

    return uuid
}

exports.sortingData = (req) => {
    const { sort } = req.query

    const sortKey = sort ? sort.replace('-', '') : 'created_at'
    const sortValue = sort ? sort.includes('-') ? 'DESC' : 'ASC' : 'DESC'

    return { sortKey, sortValue }
}

exports.sendMailer = async (email, name, subject, message, res) => {

    const transporter = nodemailer.createTransport({
        host: `${process.env.EMAIL_HOST}`,
        port: `${process.env.EMAIL_PORT}`,
        auth: {
            user: `${process.env.EMAIL_USER}`,
            pass: `${process.env.EMAIL_PASSWORD}`
        },
        // secure: false
    })

    const data = {
        from: `${process.env.EMAIL_FROM}`,
        to: `${email}`,
        subject: `${subject} - Your Archive`,
        html: `${message}`,
    }

    transporter.sendMail(data, (error, info) => {
        if (error) {
            // console.log('error>>>>>>', error);
            res.status(error.responseCode).send(error)
        }
    })

    return
}

exports.getData = async (obj) => {
    if (obj.count === 0) {
        return obj
    } else {
        return new Promise((resolve, reject) => {
            let itesdvem = []
            obj.rows.forEach(async (item, i) => {
                const topic_ids = item.add_to_topics?.map(i => i.topic_id)
                const group_ids = item.shares?.map(i => i.group_id)

                let addtoTopic = Topic.findAll({
                    where: {
                        id: {
                            [Op.in]: topic_ids
                        }
                    }
                })

                let groups = Group.findAll({
                    where: {
                        id: {
                            [Op.in]: group_ids
                        }
                    }
                })
                addtoTopic = await addtoTopic
                groups = await groups
                delete item.dataValues.shares
                delete item.dataValues.add_to_topics
                item.dataValues.topics = addtoTopic
                item.dataValues.groups = groups
                itesdvem.push(item)

                if (obj.rows.length === i + 1) {
                    obj.rows = itesdvem
                    resolve(obj)
                }

            })
        })
    }
}

exports.getGroupData = async (groups) => {
    for (let i = 0; i < groups.length; i++) {
        groups[i].dataValues.group_members = await User.findAll({ where: { id: groups[i].dataValues.group_members.map(v => v.member_id) } })
    }
}

// exports.getGroupData = async (obj) => {

//     if (obj.length === 0) {
//         return obj
//     } else {
//         return new Promise(async (resolve, reject) => {
//             const x = []
//             await obj.forEach(async (item, i) => {
//                 await item.group_members.forEach(async (ids) => {
//                     try {
//                         const d = await User.findAll({ where: { id: ids.member_id } })
//                         x.push({
//                             id: item.id,
//                             name: item.name,
//                             short_description: item.short_description,
//                             description: item.description,
//                             created_at: item.created_at,
//                             updated_at: item.updated_at,
//                             admin_id: item.admin_id,
//                             group_members: d
//                         })
//                     } catch (error) {
//                         console.log(error);
//                     }

//                 })
//                 console.log(x);
//                 // if (obj.length === i + 1) {
//                 //     console.log(obj);
//                 // }
//             })
//             // obj = x
//             console.log(x);
//             resolve(obj)

//         })
//     }

// }
// exports.getGroupMembers = async (obj) => {
//     const memberId = []
//     obj.map((val) => {
//         val.map((item) => {
//             memberId.push(item.member_id)
//         })
//     })
//     const users = await User.findAll({ where: { id: { [Op.in]: memberId } } })
//     return users
// }

exports.getGroupArticle = async (params) => {
    const article_ids = []
    const d = []
    params.rows.forEach(async (item) => {
        d.push({
            id: item.id,
            created_at: item.created_at,
            updated_at: item.updated_at,
            group_id: item.group_id,
            article_id: item.article_id,
            user_id: item.user_id
        })

        article_ids.push(item.article_id)
    })

    const article = await Article.findAll({ where: { id: article_ids } })

    d.push(article)

    return params.rows = d
}

exports.getStorage = (data) => {
    const size = []
    data.map((item) => {
        size.push(item.file_size)
    })
    const storage = size.reduce((item, i) => item + i, 0);
    return storage
}

exports.getGroupMembers = async (memberIDs) => {
    try {
        const users = await User.findAll({
            where: {
                id: {
                    [Op.in]: memberIDs
                }

            },
        })
        return { data: users, error: null }
    } catch (error) {
        return { data: null, error: error }
    }
}