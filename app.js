const express = require('express');
const morgan = require('morgan');

const swaggerUI = require('swagger-ui-express');
const swaggerDoc = require('./swagger.json');
const AppError = require('./utils/appError');
const testRouter = require('./routes/testRoutes');
const userRouter = require('./routes/userRoutes');
const artRouter = require('./routes/artWorkRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ time: Date.now() });
});

// This is a custom middleware, it adds a time stamp(of the time the API is requested) to all API return
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) API ROUTES
app.use('/api/v1', testRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/arts', artRouter);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));

// 4) Error handling middleware
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`), 404);
});

app.use(globalErrorHandler);

module.exports = app;
