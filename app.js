const path = require('path');
const express = require('express');
const morgan = require('morgan');
const hpp = require('hpp');

const swaggerUI = require('swagger-ui-express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const swaggerDoc = require('./swagger.json');
const AppError = require('./utils/appError');
const testRouter = require('./routes/testRoutes');
const userRouter = require('./routes/userRoutes');
const artRouter = require('./routes/artWorkRoutes');
const experRouter = require('./routes/experienceRoutes');
const transRouter = require('./routes/transactionRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'server_render_views'));

// Set security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 3600 * 1000,
  message: 'Too many request from this IP...'
});
app.use('/api', limiter);

// body parser, reading data from req.body, also limiting the data in the request body
app.use(
  express.json({
    limit: '10kb'
  })
);

// Data sanitization against NoSQL query injection. eg: {"email": { "$gt": ""}, "password": "newpass123"} can log in
app.use(mongoSanitize()); // basically remove the $ sign in the query
// Data sanitization against XSS attack (we also protect against it in createAndSendToken() where we only allow http to access and modify the cookie)
app.use(xss()); // replace the html tag with other codes in the parameters eg: '<' => '&lt;'

app.get('/', (req, res) => {
  res.status(200).json({ time: Date.now() });
});

// Prevent parameter pollution, so like sort=price&sort=date, this duplicate sort parameter will be treated to only execute the last one
// Note: you can define a whitelist inside hpp() which specifies that some fields allow duplicate define to query
// eg: price=8&price=9, get the artworks of price 8 and 9, should be allowed
app.use(hpp());

// This is a custom middleware, it adds a time stamp(of the time the API is requested) to all API return
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Allow CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET,HEAD,OPTIONS,POST,PUT,DELETE,CONNECT,TRACE,PATCH'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

// 3) API ROUTES
app.use('/api/v1', testRouter); 
app.use('/api/v1/users', userRouter);
app.use('/api/v1/transactions', transRouter);
app.use('/api/v1/arts', artRouter);
app.use('/api/v1/expers', experRouter);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));

// 4) Error handling middleware
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`), 404);
});

app.use(globalErrorHandler);

module.exports = app;
