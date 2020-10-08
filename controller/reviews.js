//Importing ErrorResponse Class
const ErrorResponse = require('../utils/errorResponse')
//Aynchandler  Note:- Im not using this method just importing for future reference
const asyncHandler = require('../middleware/async')

//Bootcamp Model
const Review = require('../models/Review')
const Bootcamp = require('../models/Bootcamp')

//<<<<<<<<<<<<<<<<<<<<<<------------------------------- Routes -------------------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

//@desc Get All Reviews
//@routes GET /api/v1/reviews
//@routes GET /api/v1/bootcamps/:bootcampId/reviews
//@access Public
exports.getReviews = async (req, res, next) => {
  try {
    if (req.params.bootcampId) {
      const reviews = await Review.find({ bootcamp: req.params.bootcampId })
      if (!reviews) {
        return next(new ErrorResponse(`Bootcamp not found with the given BootcampId ${req.params.bootcampId}`, 404))
      }
      return res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews
      })
    } else {
      res.status(200).json(res.advancedResults)
    }
  } catch (err) {
    next(err)
  }
}

//@desc Get Single Reviews
//@routes GET /api/v1/reviews/:id
//@access Public
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate({
      path: 'bootcamp',
      select: 'name description'
    })
    if (!review) {
      return next(new ErrorResponse(`No review found with the id of ${req.params.id}`, 404))
    }
    res.status(200).json({
      success: true,
      data: review
    })
  } catch (err) {
    next(err)
  }
}

//@desc Add Reviews
//@routes POST /api/v1/bootcamps/:bootcampId/reviews/
//@access Private
exports.addReview = async (req, res, next) => {
  try {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if (!bootcamp) {
      return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.bootcampId}`))
    }

    const review = await Review.create(req.body)
    res.status(200).json({
      success: true,
      data: review
    })
  } catch (err) {
    next(err)
  }
}



//@desc Update Reviews
//@routes PUT /api/v1/reviews/:id
//@access Private
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id)
    if (!review) {
      return next(new ErrorResponse(`Review not found with the given id ${req.params.id}`))
    }

    //Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to update review`, 401))
    }
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    res.status(200).json({
      success: true,
      data: review
    })
  } catch (err) {
    next(err)
  }
}


//@desc Delete Reviews
//@routes DELETE /api/v1/reviews/:id
//@access Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) {
      return next(new ErrorResponse(`Review not found with the given id ${req.params.id}`))
    }

    //Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to update review`, 401))
    }
    await Review.findByIdAndDelete(req.params.id)
    res.status(200).json({
      success: true,
      data: {}
    })
  } catch (err) {
    next(err)
  }
}

