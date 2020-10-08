const ErrorResponse = require('../utils/errorResponse')
const errorHandler = (err, req, res, next) => {

  let error = { ...err }

  //This message is for all the other error except casterror
  error.message = err.message

  //Log to console for dev
  console.log(err.stack.red)

  //Mongoose bad objectId
  if (err.name === 'CastError') {
    //this message for cast error
    const message = `Resources not found`
    error = new ErrorResponse(message, 404)
  }

  //Mongoose Duplicate Keys or Parameters 
  if (err.code === 11000) {
    const message = `Duplicate field value entered`
    error = new ErrorResponse(message, 400)
  }

  //Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message)
    error = new ErrorResponse(message, 400)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || `Server Error`
  })
}

module.exports = errorHandler




//Error handling
/*
err.name -->> will give the name of error
err.message -->>> will give the message of error

In err object there are 5 things:
{
        "stringValue": "\"5f5cf50967c775058c01e58ads\"",
        "kind": "ObjectId",
        "value": "5f5cf50967c775058c01e58ads",
        "path": "_id",
        "reason": {}
    }

*/