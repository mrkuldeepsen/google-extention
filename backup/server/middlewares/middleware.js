const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { handleError } = require("../utils/helper");
const fs = require('fs')

exports.authJWT = async (req, res, next) => {


    if (req.path.includes('/login') || req.path.includes('/register') || req.path.includes('/email-verify') || req.path.includes('/reset-password-email') || req.path.includes('/update-password') || req.path.includes('/email-resend'))
        return next()

    if (req.cookies.token) {
        try {
            const data = await jwt.verify(req.cookies.token, process.env.JWT_SECRET)
            req.user = data;
            return next()
        } catch (error) {
            res.status(401).send({
                error: { message: ['Unauthorized access!'] }
            })
        }
    } else
        res.status(401).send({
            error: { message: ['Unauthorized access!'] }
        })
}

exports.authJWTExt = async (req, res, next) => {
    if (req.path.includes('/login'))
        return next()

    const authorization = req.headers['authorization'].split('bearer ')

    if (authorization[1]) {
        try {
            const data = await jwt.verify(authorization[1], process.env.JWT_SECRET)
            req.user = data;
            return next()
        }
        catch (error) {
            res.status(401).send({
                error: { message: ['Unauthorized access!'] }
            })
        }
    } else
        res.status(401).send({
            error: { message: ['Unauthorized access!'] }
        })
}

//File uploading 
exports.fileUploader = async (req, res, next) => {

    let name = ""
    let newPath = ''
    const BASE_PATH = __dirname
    const storage = multer.diskStorage({

        destination: function (req, file, cb) {
            console.log(file);

            if (file.mimetype === 'image/jpe' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
                newPath = path.join(BASE_PATH, '../upload/images')
                cb(null, path.join(BASE_PATH, '../upload/images'))
            } else
                if (file.mimetype === 'application/pdf') {
                    newPath = path.join(BASE_PATH, '../upload/docs')
                    cb(null, path.join(BASE_PATH, '../upload/docs'))

                } else
                    if (file.mimetype === 'video/mp4' || file.mimetype === 'video/webm') {
                        newPath = path.join(BASE_PATH, '../upload/videos')

                        cb(null, path.join(BASE_PATH, '../upload/videos'))
                    } else
                        if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3' || file.mimetype === 'audio/wav') {
                            newPath = path.join(BASE_PATH, '../upload/audio')

                            cb(null, path.join(BASE_PATH, '../upload/audio'))
                        }
                        else {
                            return res.status(400).send({ error: { message: ['Invalid file type'], }, })
                        }
        },

        filename: function (req, file, cb) {
            name = Date.now() + file.originalname
            cb(null, name)
        },
    })
    const fileFilter = (req, file, cb) => {
        if (file.mimetype === 'image/jpe' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf' || file.mimetype === 'video/mp4' || file.mimetype === 'video/webm' || file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3' || file.mimetype === 'audio/wav') {
            cb(null, true)
        }
        else {
            cb(null, true)
        }
    }
    const upload = multer({
        storage: storage,
        limits: { fileSize: 1024 * 1024 * 1024 * 5 },
        fileFilter: fileFilter
    })


    req.on('aborted', () => {
        if (fs.existsSync(newPath + '/' + name)) {
            fs.unlink(newPath + '/' + name, (err) => {
                if (err) {
                    console.log('Error deleting file:', err);
                } else {
                    console.log('File deleted successfully');
                }
            })
        } else {
            console.log('File does not exist');
        }
    })

    upload.single("file")(req, res, next)
}

