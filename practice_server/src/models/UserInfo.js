var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserInfo = new Schema({
  userID: {
    type: String
  },
  userPassword: {
    type: String
  },
},{
    collection: 'userInfos'
})

module.exports = mongoose.model('UserInfo', UserInfo);
