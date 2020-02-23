// Why all API related error will be directed to here?
// Cuz the API call definitely respond req, res, and next, if there is an error,
// the err param will also be added, thus knowing it should trigger the function here
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};
