var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var port = 4200;
var cors = require('cors');
var url = 'mongodb://cconcep:Republica1!@ds141454.mlab.com:41454/node_tutorial'
var ToDoListRouter = express.Router();

// Require UserInfo model in our routes module
var ToDoList = require('../models/todo');

// Defined route
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


// Defined get data(index or listing) route
ToDoListRouter.route('/').get(function (req, res) {
  ToDoList.find(function (err, tasks){
    if(err){
      console.log(err);
    }
    else {
      res.json(tasks);
    }
  });
});

//find task and save and update
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
      console.log(itms);
      res.json(itms);
    }
  });
})

//deletes task
ToDoListRouter.route('/delete-entry').post(function(req, res){
  var info = req.body;
  var user = info['userID'];
  var items = info['items'];

  var query = {userID: user};
  ToDoList.findOneAndUpdate(query, {items:items}, function(err,itms){
    if(err){
      console.log(err);
    }
    else{
      console.log(itms);
      res.json(itms);
    }
  });
})

//Save a task
/*ToDoListRouter.post('/saveTask',function(req,res,next){
  var taskSaved = req.body;
  var task = taskSaved['entries'];
  //var user = info['userID'];
  //var items = info['items'];
  // if(!task.title|| (task.isDone + '')){
  //   res.status(400);
  //   res.json({
  //     "error": "Bad Data"
  //   });
  // }
  //else{
    ToDoList.save(function(err,taskSaved, numAffected){
      if(err){
        console.log(err);
        res.send(err);
      }
      console.log(task);
      res.json(task);
    })
    // .then(result => console.log(result))
  //}
});*/

/*//Get all tasks
ToDoListRouter.route('/get-user-list').post(function (req, res) {
  var info = req.body;
  var user = info['userID'];

  ToDoList.find({userID: user}, function (err, itms){
    if(err){
      console.log(err);
    }
    else {
      iems.
      console.log(itms);
    }
  });
})*/


module.exports = ToDoListRouter;
