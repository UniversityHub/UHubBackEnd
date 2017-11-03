var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ToDoList = new Schema({
  userID: {
    type: String
  },
  items: {
    type: Array,
    item: String
  }
},{
    collection: 'todoList'
})

module.exports = mongoose.model('ToDoList', ToDoList);

/*module.exports = mongoose.model('Todo', {
  text : String,
  done : Boolean
});*/
