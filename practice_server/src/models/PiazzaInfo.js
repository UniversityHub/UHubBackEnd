var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PiazzaInfo = new Schema({
  userID: {
    type: String
  },
  userPassword: {
    type: String
  },
  courseList: {
    course: {
      id: String,
      name: String,
      courseNumber: String
    }
  },
  // display: {
  //   courseName: {
  //     type: String
  //   },
  //   courseFolder: {
  //     type: String
  //   }
  // }
},{
    collection: 'piazzaInfo'
})

module.exports = mongoose.model('PiazzaInfo', PiazzaInfo);
