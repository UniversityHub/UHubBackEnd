var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var port = 4200;
var cors = require('cors');
var GroupsRouter = express.Router();
var Groups = require('../models/StudyGroups');
var Connect = require('../models/ConnectWithFriends');
//initialize
GroupsRouter.route('/initialize').post(function (req, res) {
  var info = new Groups(req.body);
      info.save()
    .then(info => {
      res.json('List added successfully');
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
});

//gets all users
GroupsRouter.route('/').get(function (req, res) {
  Connect.find(function (err, tasks){
    if(err){
      console.log(err);
    }
    else {
      res.json(tasks);
    }
  });
});

//gets all users
GroupsRouter.route('/all').post(function (req, res) {
  Connect.find({}, function (err, tasks){
    if(err){
      console.log(err);
    }
    else {
      console.log(tasks);
      res.json(tasks);
    }
  });
});

// Retrieve list of friends
GroupsRouter.route('/friends').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];

  Groups.find({ userID: user}, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})

//find user and connect and save to freinds list
GroupsRouter.route('/add-friend-to-group').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];
  var friends = info['friends'];

  var query = {userID: user};
  Groups.findOneAndUpdate(query, { friends: friends }, function (err, frnds){
    if(err){
      console.log(err);
    }
    else {
      console.log(frnds);
      res.json(frnds);
    }
  });
})

module.exports = GroupsRouter;
