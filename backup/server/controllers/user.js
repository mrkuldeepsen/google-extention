const md5 = require('md5')

const { User } = require('../models/index')
const { createUser, updateUserProfile } = require('../utils/common')
const { handleError, handleSearchQuery, getPagination, getPagingResults, handleResponse, sortingData, createUUID, sendMailer, getResponse } = require('../utils/helper')
const message = require('../utils/message')

// User registration
exports.create = async (req, res) => {

    const { first_name, last_name, email, password, mobile } = req.body
    const { error } = createUser.validate(req.body, { abortEarly: false })

    if (error) {
        handleError(error, req, res)
        return
    }

    const data = {
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: md5(password),
        mobile: mobile,
        status: 'pending',
        token: createUUID()
    }


    User.create(data)
        .then(data => {
            const link = `${process.env.BACKEND_URL}/email-verify?token=${data.token}`;
            const subject = "Your email verification link";
            const message = `<div style="margin:auto; width:70%">
            <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:60%;padding:20px 0">
            <div style="border-bottom:1px solid #eee">
                <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Your Archive</a>
            </div>
            <p style="font-size:25px">Hello  ,</p>
            <p>Use the code below to recover access to your Your Archive account.</p>
            <a href=${link} style=text-decoration:none><h3 stylea="background:#e6f3ffwidth:fullmargin: 0 autopadding:10px">Confirm</h3></a></h3>
            <p style="font-size:0.9em;">Best Regards,<br />Your Archive</p>
            </div>
        </div>
        </div>`;

            sendMailer(data.email, data.first_name, subject, message);
            handleResponse(res, data,)
        })
        .catch(err => {
            handleError(err, req, res)
        })
}

// Get all users
exports.findAll = (req, res) => {

    const { page, size, sort, } = req.query
    const { limit, offset } = getPagination(page, size)

    const sortResponse = sortingData(req)

    User.findAndCountAll(
        {
            where: handleSearchQuery(req, ['first_name', 'last_name', 'email', 'id']),
            order: [[sortResponse.sortKey, sortResponse.sortValue]],
            limit, offset,
            attributes: { exclude: ['password'] },
        })
        .then(data => {
            handleResponse(res, getPagingResults(data, page, limit))
        }).catch(err => {
            handleError(err, req, res)
        })
}

exports.findOne = async (req, res) => {
    const user = await User.findOne({ where: { id: req.params.id } })
    if (!user) {
        handleError(message.InvalidId, req, res)
    }
    else {

        User.findByPk(req.params.id, {
        })
            .then(data => {
                handleResponse(res, data)
            }).catch(err => {
                handleError(err, req, res)
            })
    }
}

//Update user profile
exports.update = async (req, res) => {

    const { first_name, last_name, email, mobile, user_name, address, state, city, country, pin_code } = req.body

    const { error } = updateUserProfile.validate(req.body, { abortEarly: false })

    if (error) {
        handleError(error, req, res)
        return
    }

    const data = {
        first_name: first_name,
        last_name: last_name,
        email: email,
        mobile: mobile,
        user_name: user_name,
        address: address,
        state: state,
        city: city,
        country: country,
        pin_code: pin_code,
    }

    const user = await User.findOne({ where: { id: req.user.id } })
    if (!user) {
        handleError(message.InvalidId, req, res)
    }
    else {
        User.update(data, { where: { id: req.user.id } })
            .then(data => {
                getResponse(res, message.YourProfileSuccessfullyUpdate)
            }).catch(err => {
                handleError(err, req, res)
            })
    }
}

// delete user
exports.delete = (req, res) => {

    User.destroy({
        where: { id: req.params.id }
    }).then(data => {
        handleResponse(res, data)
    }).catch(err => {
        handleError(err, req, res)
    })
}