var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var port = 4200;
var cors = require('cors');
var PiazzaRouter = express.Router();
var piazza = require('piazza-api');

var PiazzaInfo = require('../models/PiazzaInfo');

// Defined get data(index or listing) route
PiazzaRouter.route('/').get(function (req, res) {
  PiazzaInfo.find(function (err, itms){
    if(err){
      console.log('there is an error');
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
});

// Update Schools for specific User
PiazzaRouter.route('/save-schools').post(function (req, res) {
    var info = req.body;
    var user = info['userID'];
    var pass = info['userPassword'];
    var courseList = info['courseList'];
    console.log(courseList);
    var query = {userID: user, userPassword: pass};
    PiazzaInfo.findOneAndUpdate(query, { courseList: courseList }, function (err, itms){
      if(err){
        console.log(err);
      }
      else {
        res.json(itms);
      }
    });
});

// Get Piazza information
PiazzaRouter.route('/get-piazza').post(function (req, res) {
  var body = req.body;
  var userID = body['userID'];
  var pass = body['userPassword'];

  var info = new PiazzaInfo(req.body);
  PiazzaInfo.find({userID: userID}, function(err, items) {
    if(err){

      console.log('there is an error');
      console.log(err);
    }
    else {
      if(items.length) {
        return piazza.login(userID, pass)
          .then(function(user) {
            return res.json(user);
          })
          .catch(function(err) {
            return res.json(err)
          })
        // return res.json(login(user, pass))
      }else {
        info.save()
        .then(info => {
          piazza.login(userID, pass)
            .then(function(user) {
              return res.json(user);
            })
            .catch(function(err) {
              return res.json(err)
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

  piazza.login(userID, pass)
    .then(function(user) {
      var classArr = user.getClassesByRole('student');
      var index = 0;
      classArr.filter((elem, key) => {
        if(elem.courseNumber === currClass) index = key;
      })
      var classItem = user.getClassesByRole('student')[index];

      var allContent = classItem.filterByFolder(currFolder)
        .then(result => {
          var contents = result.map((feedItem, key) => {
            return feedItem.toContent()
          })
          return Promise.all(contents);
        })
        .catch(err => console.log(err))

      allContent.then(result => {
        var cache = [];
        var str = JSON.stringify(result, function(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        });
        res.json(str);
      })
    })
  .catch(err => {
    console.log('there is an error');
    console.log(err);
  });
})

PiazzaRouter.route('/posts/question').post(function (req, res) {
  var info = req.body;
  var postObj = info['postObj'];
  var username = info['username'];
  var password = info['password'];
  var classID = info['classID'];
  var title = info['title'];
  var content = info['content'];

  piazza.login(username, password)
    .then(function(user) {
      user.postQuestion(classID, title, content, postObj)
      .then(result => {
        console.log(result);
        res.json(result);
      });
    })

})

PiazzaRouter.route('/posts/note').post(function (req, res) {
  var info = req.body;
  var postObj = info['postObj'];
  var username = info['username'];
  var password = info['password'];
  var classID = info['classID'];
  var title = info['title'];
  var content = info['content'];

  piazza.login(username, password)
    .then(function(user) {
      user.postNote(classID, title, content, postObj)
      then(result => {
        console.log(result);
        res.json(result);
      });
    })

})


PiazzaRouter.route('/posts/answer').post(function (req, res) {
  var info = req.body;
  var postObj = info['postObj'];
  var answer = info['answer'];

  var username = postObj.user;
  var password = postObj.password;

  console.log(username);
  console.log(password);

  piazza.login(username, password)
    .then(function(user) {
      var classItem = user.getClassByID(postObj.classID);

      var allContent = classItem.filterByFolder(postObj.folders[0])
        .then(result => {
          var initQ = result.find(elem => {
                return elem.id === postObj.id;
            })
            initQ.toContent().then(question => {
                //console.log(question);
                const obj = {
                    anonymous: "full"
                }
                user.answerQuestion(question, answer, obj).then(postAns => {
                    console.log(postAns);
                })
            })

          // /*var contents = */result.map((feedItem, key) => {
          //   /*return*/ feedItem.toContent()
          //     .then(result2 => {
          //         var cache = [];
          //         var str = JSON.stringify(result2, function(key, value) {
          //           if (typeof value === 'object' && value !== null) {
          //             if (cache.indexOf(value) !== -1) {
          //               // Circular reference found, discard key
          //               return;
          //             }
          //             // Store value in our collection
          //             cache.push(value);
          //           }
          //           return value;
          //         });
          //         if(result2.id === postObj.id) {
          //           // console.log(JSON.parse(str))
          //           user.answerQuestion(JSON.parse(str), answer, {anonymous: "full"})
          //             .then(result => res.json(result))
          //             .catch(err => console.log(err))
          //           return;
          //         }
          //
          //     })
          // })
          //return Promise.all(contents);
        })
        .catch(err => console.log(err))

      // allContent.then(result => {
      //   var str = JSON.stringify(result, function(key, value) {
      //       if (typeof value === 'object' && value !== null) {
      //           if (cache.indexOf(value) !== -1) {
      //               // Circular reference found, discard key
      //               return;
      //           }
      //           // Store value in our collection
      //           cache.push(value);
      //       }
      //       return value;
      //   });
      //   console.log(str);

      // })


    })
    .catch(err => {
      console.log('there is a login error');
      console.log(err);
    });
})

module.exports = PiazzaRouter;
