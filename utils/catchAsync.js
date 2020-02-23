// this file contains a function return an ananymous function ready to be called.
// The point is to replace calling try{} catch{} relates to API CRUD
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(error => next(error));
  };
};
