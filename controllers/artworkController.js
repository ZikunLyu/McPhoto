//const multer = require('multer');
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
//const upload = multer({ dest: 'uploads/' });
const ArtWork = require('../models/artWorkModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    // The following fields need to be excluded as they are not part of query for filtering, they will be handled individually
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1) Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // find() function return a query, not directly the objects, we will build the query layer by layer, and in the end get the objects all together
    this.query = ArtWork.find(JSON.parse(queryStr));
    return this;
  }

  search() {
    // 1.5) search keyword in artist, description, and title field
    if (this.queryString.search) {
      const keyword = this.queryString.search;
      this.query = ArtWork.find({
        $or: [
          { artist: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { title: { $regex: keyword, $options: 'i' } }
        ]
      });
      //this.query = ArtWork.find({ description: { $regex: `/${keyword}/i` } });
      //this.query = ArtWork.find({ title: { $regex: `/${keyword}/i` } });
    }
    return this;
  }

  sort() {
    // 2) Sorting
    // To sort in descending order: eg: &sort=-price
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  limitFields() {
    // 3) Field limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query.select(fields);
    } else {
      this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    // 4) Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

// get all artworks, optional to add keywords and limiting
exports.getAllArtworks = catchAsync(async (req, res) => {
  // BUILD QUERY
  const features = new APIFeatures(ArtWork.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();
  // EXECUTE QUERY
  const artworks = await features.query;
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: artworks.length,
    data: {
      artworks
    }
  });
});

// get the number of all artworks, optional to add keywords and limiting
exports.getAllArtworksNum = catchAsync(async (req, res) => {
  // BUILD QUERY
  const features = new APIFeatures(ArtWork.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();
  // EXECUTE QUERY
  const artworks = await features.query;
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: artworks.length
  });
});

exports.uploadArtInfo = catchAsync(async (req, res, next) => {
  const artwork = new ArtWork({
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    artist: req.body.artist,
    creationTime: req.body.creationTime,
    medium: req.body.medium,
    width: req.body.width,
    height: req.body.height,
    isForDownload: req.body.isForDownload,
    isForSale: req.body.isForDownload,
    isForRental: req.body.isForRental,
    isSoldorRented: req.body.isSoldorRented
  });
  await artwork.save();
  res.send('OK');
});

exports.uploadArtFileByTitleArtist = catchAsync(async (req, res, next) => {
  if (req.file.length === 0) {
    return next(new AppError('Please provide the file', 401));
  }
  const { file } = req;
  const fileInfo = {};
  fileInfo.mimetype = file.mimetype;
  fileInfo.originalname = file.originalname;
  fileInfo.size = file.size;
  fileInfo.path = `./uploads/${file.originalname}`;
  await ArtWork.findOneAndUpdate(
    {
      title: req.body.title,
      artist: req.body.artist
    },
    { artworkfile: fileInfo, isPictureUpload: true },
    function(err, doc) {
      if (err) {
        return console.log(err);
      }
      fs.renameSync(
        `./uploads/${file.filename}`,
        `./uploads/${file.originalname}`
      );
      console.log(doc);
    }
  );
  res.end('File upload successful!');
});

exports.deleteAll = catchAsync(async (req, res, next) => {
  await ArtWork.deleteMany({});
  res.send('OK');
});
