var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ToDoList = new Schema({
  userID: {
    type: String
  },
  items: {
    type: Array
  },
},{
    collection: 'todoList'
})

module.exports = mongoose.model('ToDoList', ToDoList);
