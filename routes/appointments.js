'use strict';

const express = require('express');
const momentTimeZone = require('moment-timezone');
const moment = require('moment');
const Appointment = require('../models/appointment');
const router = new express.Router();


const getTimeZones = function() {
  return momentTimeZone.tz.names();
};

var passport = require('passport');
var bcrypt = require('bcryptjs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  // res.send('respond with a resource');
  res.render('appointments/user.hbs', {user: req.user}); // display user.hbs
});

router.get('/logout', function(req, res) {
    req.logout(); // passport provide it
    res.redirect('/users'); // Successful. redirect to localhost:3000/users
});

function loggedIn(req, res, next) {
  if (req.user) {
    next(); // req.user exists, go to the next function (right after loggedIn)
  } else {
    res.redirect('/users/login');
    // user doesn't exists redirect to localhost:3000/users/login
  }
}

function notLoggedIn(req, res, next) {
  if (!req.user) {
    next();
  } else {
    res.redirect('appointments/index');
  }
}

router.get('/appointments/login', notLoggedIn, function(req, res){
    //success is set true in sign up page
    //req.flash('error') is mapped to 'message' from passport middleware
    res.render('appointments/login.hbs', {success:req.query.success, errorMessage: req.flash('error')});
});

router.post('/appointments/login',
  // This is where authentication happens - app.js
  // authentication locally (not using passport-google, passport-twitter,... passport-github...)
  passport.authenticate('local', {failureRedirect: 'login', failureFlash: true}),
  function(req, res, next) {
    res.redirect('/appointments/index');
    // Successful. redirect to localhost:3000/users/profile
});

// GET: /appointments
router.get('/appointments', function(req, res, next) {
  Appointment.find()
    .then(function(appointments) {
      res.render('appointments/index', {appointments: appointments});
    });
});

// GET: /appointments/create
router.get('/create', function(req, res, next) {
  res.render('appointments/create', {
    timeZones: getTimeZones(),
    appointment: new Appointment({name: '',
                                  phoneNumber: '',
                                  notification: '',
                                  timeZone: '',
                                  time: ''})});
});

// POST: /appointments
router.post('/', function(req, res, next) {
  const name = req.body.name;
  const phoneNumber = req.body.phoneNumber;
  const notification = req.body.notification;
  const timeZone = req.body.timeZone;
  const time = moment(req.body.time, 'MM-DD-YYYY hh:mma');

  const appointment = new Appointment({name: name,
                                       phoneNumber: phoneNumber,
                                       notification: notification,
                                       timeZone: timeZone,
                                       time: time});
  appointment.save()
    .then(function() {
      res.redirect('/');
    });
});

// GET: /appointments/:id/edit
router.get('/:id/edit', function(req, res, next) {
  const id = req.params.id;
  Appointment.findOne({_id: id})
    .then(function(appointment) {
      res.render('appointments/edit', {timeZones: getTimeZones(),
                                       appointment: appointment});
    });
});

// POST: /appointments/:id/edit
router.post('/:id/edit', function(req, res, next) {
  const id = req.params.id;
  const name = req.body.name;
  const phoneNumber = req.body.phoneNumber;
  const notification = req.body.notification;
  const timeZone = req.body.timeZone;
  const time = moment(req.body.time, 'MM-DD-YYYY hh:mma');

  Appointment.findOne({_id: id})
    .then(function(appointment) {
      appointment.name = name;
      appointment.phoneNumber = phoneNumber;
      appointment.notification = notification;
      appointment.timeZone = timeZone;
      appointment.time = time;

      appointment.save()
        .then(function() {
          res.redirect('/');
        });
    });
});

// POST: /appointments/:id/delete
router.post('/:id/delete', function(req, res, next) {
  const id = req.params.id;

  Appointment.remove({_id: id})
    .then(function() {
      res.redirect('/');
    });
});

module.exports = router;
