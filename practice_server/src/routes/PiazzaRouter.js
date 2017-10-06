var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var port = 4200;
var cors = require('cors');
var PiazzaRouter = express.Router();
var piazza = require('piazza-api');

var PiazzaInfo = require('../models/PiazzaInfo');

// function login(user, pass) {
//   console.log('am i here');
//   piazza.login(user, pass)
//     .then(user => user)
// }

// Defined get data(index or listing) route
PiazzaRouter.route('/').get(function (req, res) {
  PiazzaInfo.find(function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
});

//// Update Schools for specific User
// PiazzaRouter.route('/save-schools').post(function (req, res) {
//     var info = req.body;
//     var user = info['userID'];
//     var pass = info['userPassword'];
//     var courseList = info['courseList'];
//     console.log(courseList);
//     var query = {userID: user, userPassword: pass};
//     PiazzaInfo.findOneAndUpdate(query, { courseList: courseList }, function (err, itms){
//       if(err){
//         console.log(err);
//       }
//       else {
//         res.json(itms);
//       }
//     });
// });

// Get Piazza information
PiazzaRouter.route('/get-piazza').post(function (req, res) {
  var body = req.body;
  var userID = body['userID'];
  var pass = body['userPassword'];

  var info = new PiazzaInfo(req.body);
  PiazzaInfo.find({userID: userID}, function(err, items) {
    if(err){
      console.log(err);
    }
    else {
      if(items.length) {
        return piazza.login(userID, pass)
          .then(function(user) {
            return res.json(user);
          })
        // return res.json(login(user, pass))
      }else {
        info.save()
        .then(info => {
          piazza.login(userID, pass)
            .then(function(user) {
              return res.json(user);
            })
          // return res.json(login(userID, pass))
        })
        .catch(err => {
          res.status(400).send("unable to save to database");
        });
      }
    }
  })
})



// // Update Display variables for specific User
// PiazzaRouter.route('/update-display').post(function (req, res) {
//     var info = req.body;
//     var user = info['userID'];
//     var pass = info['userPassword'];
//     var display = info['display'];
//     var query = {userID: user, userPassword: pass};
//
//     PiazzaInfo.findOneAndUpdate(query, { display: display }, function (err, itms){
//       if(err){
//         console.log(err);
//       }
//       else {
//         res.json(itms);
//       }
//     });
// });

// //Get display of current user
// PiazzaRouter.route('/get-display').post(function (req, res) {
//     var info = req.body;
//     var user = info['userID'];
//     var pass = info['userPassword'];
//     var query = {userID: user, userPassword: pass};
//
//     PiazzaInfo.find(query, function (err, itms){
//       if(err){
//         console.log(err);
//       }
//       else {
//         res.json(itms);
//       }
//     });
// });

// Get Piazza Active Courses and their respective feeds
PiazzaRouter.route('/posts').post(function (req, res) {
  var info = req.body;
  var userID = info['userID'];
  var pass = info['userPassword'];
  var currClass = info.currClass;
  var currFolder = info.currFolder;

  console.log(currClass);
  console.log(currFolder);

  piazza.login(userID, pass)
    .then(function(user) {
      var classArr = user.getClassesByRole('student');
      var index = 0;
      classArr.filter((elem, key) => {
        if(elem.courseNumber === currClass) index = key;
      })
      var classItem = user.getClassesByRole('student')[index];

      classItem.filterByFolder(currFolder)
        .then(result => {
          res.json(result);
        })
        .then(parsedData => parsedData)
        .catch(err => console.log(err))
    })
  .catch(err => {
    console.log(err);
  });
})

module.exports = PiazzaRouter;
