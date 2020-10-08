const fs = require('fs')
const mongoose = require('mongoose')
const colors = require('colors')
const dotenv = require('dotenv')

//Loads env variable
dotenv.config({ path: './config/config.env' })

//Loads Model
const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/Course')
const User = require('./models/User')
const Review = require('./models/Review')
//Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})

const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'))
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'))

//Import Into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps)
    console.log('Bootcamps Data Imported..'.green.inverse)

    await Course.create(courses)
    console.log('Courses Data Imported..'.green.inverse)

    await User.create(users)
    console.log('Users Data Imported..'.green.inverse)

    await Review.create(reviews)
    console.log('Reviews Data Imported..'.green.inverse)
  }

  catch (err) {
    console.log('Error in Importing Data'.red.inverse)
  }
}

//Deleting Data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany()
    console.log(`Bootcamp Data Destroyed`.red.inverse)
    await Course.deleteMany()
    console.log(`Courses Data Destroyed`.red.inverse)
    await User.deleteMany()
    console.log(`User Data Destroyed`.red.inverse)
    await Review.deleteMany()
    console.log(`Review Data Destroyed`.red.inverse)
  } catch (err) {
    console.log(`Error in deleting Bootcamp data`.red.inverse)
  }
}

if (process.argv[2] === '-i') {
  importData()
} else if (process.argv[2] === '-d') {
  deleteData()
}