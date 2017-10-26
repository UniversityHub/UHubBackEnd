var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var port = 4200;
var cors = require('cors');
var url = 'mongodb://cconcep:Republica1!@ds141454.mlab.com:41454/node_tutorial'
var ToDoListRouter = express.Router();

// Require UserInfo model in our routes module
var ToDoList = require('../models/ToDoList');


// Defined get data(index or listing) route
ToDoListRouter.route('/').get(function (req, res) {
  ToDoList.find(function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
});


// Defined store route
ToDoListRouter.route('/initialize').post(function (req, res) {
  var info = new ToDoList(req.body);
      info.save()
    .then(info => {
      res.json('TodoList added successfully');
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
});

//Retreives and sends ToDo List of specific user
ToDoListRouter.route('/get-user-list').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];

  ToDoList.find({userID: user}, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})

//deletes a todo from the list
ToDoListRouter.route('/')

// Revise password of specific UserID
ToDoListRouter.route('/add-entry').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];
  var items = info['items'];

  var query = {userID: user};
  ToDoList.findOneAndUpdate(query, { items: items }, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      res.json(itms);
    }
  });
})


module.exports = ToDoListRouter;
