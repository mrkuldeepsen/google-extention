const { login } = require('../utils/common')
const md5 = require("md5");
var jwt = require('jsonwebtoken');
const { handleError } = require("../utils/helper")
var multer = require("multer");
const fs = require("fs");
const { Article, AddToTopic, Share, GroupMember, Topic, User } = require("../models")
const path = require("path");
const BASE_PATH = __dirname
const mysql = require('mysql');

var storage_v = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "videos/");
    },
    filename: function (req, file, cb) {
        var filename = `${Date.now()}.mp4`;
        var body = req.body;
        cb(null, file.originalname);
    },
})


var storage_a = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "recordings/");
    },
    filename: function (req, file, cb) {
        var filename = `${Date.now()}.mp4`;
        var body = req.body;
        console.log(req.body.title);
        cb(null, file.originalname);
    },
})

var storage_t = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "captures/danielstarek@yahoo.com/");
    },
    filename: function (req, file, cb) {
        var filename = `${Date.now()}.mp4`;
        var body = req.body;
        cb(null, file.originalname);
    },
})

var upload_v = multer({
    storage: storage_v,
    limits: { fileSize: 2000000000, fieldSize: 2000000000 },
})

var upload_a = multer({
    storage: storage_a,
    limits: { fileSize: 2000000000, fieldSize: 2000000000 },
})

var upload_t = multer({
    storage: storage_t,
    limits: { fileSize: 2000000000, fieldSize: 2000000000 },
})

exports.login = async (req, res) => {
    const { email, password } = req.body

    const { error } = login.validate(req.body, { abortEarly: false })
    if (error) {
        handleError(error, req, res)
        return
    }

    const user = await User.findOne({ where: { email: email, password: md5(password) } })

    if (!user) {
        return handleError('Invalid login credential', req, res)
    } else if (user && user.status === 'email_verify') {
        const token = await jwt.sign({
            id: user.id,
            email: user.email,
        }, process.env.JWT_SECRET, { expiresIn: `${process.env.TOKEN_EXPIRATION}` })
        res.send({
            token: token,
            message: 'LoggedIn Successfully',
            error: false,
            user_name: user.user_name
        })
    } else {
        return handleError('Your account is not verified', req, res)
    }
}

exports.validate = async (req, res) => {
    return res.send(true)
}

function ArticleExists(userId, url) {
    Article.findAll({ where: { user_id: userId, url: url } })
        .then(data => {
            return data.length > 0 ? true : false;
        }).catch((err) => {
            console.log(err)
        })
}

exports.articleExists = async (req, res) => {
    var exists = ArticleExists(req.user.id, req.body.url);
    console.log("exists", exists);
    return res.send(JSON.stringify(exists));
}

exports.uploadAudio = async (req, res) => {
    for (var recording of req.body.recordings) {
        var filename = `${Date.now()}.wav`;
        const data = {
            title: req.body.title,
            description: req.body.description,
            url: req.body.url,
            file_size: 0,
            type: "audio",
            date: req.body.date,
            status: (req.body.description === '' || req.body.url === '' || req.body.date === '') ? 'draft' : 'publish',
            original_file_name: filename,
            file_name: filename,
            user_id: req.user.id
        }

        await Article.create(data)
            .then(data => {
                // console.log('Data>>>', data)
            })
            .catch(err => {
                handleError(err, req, res)
            })

        fs.writeFileSync(
            path.join(BASE_PATH, `../upload/audio/${filename}`),
            recording.split(",")[1],
            "base64"
        );
        console.log(`audio ${filename} saved`);
    }
    return res.send(JSON.stringify(true));
}

exports.saveArticle = async (req, res) => {
    var body = req.body;
    var user = req.username;
    var title = body.title;
    var url = body.url;
    var date = body.date;
    var description = body.description;

    const data = {
        title: req.body.title,
        description: req.body.description,
        url: req.body.url,
        file_size: 0,
        type: "image",
        date: req.body.date,
        status: (req.body.description === '' || req.body.url === '' || req.body.date === '') ? 'draft' : 'publish',
        original_file_name: "",
        file_name: "",
        user_id: req.user.id
    }

    try {
        Article.create(data).then(data => {
            // console.log('data>>>>>>>>>>>>', data)
        })
            .catch(err => {
                handleError(err, req, res)
            })
    } catch (error) {
        console.log('error>>>>>>>>>>>>>', error);
        //   fs.writeFileSync(
        //     `logs/error-${code}`,
        //     `error:\n${error}\n\nmeta:\n${meta}\n\nselections:\n${selections}\n\nconnections:\n${connections}`
        //   );
        res.status(400).end("error");
        return;
    }
    return res.send(JSON.stringify(true));
}

exports.video = async (req, res) => {
    console.log("video...>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
}

exports.upload = upload_v.single("file"), async (req, res) => {


    var body = req.body;
    var user = req.username;

    var meta = body.metadata;
    var selections = body.selections;
    var connections = body.connections;
    var code = Date.now();
    var articleExists = ArticleExists(user, meta.url);
    try {

        const sqlconnection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'mainalpha'
        });

        // connect to MySQL
        sqlconnection.connect(function (err) {
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }

            console.log('connected as id ' + connection.threadId)
        });


        if (!articleExists) {

            sqlconnection.query(`INSERT INTO tbl_articles (user, title, description, url, date, capture)
                  VALUES ("${user}", "${meta.title}", "${meta.description}", "${meta.url}", "${meta.date}", "${code}")`);
        } else {
            sqlconnection.query(`UPDATE tbl_articles SET capture = "${code}" WHERE
              user = "${user}" AND url = "${meta.url}"`);
        }

        //selections
        if (selections) {
            for (var selection of selections) {
                var x =
                    sqlconnection.query(`INSERT INTO tbl_selections (user, url, selection, percentage)
                  VALUES ("${user}", "${meta.url}", "${selection.text}", "${selection.percentage}")`);
            }
        }
        // connections
        if (connections) {
            for (var connection of connections)
                sqlconnection.query(`INSERT INTO tbl_connections (user, url, text1, text2)
                  VALUES ("${user}", "${meta.url}", "${connection.text1}", "${connection.text2}")`);
        }
        if (!fs.existsSync(`captures/${user}`)) fs.mkdirSync(`captures/${user}`);
        fs.writeFileSync(
            `captures/${user}/${code}.jpg`,
            body.capture.split(",")[1],
            "base64"
        );
        console.log("done");
    } catch (error) {
        console.log(error);
        fs.writeFileSync(
            `logs/error-${code}`,
            `error:\n${error}\n\nmeta:\n${meta}\n\nselections:\n${selections}\n\nconnections:\n${connections}`
        );
        res.status(400).end(error);
        return;
    }
    return res.send(JSON.stringify(true));
}