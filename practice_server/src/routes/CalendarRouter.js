var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var port = 4200;
var cors = require('cors');
var CalendarRouter = express.Router();

var CalendarInfo = require('../models/CalendarInfo');

// Defined get data(index or listing) route
CalendarRouter.route('/').get(function (req, res) {
  CalendarInfo.find(function (err, itms){
    if(err){
      console.log('there is an error');
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
});

// Defined store route
CalendarRouter.route('/initialize').post(function (req, res) {
  var info = new UserInfo(req.body);
      info.save()
    .then(info => {
      res.json('CalendarInfo added successfully');
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
});

// Retrieve list of events
CalendarRouter.route('/events').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];

  CalendarInfo.find({ userID: user}, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})

// Update Events list of specific USER
CalendarRouter.route('/events/update').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];
  var events = info['events'];
  var query = {userID: user};

  CalendarInfo.findOneAndUpdate(query, { events: events }, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})

module.exports = CalendarRouter;
