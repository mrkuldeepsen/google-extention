const users = require('./user')
const auths = require('./auth')
const articles = require('./article')

const topics = require('./topic')
const groups = require('./group')

const shares = require('./share')
const addtotopics = require('./addtotopic')

const ext = require('./ext')

module.exports = {
    users,
    auths,
    articles,
    topics,
    groups,
    shares,
    addtotopics,
    ext
}