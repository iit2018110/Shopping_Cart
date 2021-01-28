var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

passport.serializeUser((user, done)=>{
    done(null, user.id);
});

passport.deserializeUser((id, done)=>{
    User.findById(id, (err, user)=>{
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done)=>{
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid Password').notEmpty().isLength({min:4});
    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach((error)=>{
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages))
    }
    User.findOne({'email': email}, (err, user)=> {
        if(err) {
            return done(err);
        }
        if(user) {
            return done(null, false, {message: 'Email is already in use.'});
        }

        var newUser = new User();
        const hash = bcrypt.hashSync(password, 12);
        newUser.email = email;
        newUser.password = hash;
        newUser.save((err,result)=>{
            if(err) {
                return done(err);
            }
            return done(null, newUser)
        });
    });
}))

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();
    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach((error)=>{
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages)); 
    }
    User.findOne({'email': email}, (err, user)=> {
        if(err) {
            return done(err);
        }
        if(!user) {
            return done(null, false, {message: 'No user found with this email'});
        }
        if(!bcrypt.compareSync(password,user.password)) {
            return done(null, false, {message: 'Wrong Password'})
        }
        
        return done(null,user);
    });
}))