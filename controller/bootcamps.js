const path = require('path')
//Importing ErrorResponse Class
const ErrorResponse = require('../utils/errorResponse')

//Aynchandler  Note:- Im not using this method just importing for future reference
const asyncHandler = require('../middleware/async')

//Bootcamp Model
const Bootcamp = require('../models/Bootcamp')

//Importing Geocoder for radius routes
const geocoder = require('../utils/geocoder')


//<<<<<<<<<<<<<<<<<<<<<<<<<<<<---------------------------------------ROUTES------------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// @desc  Get All Bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = async (req, res, next) => {

  try {


    res.status(200).json(res.advancedResults)
  } catch (err) {
    next(err)
  }
}

// @desc  Get Single Bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
      return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }
    res.status(200).json({
      success: true,
      data: bootcamp
    })
  } catch (err) {
    next(err)
  }
}


// @desc  Create New Bootcamp
// @route POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = async (req, res, next) => {
  try {
    //Add userID in req.body
    req.body.user = req.user.id

    //Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id })

    //If the user is not an admin, they can only add one bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
      return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`, 400))
    }

    const bootcamp = await Bootcamp.create(req.body)
    res.status(201).json({
      success: true,
      data: bootcamp
    })
  } catch (err) {
    next(err)
  }
}


// @desc  Update Bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = async (req, res, next) => {
  try {
    let bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) {
      return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    //Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401))
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    res.status(200).json({
      success: true,
      data: bootcamp
    })
  } catch (err) {
    next(err)
  }
}


// @desc  Delete Bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) {
      return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }
    //Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`, 401))
    }

    //this will invoke remove method in bootcamp model
    bootcamp.remove()

    res.status(200).json({
      success: true,
      msg: `The given ${req.params.id} is successfully deleted`,
      data: {}
    })
  } catch (err) {
    next(err)
  }
}

//@desc Get Bootcamp By radius
//@route GET /api/v1/bootcamps/radius/:zipcode/:distance
//access Private

exports.getBootcampInRadius = async (req, res, next) => {
  try {
    const { zipcode, distance } = req.params

    //Get Lat and Lon from Geocoder
    const loc = await geocoder.geocode(zipcode)
    const lat = loc[0].latitude
    const lon = loc[0].longitude

    //Calculate radius using radian
    //Divide distance by radius of earth
    //Earth Radius = 3963 mi / 6378 km
    const radius = distance / 3963.2
    const bootcamps = await Bootcamp.find({
      location: {
        $geoWithin: {
          $centerSphere: [[lon, lat], radius]
        }
      }

    })
    res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps
    })

  } catch (err) {
    next(err)
  }
}



// @desc  Upload Photo Of Bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
// @access Private
exports.uploadPhotoBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) {
      return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.params.id} is not authorised to upload a photo`, 401))
    }
    if (!req.files) {
      return next(new ErrorResponse(`Please upload a image`, 400))
    }
    //Destructuring
    const file = req.files.file

    //Make sure the image is photo
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse(`Please upload an image file`, 400))
    }
    //Size Check
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400))
    }
    //Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
      if (err) {
        console.error(err)
        return next(new ErrorResponse(`Problem with file upload`, 500))
      }
      await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })
      res.status(200).json({
        success: true,
        data: file.name
      })
    })

  } catch (err) {
    next(err)
  }
}
