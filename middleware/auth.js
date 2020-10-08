const jwt = require('jsonwebtoken')
const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')


exports.protect = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      //Set token from Bearer token in header
      token = req.headers.authorization.split(' ')[1]
    }
    //Getting token from cookies    
    /* else if (req.cookies.token) {
      //Set token from Cookies 
      token = req.cookies.token
    } */
    //Make sure token exist
    if (!token) {
      return next(new ErrorResponse(`Not authorize to access this route`, 401))
    }

    //Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)
    next()
  } catch (err) {
    next(new ErrorResponse(`Not authorize to access this route`, 401))
  }
}

//Grant Access to specific roles
exports.authorize = (...roles) => async (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ErrorResponse(`User Role ${req.user.role} is not authorized to access this route`, 403))
  }
  next()
}