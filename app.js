const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')

const middleware_passport = require('./middleware/passport')
const passport = require('passport')
const mysql = require('mysql2/promise')

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const regionRoutes = require('./routes/region')
const depotRoutes = require('./routes/depot')
const depotTypeRoutes = require('./routes/depotType')
// const errorRoutes = require('./routes/error')
// const mailingRoutes = require('./routes/mailing')
// const accountRoutes = require('./routes/account')
// const feedbackRoutes = require('./routes/feedback')
// const analyticsRoutes = require('./routes/analytics')
const botTemplateRoutes = require('./routes/botTemplate')
const chatTemplatesRoutes = require('./routes/chatTemplate')
const sushiwokClientRoutes = require('./routes/sushiwokClient')

const app = express()

mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
})
    .then(connection => {
        console.log(`[MySQL] Connected to database`)
        global.connection = connection;
    })
    .catch(err => console.log(err))

app.use(morgan('dev'))
    .use('/uploads', express.static('uploads'))
    .use(bodyParser.urlencoded({extended: true, limit: '50mb'}))
    .use(bodyParser.json({limit: '50mb'})) /* Увеличен лимит, если данные превысят лимит, сервер отдаст только часть данных */
    .use(cors({ credentials: true, origin: "http://localhost:8080" }))
    .use(cookieParser())

app.use(passport.initialize())
middleware_passport(passport)

// https://lepist.ru/api/auth/login
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/region', regionRoutes)
app.use('/api/depot', depotRoutes)
app.use('/api/depotType', depotTypeRoutes)
// app.use('/api/mailing', mailingRoutes)
// app.use('/api/account', accountRoutes)
// app.use('/api/feedback', feedbackRoutes)
// app.use('/api/analytics', analyticsRoutes)
app.use('/api/botTemplate', botTemplateRoutes)
app.use('/api/chatTemplate', chatTemplatesRoutes)
app.use('/api/sushiwokClient', sushiwokClientRoutes)
// app.use('/api/error', errorRoutes)

module.exports = app