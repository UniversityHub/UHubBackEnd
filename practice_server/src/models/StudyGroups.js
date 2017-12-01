var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Groups = new Schema({
  userID: {
    type: String
  },
  friends: {
    type: Array,
    friend: String
  }
},{
    collection: 'studyGroups'

})

module.exports = mongoose.model('Groups', Groups);
