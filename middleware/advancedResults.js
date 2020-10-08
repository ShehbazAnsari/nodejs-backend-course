
const advancedResults = (model, populate) => async (req, res, next) => {
  try {
    let query

    //Copy req.query into reqQuery
    const reqQuery = { ...req.query }

    //Fields to exclude 
    const removeFields = ['select', 'sort', 'page', 'limit']

    //Loop over removefields and delete  them from reqQuery
    removeFields.forEach(params => delete reqQuery[params])

    //Create Query String
    let queryStr = JSON.stringify(reqQuery)

    //Replacing gt to $gt because $ is compulsory or Create operators($gt,$gte)
    queryStr = queryStr.replace(/\b(gt|gte|lte|lt|in)\b/g, match => `$${match}`)

    //Finding Resource
    query = model.find(JSON.parse(queryStr))


    //Selecting Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ')
      query = query.select(fields)
    }

    //Sorting Fields
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ')
      query = query.sort(sortBy)
    } else {
      query = query.sort('-createdAt')
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 25
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const totalDocument = await model.countDocuments()
    query = query.skip(startIndex).limit(limit)

    //Checking Populate 
    if (populate) {
      query = query.populate(populate)
    }
    //Executing Query
    const results = await query

    //Pagination
    const pagination = {}
    if (startIndex > 0) {
      pagination.previous = {
        page: page - 1,
        limit
      }
    }
    if (endIndex < totalDocument) {
      pagination.next = {
        page: page + 1,
        limit
      }
    }

    if (!results) {
      return next(new ErrorResponse(`Resources not found with id of ${req.params.id}`, 404))
    }
    res.advancedResults = {
      success: true,
      count: results.length,
      pagination,
      data: results
    }
    next()
  } catch (err) {
    next(err)
  }
}
module.exports = advancedResults