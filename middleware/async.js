//i dont like this method so im not using this methos i prefer try catch instead of this
const asynchandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
module.exports = asynchandler