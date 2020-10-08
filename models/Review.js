const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    maxlength: 100,
    trim: true,
    required: [true, 'Please add a title for the review']
  },
  text: {
    type: String,
    required: [true, 'Please add some text']
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
})
//Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true })

//Static Method To Get Average of review rating
//The below one is static....there are two types 1)Static , 2) Method
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
        _id: '$bootcamp',
        averageRating: { $avg: '$rating' }
      }
    }
  ])
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, { averageRating: obj[0].averageRating })
  } catch (err) {
    next(err)
  }
}

//Call getAverageRating after save
ReviewSchema.post('save', async function () {
  this.constructor.getAverageRating(this.bootcamp)
})

//Call getAveragerating before remove
ReviewSchema.pre('remove', async function () {
  this.constructor.getAverageRating(this.bootcamp)
})

module.exports = mongoose.model('Review', ReviewSchema)