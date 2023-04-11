const Joi = require('joi')

// User registration
const createUser = Joi.object().keys({
    first_name: Joi.string().min(2).max(64),
    last_name: Joi.string().min(2).max(64),

    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(32).required(),

    mobile: Joi.string().min(10).max(13),

    status: Joi.string(),
    token: Joi.string(),
})

// User account verification
const emailVerify = Joi.object().keys({
    token: Joi.string().required()
})

//login 
const login = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(32).required(),
})

// resetn password-email
const resetEmail = Joi.object().keys({
    email: Joi.string().email().required(),
})

//forgot pass
const updatePassword = Joi.object().keys({
    token: Joi.string().required(),
    new_password: Joi.string().min(8).max(32).required(),
    confirm_password: Joi.string().min(8).max(32).required(),
})

//Update user profile
const updateUserProfile = Joi.object().keys({
    first_name: Joi.string().min(2).max(64).required(),
    last_name: Joi.string().min(2).max(64).required(),
    mobile: Joi.string().min(10).max(13),
    user_name: Joi.string().min(4).max(64),
    address: Joi.string().min(2).max(1224),
    state: Joi.string().min(2).max(64),
    city: Joi.string().min(2).max(64),
    country: Joi.string().min(2).max(4),
    pin_code: Joi.string().min(1).max(12),

})
// resend email
const resendEmail = Joi.object().keys({
    email: Joi.string().email().required(),
})

//Create Article
const createArticle = Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    file_name: Joi.string().empty(''),
    url: Joi.string().empty(""),
    file: Joi.string().empty(''),
    type: Joi.string().empty(''),
    file_URL: Joi.string().empty(''),

    date: Joi.string().empty(''),

    user_id: Joi.string(),

    topic_id: Joi.string(),

    group_id: Joi.string(),
})

//Update Article
const updateArticle = Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    file_name: Joi.string().empty(''),
    url: Joi.string().empty(''),

    type: Joi.string().empty(''),
    file_URL: Joi.string().empty(''),
    file: Joi.string().empty(''),

    date: Joi.string().empty(''),

    user_id: Joi.string(),

    topic_id: Joi.string(),

    group_id: Joi.string(),
})

//Create Topics
const createTopic = Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().empty(''),
    parent_id: Joi.string().empty(''),
})

// Update topic
const updateTopic = Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().empty(''),
    parent_id: Joi.string().empty(''),
})

// Create Group
const createGroup = Joi.object().keys({
    name: Joi.string().required(),
    short_description: Joi.string().empty(''),
    description: Joi.string().empty(''),
    member_IDs: Joi.array()
})

const updateGroup = Joi.object().keys({
    name: Joi.string().required(),
    short_description: Joi.string().empty(''),
    description: Joi.string().empty(''),
})

// Add to member in group
const addMembersInGroup = Joi.object().keys({
    member_IDs: Joi.array()
})


//Share articles in the group
const shareArticleInGroup = Joi.object().keys({
    article_id: Joi.array()
})



module.exports = {
    createUser,
    updateUserProfile,

    emailVerify,
    resendEmail,

    login,
    resetEmail,
    updatePassword,

    createArticle,
    updateArticle,

    createTopic,
    updateTopic,

    //Group
    createGroup,
    updateGroup,
    addMembersInGroup,
    // Share article in the group
    shareArticleInGroup,
}