const express = require('express')
const app = express()

const cookieParser = require("cookie-parser")
const cors = require("cors")
const bodyParser = require("body-parser")
const path = require("path")
const morgan = require('morgan')

require("dotenv").config({ path: __dirname + '/.env' });

const { handleError } = require('./server/utils/helper')
const message = require('./server/utils/message')
const { authJWT } = require('./server/middlewares/middleware')



app.use("/", express.static(path.join(__dirname, "/client/build")))

app.use(express.json())
app.use(morgan('dev'));
app.use(cookieParser())

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))


app.use(bodyParser.urlencoded({ extended: true }))

// app.use(bodyParser({ extended: true }))

require('./server/routes/ext')(app)

app.use(authJWT)


require('./server/routes/user')(app)
require('./server/routes/auth')(app)
require('./server/routes/article')(app)
require('./server/routes/topic')(app)
require('./server/routes/media')(app)
require('./server/routes/group')(app)

require('./server/routes/share')(app)
require('./server/routes/addToTopic')(app)

app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "/client/build/index.html"))
})

app.get('*', (req, res) => {
    handleError(message.PageNotFound, req, res)
})


var hostname = "127.0.0.1";
const PORT = process.env.PORT || 5200
app.listen(PORT, hostname, () => {
    console.log(`Server is working on ${hostname} || ${PORT}`)
})