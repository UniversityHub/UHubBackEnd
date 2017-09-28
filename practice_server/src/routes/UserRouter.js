var express = require('express');
var app = express();
var UserRouter = express.Router();

// Require UserInfo model in our routes module
var UserInfo = require('../models/UserInfo');

// Defined store route
UserRouter.route('/add/post').post(function (req, res) {
  var info = new UserInfo(req.body);
      info.save()
    .then(info => {
    res.json('UserInfo added successfully');
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
});

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
