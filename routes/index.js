var express = require('express');
var router = express.Router();

var Product = require('../models/product');
var Cart = require('../models/cart');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  Product.find((err, docs)=>{
    res.render('shop/index', {title : "shopping cart", products: docs, successMsg: successMsg, noMessages: !successMsg});
  })
});

router.get('/contactUs', (req,res,next)=>{
  res.render('contactUs');
});

router.get('/add-to-cart/:id', (req,res,next)=>{
  var productId = req.params.id;
  console.log("product Id is", productId);
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, (err, product)=>{
    if(err) {
      return res.redirect('/');
    }

    cart.add(product, product.id);
    req.session.cart = cart;
    res.redirect('/');
  });
});

router.get('/reduce/:id', (req,res,next)=>{
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
})

router.get('/remove/:id', (req,res,next)=>{
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
})

router.get('/shopping-cart', (req,res,next)=> {
  if(!req.session.cart) {
    return res.render('shop/shopping-cart', {products: null});
  }

  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
})

router.get('/checkout', isLoggedIn, (req,res,next)=> {
  if(!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout', isLoggedIn, (req,res,next)=> {
  if(!req.session.cart) {
    return res.redirect('/shopping-cart');
  }

  var cart = new Cart(req.session.cart);

  const stripe = require('stripe')('sk_test_51IDnYXL6UKY9DiGRqgbD1RdVmkuLb7ZtT9yv3AWO7U4S4SFUhjlKkUaMzOzSIjb6PnjgHiwQoY72D5kGCJ9G89hI00CnEZyA4W');

  // `source` is obtained with Stripe.js; see https://stripe.com/docs/payments/accept-a-payment-charges#web-create-token
    stripe.charges.create({
    amount: cart.totalPrice*100,
    currency: 'inr',
    source: req.body.stripeToken,
    description: 'My First Test Charge (created for API docs)',
  }, (err, charge)=> {
    if(err) {
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }
    var order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
      paymentId: charge.id
    });
    order.save((err, result)=>{
      if(err) {
        req.flash('error', err.message);
        return res.redirect('/checkout');
      }
      req.flash('success', 'Successfully bought product!');
      req.session.cart = null;
      res.redirect('/');
    });
  });
})

module.exports = router;

function isLoggedIn(req,res,next) {
  if(req.isAuthenticated()) {
      return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}
