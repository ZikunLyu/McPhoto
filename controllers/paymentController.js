const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const ArtWork = require('../models/artWorkModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const artwork = await ArtWork.findById(req.params.artworkId);

  // 2) Create a checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}`,
    cancel_url: `${req.protocol}://${req.get('host')}/gallery`,
    customer_email: req.user.email,
    client_reference_id: req.params.artworkId,
    line_items: [
      {
        name: `${artwork.title}`,
        description: artwork.description,
        images: ['https://picsum.photos/300/200'],
        amount: artwork.price * 100,
        currency: 'cad',
        quantity: 1
      }
    ]
  });

  // 3) send session to the client
  res.status(200).json({
    status: 'success',
    session
  });
});
