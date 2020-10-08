const express = require('express')

const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
} = require('../controller/reviews')

const router = express.Router({ mergeParams: true })

const Review = require('../models/Review')

//Middleware
const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

router.route('/')
  .get(advancedResults(Review, {
    path: 'bootcamp',
    select: 'name description'
  }),
    getReviews
  )
  .post(protect, authorize('user', 'publisher'), addReview)

router.route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview)
module.exports = router