var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var port = 4200;
var cors = require('cors');
var url = 'mongodb://cconcep:Republica1!@ds141454.mlab.com:41454/node_tutorial'
var UserRouter = express.Router();

// Require UserInfo model in our routes module
var UserInfo = require('../models/UserInfo');

// Defined store route
UserRouter.route('/add/post').post(function (req, res) {
  var info = new UserInfo(req.body);
  console.log(info);
      info.save()
    .then(info => {
      //var obj = {bool: true}
      res.json('UserInfo added successfully');
      //res.json(info);
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
});

// Authenticate user with ID and Password
UserRouter.route('/authenticate-password').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];
  var pass = info['userPassword'];

  if(user === '') user = '123';
  UserInfo.find({ userID: user, userPassword: pass}, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})

// Retrieve list of APIs
UserRouter.route('/get-apis').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];
  var pass = info['userPassword'];
  console.log(info);

  UserInfo.find({ userID: user, userPassword: pass}, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})

// Authenticate user with ID and Email
UserRouter.route('/authenticate-email').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];
  var email = info['userEmail'];

  if(user === '') user = '123';
  UserInfo.find({ userID: user, userEmail: email}, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})

//Check if email exists in database
UserRouter.route('/check-email').post(function (req, res) {
  var info = req.body;
  var email = info['userEmail'];

  UserInfo.find({userEmail: email}, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})

//Check if username exists in database
UserRouter.route('/check-user').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];

  if(user === '') user = '123';
  UserInfo.find({userID: user}, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})

// Revise password of specific UserID
UserRouter.route('/revise-password').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];
  var pass = info['userPassword'];

  if(user === '') user = '123';
  var query = {userID: user};

  UserInfo.findOneAndUpdate(query, { userPassword: pass }, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})

// Update API list of specific USER
UserRouter.route('/save-api').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];
  var pass = info['userPassword'];
  var api = info['apiLogin'];

  if(user === '') user = '123';
  var query = {userID: user, userPassword: pass};

  UserInfo.findOneAndUpdate(query, { apiLogin: api }, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      console.log(itms);
      res.json(itms);
    }
  });
})

// Defined get data(index or listing) route
UserRouter.route('/').get(function (req, res) {
  UserInfo.find(function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
});


var nodemailer = require('nodemailer');

//Sends email to user
UserRouter.route('/send-email').post(function (req, res) {
      var sender = 'smtps://uhubcontact%40gmail.com';
      var password = 'Uhubpassword';
      var transporter = nodemailer.createTransport(sender + ':' + password + '@smtp.gmail.com');
      let mailOptions = {
          from: '"UniversityHub" <uhubcontact@gmail.com>', // sender address
          to: req.body.to, // list of receivers
          subject: req.body.subject, // Subject line
          text: req.body.body, // plain text body
          html: req.body.body, // html body
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log('Message %s sent: %s', info.messageId, info.response);
              res.render('index');
          });
});
//
// // Defined edit route
// UserRouter.route('/edit/:id').get(function (req, res) {
//   var id = req.params.id;
//   UserInfo.findById(id, function (err, info){
//       res.json(info);
//   });
// });
//
// //  Defined update route
// UserRouter.route('/update/:id').post(function (req, res) {
//   UserInfo.findById(req.params.id, function(err, info) {
//     if (!info)
//       return next(new Error('Could not load Document'));
//     else {
//       // do your updates here
//       info.userID = req.body.userID;
//
//       info.save().then(info => {
//           res.json('Update complete');
//       })
//       .catch(err => {
//             res.status(400).send("unable to update the database");
//       });
//     }
//   });
// });
//
// // Defined delete | remove | destroy route
// UserRouter.route('/delete/:id').get(function (req, res) {
//   UserInfo.findByIdAndRemove({_id: req.params.id},
//        function(err, info){
//         if(err) res.json(err);
//         else res.json('Successfully removed');
//     });
// });

module.exports = UserRouter;
