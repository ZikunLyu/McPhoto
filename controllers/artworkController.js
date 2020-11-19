//const multer = require('multer');
// eslint-disable-next-line no-unused-vars
const fs = require('fs');

const ArtWork = require('../models/artWorkModel');
const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const notFound = 'data/utils/notfound.png';

/*
  Controller method: upload the information of an artwork
  fetch the fields from the http request
  And write it to the database
 */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    // The following fields need to be excluded as they are not part of query for filtering, they will be handled individually
    const excludedFields = [
      'page',
      'sort',
      'limit',
      'fields',
      'search',
      'category'
    ];
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
      this.query = this.query.find({
        $or: [
          { artist: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { title: { $regex: keyword, $options: 'i' } }
        ]
      });
    }
    return this;
  }

  searchCategory() {
    // 1.7) search keyword in artist, description, and title field
    if (this.queryString.category) {
      const cate = this.queryString.category;
      if (cate === 'isForDownload') {
        this.query = this.query.find({
          isForDownload: true
        });
      } else if (cate === 'isForRental') {
        this.query = this.query.find({
          isForRental: true
        });
      } else if (cate === 'isForSale') {
        this.query = this.query.find({
          isForSale: true
        });
      } else if (cate === 'PhotoRepo') {
        this.query = this.query.find({
          isForDownload: true,
          download_price: 0
        });
      }
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
    .searchCategory()
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
    .searchCategory()
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

exports.getArtworkById = catchAsync(async (req, res, next) => {
  const { id } = req.query;

  if (!id) {
    return next(
      new AppError('Please provide an id to get Artwork objects.', 400)
    );
  }

  const a = await ArtWork.findOne({ _id: id });

  res.status(200).json({
    status: 'success',
    a
  });
});

exports.uploadArtInfo = catchAsync(async (req, res, next) => {
  await User.findOne({ name: req.body.artist }, function(err, doc) {
    if (err) {
      console.log(err);
    }
    if (!doc) {
      return next(new AppError('The artist need to sign up first', 401));
    }
    const artwork = new ArtWork({
      title: req.body.title,
      download_price: req.body.downloadPrice,
      rental_price: req.body.rentalPrice,
      sale_price: req.body.salePrice,
      description: req.body.description,
      artist: req.body.artist,
      artistEmail: req.body.artistEmail,
      creationTime: req.body.creationTime,
      medium: req.body.medium,
      width: req.body.width,
      height: req.body.height,
      isForDownload: req.body.isForDownload,
      isForSale: req.body.isForDownload,
      isForRental: req.body.isForRental,
      isSoldorRented: req.body.isSoldorRented,
      ccLicense: req.body.ccLicense
    });
    artwork.save();
  });
  res.status(200).end('FileInfo upload successful!');
});

exports.uploadArtFileByTitleArtistOptions = catchAsync(
  async (req, res, next) => {
    await console.log('options!');
    res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
    res.status(200).send('preflight response ok');
  }
);
/*
  Controller method: upload the file of the artwork by the title and artist
  Note that the title of an artwork is only unique when combined with its artist
 */
exports.uploadArtFileByTitleArtist = catchAsync(async (req, res, next) => {
  if (req.file.length === 0) {
    return next(new AppError('Please provide the file', 401));
  }
  /* fetch fields from http request and then reassmable it to a database record
      The API has different fields with the database */
  const { file } = req;
  const fileInfo = {};
  fileInfo.mimetype = file.mimetype;
  fileInfo.originalname = file.originalname;
  fileInfo.size = file.size;
  fileInfo.filename = `${req.body.artist}-${req.body.title}_origin.${
    file.mimetype.split('/')[file.mimetype.split('/').length - 1]
  }`; //rename the file
  fileInfo.path = `data/uploads/${req.body.artist}/artworkFiles/original/${fileInfo.filename}`;
  /* call the API of Model Artwork, find the target artwork by title and artist
   info and upload the file */
  await ArtWork.findOneAndUpdate(
    {
      title: req.body.title,
      artist: req.body.artist
    },
    { artworkfile: fileInfo, isPictureUpload: true },
    function(err, doc) {
      if (doc === null) {
        fs.unlinkSync(`data/uploads/${file.filename}`);
        return console.log(err);
      } //If the document is not found in the database, then delete the uploaded file right away
      fs.mkdir(
        `data/uploads/${req.body.artist}/artworkFiles/original`,
        { recursive: true },
        error => {
          if (!error) {
            fs.renameSync(
              `data/uploads/${file.filename}`,
              `data/uploads/${req.body.artist}/artworkFiles/original/${fileInfo.filename}`
            );
          }
        }
      );
      //Save the file in the file system and rename the binary name to actual file name
      //The code for save file path is in artWorkRoutes.js
      console.log(doc);
    }
  );
  res.status(200).json({
    path: fileInfo.path
  });
  res.end('File upload successful!');
});

exports.getFileInfoByTitleArtist = catchAsync(async (req, res, next) => {
  await ArtWork.findOne(
    {
      title: req.query.title,
      artist: req.query.artist
    },
    function(err, doc) {
      if (err) {
        return next(new AppError('Query Failed'), 401);
      }
      if (doc == null) {
        return next(new AppError('The artwork does not exist'), 401);
      }
      res.send(doc);
    }
  );
});

exports.deleteArtworkByTitleArtist = catchAsync(async (req, res, next) => {
  await ArtWork.deleteOne(
    {
      title: req.query.title,
      artist: req.query.artist
    },
    function(err, doc) {
      if (err) {
        console.log(err);
      } else {
        res.end('> The artwork has been deleted!');
      }
      if (doc == null) {
        //If the artwork is not found in the dataBase
        return next(new AppError('Error: The artwork does not exist'));
      }
    }
  );
});

exports.deleteArtworkFilesByTitleArtist = catchAsync(async (req, res, next) => {
  await ArtWork.findOne(
    {
      title: req.query.title,
      artist: req.query.artist
    },
    function(err, doc) {
      if (err) {
        console.log(err);
      }
      if (doc == null) {
        //If the artwork is not found in the dataBase
        return next(new AppError('Error: The artwork does not exist'));
      }
      if (typeof doc.artworkfile === 'undefined') {
        res.end('> No artwork file exist, deletion is not needed');
      } else {
        fs.access(
          `${doc.artworkfile.path.split('.')[0]}.${
            doc.artworkfile.path.split('.')[1]
          }`,
          fs.constants.R_OK,
          error => {
            if (error) {
              console.log(err);
            } else {
              fs.unlinkSync(
                `${doc.artworkfile.path.split('.')[0]}-small.${
                  doc.artworkfile.path.split('.')[1]
                }`
              );

              fs.unlinkSync(
                `${doc.artworkfile.path.split('.')[0]}-medium.${
                  doc.artworkfile.path.split('.')[1]
                }`
              );

              fs.unlinkSync(
                `${doc.artworkfile.path.split('.')[0]}-large.${
                  doc.artworkfile.path.split('.')[1]
                }`
              );
              fs.unlinkSync(
                `${doc.artworkfile.path.split('.')[0]}.${
                  doc.artworkfile.path.split('.')[1]
                }`
              );
            }
          }
        );
      }
      res.end('> artwork files deleted');
    }
  );
});

exports.getFilepathByTitleArtist = catchAsync(async (req, res, next) => {
  const size = req.query.imageSize;
  await ArtWork.findOne(
    {
      title: req.query.title,
      artist: req.query.artist
    },
    function(err, doc) {
      if (err) {
        console.log(err);
      }
      if (doc == null) {
        //If the artwork is not found in the dataBase
        return next(new AppError('Error: The artwork does not exist'));
      }
      if (typeof doc.artworkfile === 'undefined') {
        //If there is no image file's information in the database
        res.status(401, 'Error: artwork file information does not found!');
        res.download(notFound, function(downloadError) {
          if (downloadError) console.log(downloadError);
          else console.log('NotFound Image send');
        });
      } else {
        // Assmble imagefile path by query result
        const imagePath = `${doc.artworkfile.path.split('.')[0]}${size}.${
          doc.artworkfile.path.split('.')[1]
        }`;
        console.log(imagePath);
        fs.access(imagePath, fs.constants.R_OK, error => {
          if (error) {
            //If image file is not found in the filesystem
            res.status(401, `Error: Image file does not exist`);
            res.download(notFound, function(downloadError) {
              if (downloadError) console.log(downloadError);
              else console.log('NotFound Image send');
            });
            //return next(new AppError('Image file does not exist', 401));
          }
          res.download(imagePath, function(downloadError) {
            if (downloadError) console.log(downloadError);
            else console.log('Image send');
          });
        });
      }
    }
  );
});

exports.deleteAll = catchAsync(async (req, res, next) => {
  await ArtWork.deleteMany({});
  res.send('All artwork deleted');
});

exports.getArtworkListByArtist = catchAsync(async (req, res, next) => {
  await ArtWork.find(
    {
      artist: req.query.artist
    },
    function(err, doc) {
      if (err) {
        console.log(err);
        return next(new AppError('The artist has no artwork'));
      }
      console.log('All artwork quried!');
      res.send(doc);
    }
  );
});

exports.getArtworkFileByArtistEmail = catchAsync(async (req, res, next) => {
  await ArtWork.find(
    {
      artistEmail: req.query.artistEmail
    },
    function(err, doc) {
      if (err) {
        console.log(err);
        return next(new AppError('The artist has no artwork'));
      }
      let x = 0;
      const arr = [];
      for (x; x < doc.length; x += 1) {
        let fPath = 'data/utils/notfound.png';
        if (typeof doc[x].artworkfile !== 'undefined') {
          fPath = doc[x].artworkfile.path;
        }
        const record = {
          title: doc[x].title,
          artist: doc[x].artist,
          createTime: doc[x].creationTime,
          downloadPrice: [],
          rentalPrice: [],
          salePrice: [],
          medium: doc[x].medium,
          filePath: fPath
        };
        if (typeof doc[x].download_price !== 'undefined') {
          record.downloadPrice = doc[x].download_price;
        }
        if (typeof doc[x].rental_price !== 'undefined') {
          record.rentalPrice = doc[x].rental_price;
        }
        if (typeof doc[x].sale_price !== 'undefined') {
          record.salePrice = doc[x].sale_price;
        }
        arr.push(record);
      }
      res.send(arr);
    }
  );
});

exports.getArtworkFileByArtist = catchAsync(async (req, res, next) => {
  const lowerBound = req.query.lowerbound;
  const higherBound = req.query.higherbound;
  await ArtWork.find(
    {
      artist: req.query.artist
    },
    function(err, doc) {
      if (err) {
        console.log(err);
        return next(new AppError('The artist has no artwork'));
      }
      let x = parseInt(lowerBound, 10);
      const arr = [];
      for (x; x <= higherBound; x += 1) {
        if (doc[x] !== undefined) {
          if (doc[x].isPictureUpload) {
            const records = {
              title: doc[x].title,
              artist: doc[x].artist,
              filename: doc[x].artworkfile.filename,
              path: doc[x].artworkfile.path
            };
            arr.push(records);
          } else {
            const records = {
              title: doc[x].title,
              artist: doc[x].artist
            };
            arr.push(records);
          }
        }
      }
      res.send(arr);
    }
  );
});
