const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const fileupload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')
const colors = require('colors')
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db')


//Load .env variables
dotenv.config({ path: './config/config.env' })

//Connect To Database
connectDB()

//Bootcamp Route Files
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const users = require('./routes/users')
const reviews = require('./routes/reviews')

//Express Function Calling
const app = express()

//Json Body Parser
app.use(express.json())

//Cookie Parser
app.use(cookieParser())
//Development logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

//File Upload
app.use(fileupload())

//Sanitize Data
app.use(mongoSanitize()
)

//Set Security headers
app.use(helmet())

//Prevent XSS attacks
app.use(xss())

//Rate Limit
const apiLimiter = rateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 100
})
app.use(apiLimiter)

//prevent http param pollution
app.use(hpp())

//Enable Cors
app.use(cors())
//Set a static folder
app.use(express.static(path.join(__dirname, 'public')))

//Mount Router
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', users)
app.use('/api/v1/reviews', reviews)

//Error Middleware
app.use(errorHandler)

//Port Listening
const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold))
