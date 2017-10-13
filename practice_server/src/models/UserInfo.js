var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserInfo = new Schema({
  userID: {
    type: String
  },
  userEmail: {
    type: String
  },
  userPassword: {
    type: String
  },
  apiLogin: {
    type: Array,
    api: {
      name: String,
      user: String,
      pass: String
    }
  }
},{
    collection: 'userInfos'
})

module.exports = mongoose.model('UserInfo', UserInfo);
