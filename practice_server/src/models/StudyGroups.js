var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Connect = new Schema({
  userID: {
    type: String
  },
  friends: {
    type: Array,
    friend: String
  }
},{
    collection: 'groupInfo'
})

module.exports = mongoose.model('Connect', Connect);
