var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PiazzaInfo = new Schema({
  userID: {
    type: String
  },
  userPassword: {
    type: String
  },
  courseList: [
    {
      id: String,
      name: String,
      courseNumber: String
    }
  ]
},{
    collection: 'piazzaInfo'
})

module.exports = mongoose.model('PiazzaInfo', PiazzaInfo);
