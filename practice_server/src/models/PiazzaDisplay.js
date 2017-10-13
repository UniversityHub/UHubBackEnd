var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var piazzaDisplay = new Schema({

  courseName: {
    type: String
  },
  courseFolder: {
    type: String
  },
  coursePosts: {
    type: Array
  }
},{
    collection: 'piazzaDisplay'
})

module.exports = mongoose.model('piazzaDisplay', piazzaDisplay);
