var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CalendarInfo = new Schema({
  userID: {
    type: String
  },
  events: {
    type: Array,
    event: {
      title: String,
      allDay: Boolean,
      start: String,
      end: String
    }
  }
},{
    collection: 'calendarInfo'
})

module.exports = mongoose.model('CalendarInfo', CalendarInfo);
