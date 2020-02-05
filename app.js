const express = require('express');
const morgan = require('morgan');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send("Hello world.");
})

// This is a custom middleware, it adds a time stamp(of the time the API is requested) to all API return 
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

module.exports = app;