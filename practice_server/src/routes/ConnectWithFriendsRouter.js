var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var port = 4200;
var cors = require('cors');
var ConnectRouter = express.Router();
var Connect = require('../models/ConnectWithFriends');

//initialize
ConnectRouter.route('/initialize').post(function (req, res) {
  var info = new Connect(req.body);
      info.save()
    .then(info => {
      res.json('List added successfully');
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
});

//gets all users
ConnectRouter.route('/').get(function (req, res) {
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
ConnectRouter.route('/all').post(function (req, res) {
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
ConnectRouter.route('/friends').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];

  Connect.find({ userID: user}, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})

//find user and connect and save to freinds list
ConnectRouter.route('/add-friend').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];
  var friends = info['friends'];
  var friend = info['friend'];

  var query = {userID: user};
  Connect.findOneAndUpdate(query, { friends: friends }, function (err, frnds){
    if(err){
      console.log(err);
    }
    else {
      var friendQuery = {userID: friend};
      Connect.findOne(friendQuery, function (err, result){
        if(err){
          console.log(err);
        }
        else {
            console.log(result);
            let friendFriends = result.friends;
            friendFriends.push(user);
            Connect.findOneAndUpdate(friendQuery, { friends: friendFriends }, function (err, final){
              if(err){
                console.log(err);
              }
              else {
                console.log("successful friends");
              }
            })
        }
      })
      //console.log(frnds);
      res.json(frnds);
    }
  });
})

module.exports = ConnectRouter;
