const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })
    console.log(`MongoDB Connected ${conn.connection.host}`.cyan.underline.bold)

  } catch (e) {
    console.log(`Error In MongoDB Connection : ${e.message}`.red)
  }

}
module.exports = connectDB