const { User, Article } = require("../models")
const { sendMailer, handleResponse, handleError, createUUID, getResponse, getStorage } = require("../utils/helper")
const message = require("../utils/message")
const { emailVerify, resendEmail, resetEmail, updatePassword, login } = require('../utils/common')
var jwt = require('jsonwebtoken');
const md5 = require("md5");


exports.emailVerify = async (req, res) => {
    const { error } = emailVerify.validate(req.query,)
    if (error) {
        handleError(error, req, res)
        return
    }
    const user = await User.findOne({ where: { token: req.query.token, } })

    if (user) {
        User.update({
            token: null,
            status: 'email_verify'
        }, { where: { id: user.id } })
            .then(data => {

                const getUser = User.findOne({ where: { email: user.email } })
                    .then(user => {
                        const userSubject = 'Thank you for email verified'
                        const userMessage = `<div style="margin:auto; width:70%">
                                    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                                    <div style="margin:50px auto;width:60%;padding:20px 0">
                                        <div style="border-bottom:1px solid #eee; width: max-content">
                                        <a href="https://www.technoskd.com/" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Your Archive</a>
                                        </div>
                                        <p style="font-size:25px">Hello ${user.first_name},</p>
                                        <p>Your Email is successfully verified.</p>
                                        <h3 style="background:#e6f3ff;width:full;margin: 0 auto;padding:10px;">Thank You!</h3>
                                        <p style="font-size:0.9em;">Best Regards,<br />Your Archive</p>
                                    </div>
                                    </div>
                                </div>`

                        sendMailer(`${user.email}`, user.first_name, 'Your Archive', userSubject, userMessage)
                    }).catch(err => {
                        handleError(err, req, res)
                    })
                handleResponse(res, undefined, message.EmailVerified)
            })
            .catch(err => {
                handleError(err, req, res)
            })
    }
    else {
        handleError(message.LinkAllReadyUsed, req, res)
    }
}

exports.resend = async (req, res) => {

    const { error } = resendEmail.validate(req.body, { abortEarly: false });
    if (error) {
        handleError(error, req, res)
        return
    }

    const user = await User.findOne({ where: { email: req.body.email } })
    if (user === null) {
        return handleError(message.PleaseInputRegisterEmail, req, res)
    }
    else
        if (user?.status == 'email_verify') {

            return handleError(message.YourEmailisAlreadyVerified, req, res)
        }
        else
            if (user?.status == 'pending') {
                User.update({
                    token: createUUID()
                }, { where: { id: user.id } })
                    .then(async (data) => {

                        const user = await User.findOne({ where: { email: req.body.email } })

                        const link = `${process.env.BACKEND_URL}/email-verify?token=${user.token}`;
                        const subject = "Your email verification link";
                        const messages = `<div style="margin:auto; padding:10%">
                                    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                                    <div style="margin:50px auto;width:60%;padding:20px 0">
                                    <div style="border-bottom:1px solid #eee">
                                        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Your Archive</a>
                                    </div>
                                    <p style="font-size:25px">Hello  ,</p>
                                    <p>Use the code below to recover access to your Your Archive account.</p>
                                    <a href=${link} style=text-decoration:none><h3 style="background:#e6f3ffwidth:fullmargin: 0 autopadding:10px">Confirm</h3></a></h3>
                                    <p style="font-size:0.9em;">Best Regards,<br />Your Archive</p>
                                    </div>
                                </div>
                                </div>`;

                        sendMailer(user.email, user.first_name, subject, messages);

                        getResponse(res, message.LinkHasbeenSend)
                    })
                    .catch(err => {
                        handleError(err, req, res)
                    })
            }
};

exports.login = async (req, res) => {
    const { error } = login.validate(req.body, { abortEarly: false })
    if (error) {
        handleError(error, req, res)
        return
    }
    const { email, password } = req.body
    const user = await User.findOne({ where: { email: email, password: md5(password) } })
    if (!user) {
        return handleError('Invalid login credential', req, res)
    }
    else
        if (user && user.status === 'email_verify') {
            const token = await jwt.sign({
                id: user.id,
                email: user.email,
            }, process.env.JWT_SECRET, { expiresIn: `${process.env.TOKEN_EXPIRATION}` })
            res.cookie('token', token).send({
                token: token,
                message: 'LoggedIn Successfully',
                error: false
            })
        }
        else {
            return handleError('Your account is not verified', req, res)
        }
}

exports.logout = async (req, res) => {
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        });
        getResponse(res, message.Logout)
    } catch (error) {
        handleError(error, req, res)
    }
}

exports.forgotPassword = async (req, res) => {

    const { error } = resetEmail.validate(req.body, { abortEarly: false })

    if (error) {
        handleError(error, req, res)
        return
    }

    const user = await User.findOne({ where: { email: req.body.email } })

    if (user === null) {
        handleError(message.PleaseInputRegisterEmail, req, res)
    }

    if (user) {
        const email = req.body.email
        const token = createUUID()

        const subject = 'Your forgot password link'

        const message = ` <div style="margin:auto; width:70%">
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:60%;padding:20px 0">
       <p style="font-size:25px">Hello,</p>
      
      <p>Use the code below to recover access to your Your archive account.</p>
     
         <div style="border-bottom:1px solid #eee">
        <a href=${process.env.FRONTEND_URL}/new/forgot/token=${token} style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Click the link and reset your password</a>
      </div>
  
      
      <p>The recovery code is only valid for 24 hours after it’s generated. If your code has already expired, you can restart the recovery process and generate a new code.
      If you haven't initiated an account recovery or password reset in the last 24 hours, ignore this message.</p>
      <p style="font-size:0.9em;">Best Regards,<br />Your Archive</p>
    </div>
  </div>
  </div>`

        User.update({
            email: email,
            token: token
        },
            { where: { id: user.id } })
            .then(data => {
                sendMailer(`${email}`, 'Your Archive', subject, message)
                getResponse(res, `We have sent reset password email link`)

            })
            .catch(err => {
                handleError(err, req, res)
            })
    }
}

exports.forgotPasswordVerify = async (req, res) => {
    const { error } = updatePassword.validate(req.body, { abortEarly: false })

    if (error) {
        handleError(error, req, res)
        return
    }

    const user = await User.findOne({ where: { token: req.body.token } })

    if (user) {

        if (req.body.new_password === req.body.confirm_password) {

            await User.update({
                token: null,
                password: md5(req.body.new_password),
                status: 'email_verify'
            },
                {
                    where: { id: user.id }
                })
                .then(data => {
                    return getResponse(res, 'You have successfully reset your password')
                })
                .catch(err => {
                    handleError(err, req, res)
                })
        }
        else
            return handleError('Password and confirm password should be same.', req, res)
    }
    else
        if (!user) {
            return handleError('This verification link has already been used', req, res)
        }
}

exports.me = async (req, res) => {
    const user = await User.findOne({ where: { id: req.user.id } })
    // console.log(user)
    if (user) {
        await Article.findAll({ where: { user_id: req.user.id } })
            .then(data => {
                const storage = getStorage(data)
                const account_storage = { storage }
                const dsc = { ...user }.dataValues
                const { token, status, password, ...me } = { ...dsc, ...account_storage }

                return handleResponse(res, me,)
            }).catch((err) => {
                handleError(err, req, res)
            })
    }
    else handleError(message.Unauthorized, req, res)
}