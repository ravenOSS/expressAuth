var express = require('express');
var User = require('../models/user');
var passport = require('passport');

var router = express.Router();

function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('info', 'You must be logged in.');
    res.redirect('/');
  }
}

router.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash('error');
  res.locals.infos = req.flash('info');
  next();
});

router.get('/', function (req, res) {
  res.render('frontpage');
});

router.get('/signup', function (req, res) {
  res.render('signup');
});

router.post('/signup', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var fname = req.body.fname;
  var lname = req.body.lname;
  var email = req.body.email;
  var telephone = req.body.telephone;

  User.findOne({ username: username }, function (err, user) {
    if (err) { return next(err); }
    if (user) {
      req.flash('error', 'User already exists');
      return res.redirect('/signup');
    }

    var newUser = new User({
      username: username,
      password: password,
      fname: fname,
      lname: lname,
      email: email,
      telephone: telephone
    });
    newUser.save(next);
  });
}, passport.authenticate('login', {
  successRedirect: '/users',
  failureRedirect: '/signup',
  failureFlash: true
}));

router.get('/login', function (req, res) {
  res.render('login');
});

router.post('/login', passport.authenticate('login', {
  successRedirect: '/users',
  failureRedirect: '/signup',
  failureFlash: true
}));

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

/* render datatable page. */
router.get('/table', ensureAuthenticated, function (req, res, next) {
  res.render('userdetail', { title: 'dataTable' });
});

/* This is the api route to get the datatable ajax data */
router.get('/usertable', function (req, res, next) {
  User.find()
    .sort({ createdAt: 'descending' })
    .exec(function (err, users) {
      if (err) { return next(err); }
      res.json(users);
    });
});

/* GET users listing. */
router.get('/users', ensureAuthenticated, function (req, res, next) {
  User.find()
    .sort({ createdAt: 'descending' })
    .exec(function (err, users) {
      if (err) { return next(err); }
      res.render('userlist', { users: users });
    });
});

router.get('/users/:username', function (req, res, next) {
  User.findOne({ username: req.params.username }, function (err, user) {
    if (err) { return next(err); }
    if (!user) { return next(404); }
    res.render('profile', { user: user });
  });
});

router.get('/edit', ensureAuthenticated, function (req, res) {
  res.render('edit');
});

router.post('/edit', ensureAuthenticated, function (req, res, next) {
  req.user.displayName = req.body.displayname;
  req.user.bio = req.body.bio;
  req.user.save(function (err) {
    if (err) {
      next(err);
      return;
    }
    req.flash('info', 'Profile updated!');
    res.redirect('/users');
  });
});

module.exports = router;
