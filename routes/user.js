var express = require('express');
var router = express.Router();
var passport = require('passport');
var csrf = require('csurf');

var Cart = require('../models/cart')
var Order = require('../models/order');
const order = require('../models/order');

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, (req,res,next)=>{
    Order.find({user: req.user}, (err,orders)=>{
      if(err) {
        return res.write('Error');
      }
      var cart;
      orders.forEach((order)=>{
        cart = new Cart(order.cart);
        order.items = cart.generateArray();
      });
    //   console.log(orders)
      res.render('user/profile', {orders: orders});
    })
});

router.get('/signout', isLoggedIn, (req,res,next)=>{
    req.logout();
    res.redirect('/');
});

router.get('*', notLoggedIn, (req,res,next)=>{
    next();
});

router.get('/signup', (req,res,next)=>{
  var messages = req.flash('error');
  res.render('user/signup', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/signup', passport.authenticate('local.signup', {
  failureRedirect: '/user/signup',
  failureFlash: true
}), (req,res,next)=>{
  if(req.session.oldUrl) {
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/user/profile');
  }
});

router.get('/signin', (req,res,next)=>{
  var messages = req.flash('error');
  res.render('user/signin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
})

router.post('/signin', passport.authenticate('local.signin', {
  failureRedirect: '/user/signin',
  failureFlash: true
}), (req,res,next)=>{
  if(req.session.oldUrl) {
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/user/profile');
  }
})

module.exports = router;

function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req,res,next) {
    if(!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}