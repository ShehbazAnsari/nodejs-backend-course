//Importing ErrorResponse Class
const ErrorResponse = require('../utils/errorResponse')

//Aynchandler  Note:- Im not using this method just importing for future reference
const asyncHandler = require('../middleware/async')

//User Model
const User = require('../models/User')

//@desc Get All User
//@routes GET /api/v1/users
//@access Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    res.status(200).json(res.advancedResults)
  } catch (err) {
    next(err)
  }
}

//@desc Get Single User
//@routes GET /api/v1/users/:id
//@access Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return next(new ErrorResponse(`There is no user with given id ${req.params.id}`, 404))
    }
    res.status(200).json({
      success: true,
      data: user
    })
  } catch (err) {
    next(err)
  }
}

//@desc Create User
//@routes POST /api/v1/users
//@access Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    res.status(200).json({
      success: true,
      data: user
    })
  } catch (err) {
    next(err)
  }
}


//@desc Update User
//@routes PUT /api/v1/users/:id
//@access Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    res.status(200).json({
      success: true,
      data: user
    })
  } catch (err) {
    next(err)
  }
}

//@desc Delete User
//@routes DELETE /api/v1/users/:id
//@access Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.status(200).json({
      success: true,
      data: {}
    })
  } catch (err) {
    next(err)
  }
}
