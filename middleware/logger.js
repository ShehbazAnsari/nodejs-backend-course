
//We are using morgan library for logs the below function or middleware is not in use


//@desc Development Logger
//@route its just a middleware for all the routes 
//@access Public

const logger = (req, res, next) => {
  console.log(`${req.method} ${req.protocol}:// ${req.get('host')}${req.originalUrl}`)
  next()
}

module.exports = logger