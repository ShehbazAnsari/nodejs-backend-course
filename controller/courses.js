//Importing ErrorResponse Class
const ErrorResponse = require('../utils/errorResponse')

//Aynchandler  Note:- Im not using this method just importing for future reference
const asyncHandler = require('../middleware/async')

//Bootcamp Model
const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')



//<<<<<<<<<<<<<<<<<<<<<<------------------------------- Routes -------------------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



//@desc Get All Courses
//@routes GET /api/v1/courses/
//@routes GET /api/v1/bootcamps/:bootcampId/courses
//@access Public

exports.getCourses = async (req, res, next) => {
  try {
    if (req.params.bootcampId) {
      const course = await Course.find({ bootcamp: req.params.bootcampId })
      if (!course) {
        return next(new ErrorResponse(`Courses not found with the given BootcampId ${req.params.bootcampId}`, 404))
      }
      return res.status(200).json({
        success: true,
        count: course.length,
        data: course
      })
    } else {
      res.status(200).json(res.advancedResults)
    }
  } catch (err) {
    next(err)
  }
}



//@desc Get Single Course
//@routes GET /api/v1/courses/:id
//@access Public

exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: 'bootcamp',
      select: 'name description'
    })
    if (!course) {
      return next(new ErrorResponse(`No course  with the id of ${req.params.id}`, 404))
    }
    res.status(200).json({
      success: true,
      data: course
    })
  } catch (err) {
    next(err)
  }
}

//@desc Add Course
//@routes POST /api/v1/bootcamp/:bootcampId/courses
//@access Private

exports.addCourse = async (req, res, next) => {
  try {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if (!bootcamp) {
      return next(new ErrorResponse(`No bootcamp on the given id ${req.params.bootcampId}`))
    }
    //Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorised to add a course to bootcamp ${bootcamp._id}`, 401))
    }
    const course = await Course.create(req.body)

    res.status(200).json({
      success: true,
      data: course
    })

  } catch (err) {
    next(err)
  }
}

//@desc Update Course
//@routes PUT /api/v1/courses/:id
//@access Private

exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id)

    if (!course) {
      return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404))
    }
    //Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorised to update course ${course._id}`, 401))
    }
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    res.status(200).json({
      success: true,
      data: course
    })

  } catch (err) {
    next(err)
  }
}

//@desc Delete Course
//@routes DELETE /api/v1/courses/:id
//@access Private

exports.deleteCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id)

    if (!course) {
      return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404))
    }
    //Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorised to delete course ${course._id}`, 401))
    }
    await course.remove()

    res.status(200).json({
      success: true,
      data: {}
    })

  } catch (err) {
    next(err)
  }
}