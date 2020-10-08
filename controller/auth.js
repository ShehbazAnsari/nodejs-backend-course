//Importing crypto module
const crypto = require('crypto')
//Importing ErrorResponse Class
const ErrorResponse = require('../utils/errorResponse')

//Aynchandler  Note:- Im not using this method just importing for future reference
const asyncHandler = require('../middleware/async')

//User Model
const User = require('../models/User')

//sendEmail Utils
const sendEmail = require('../utils/sendEmail')

//@desc Register User
//@routes POST /api/v1/auth/register
//@access Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    //Create User
    const user = await User.create({
      name,
      email,
      password,
      role
    })
    sendTokenResponse(user, 200, res)
  } catch (err) {
    next(err)
  }
}


//@desc Login
//@routes POST /api/v1/auth/login
//@access Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    //Validate email and password
    if (!email || !password) {
      return next(new ErrorResponse(`Please provide an email and password`, 400))
    }

    //Check for User
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return next(new ErrorResponse(`Invalid Credentials`, 401))
    }

    //Password Check
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return next(new ErrorResponse(`Invalid Credentials`, 401))
    }

    sendTokenResponse(user, 200, res)
  } catch (err) {
    next(err)
  }
}

//@desc Logout User
//@route GET /api/v1/auth/logout
//@access Private 
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', '', 10, {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    })
    res.status(200).json({
      success: true,
      data: {}
    })
  } catch (err) {
    next(err)
  }
}

//@desc Get Current logged in User
//@route GET /api/v1/auth/me
//@access Private 
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    res.status(200).json({
      success: true,
      data: user
    })
  } catch (err) {

  }
}

//@desc Forgot Password
//@route POST /api/v1/auth/forgotpassword
//@access Public
exports.forgotPassword = async (req, res, next) => {
  try {

    const user = await User.findOne({ email: req.body.email })
    if (!user) {
      return next(new ErrorResponse(`There is no user with this email`, 404))
    }
    //Get Reset Token
    const resetToken = await user.getResetPasswordToken()
    await user.save({ validateBeforeSave: false })

    //Reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`
    const message = `You are receiving this email because you (or someone else) requested  the reset  of a password.Please make a PUT request to:\n\n ${resetUrl}`
    try {
      //Sending email through nodemailer
      await sendEmail({
        email: user.email,
        subject: `Password reset token`,
        message
      })
      res.status(200).json({
        data: 'Email Sent'
      })
    }
    catch (err) {

      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined
      await user.save({ validateBeforeSave: false })
      return next(new ErrorResponse(`Email could not be sent`, 500))
    }

  } catch (err) {
    next(err)
  }

}

//@desc Reset Password
//@route PUT /api/v1/auth/resetpassword/:resettoken
//@access PUBLIC
exports.resetPassword = async (req, res, next) => {
  try {

    const resetToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() }
    })
    if (!user) {
      return next(new ErrorResponse(`Invalid token`, 400))
    }
    //Set New Password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()
    sendTokenResponse(user, 200, res)
  } catch (err) {
    next(err)
  }
}

//@desc Update user name and email only
//@routes PUT /api/v1/auth/updatedetails
//@access Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      email: req.body.email,
      name: req.body.name
    }
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: false
    })
    res.status(200).json({
      success: true,
      data: user
    })

  }
  catch (err) {
    next(err)
  }
}

//@desc Update User password
//@routes PUT /api/v1/auth/updatePassword
//@access Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password')
    const { currentPassword, newPassword } = req.body
    //Check Password
    if (!(await user.matchPassword(currentPassword))) {
      return next(new ErrorResponse(`Password is Incorrect`, 404))
    }
    user.password = newPassword
    await user.save()
    sendTokenResponse(user, 200, res)
  } catch (err) {
    next(new ErrorResponse(`Invalid password`, 404))
  }
}

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //Create Token
  const token = user.getSignedJwtToken()

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  }
  if (process.env.NODE_ENV === 'production') {
    options.secure = true
  }
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    })
}