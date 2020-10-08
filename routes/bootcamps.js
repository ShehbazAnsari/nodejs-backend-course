const express = require('express')
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampInRadius,
  uploadPhotoBootcamp
} = require('../controller/bootcamps')

const { protect, authorize } = require('../middleware/auth')
//Bootcamp and advancedResults for pagination,filter & etc Stuff
const Bootcamp = require('../models/Bootcamp')
const advancedResults = require('../middleware/advancedResults')

//Include Another resource routers
const courseRouter = require('./courses')
const reviewRouter = require('./reviews')

const router = express.Router()

//Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter)
router.use('/:bootcampId/reviews', reviewRouter)

router.route('/radius/:zipcode/:distance')
  .get(getBootcampInRadius)

router.route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp)

router.route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp)

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), uploadPhotoBootcamp)


module.exports = router