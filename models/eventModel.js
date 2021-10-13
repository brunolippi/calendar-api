const mongoose = require("../bin/mongodb");
const ObjectId = require('mongodb').ObjectID;

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Field 'title' is mandatory. Type: String."],
    minlength: 1,
    maxlength: 100
  },
  description: String,
  owner: {
    type: ObjectId,
    required: [true, "Field 'owner' is mandatory. Type: ObjectId."],
  },
  calendarId: {
    type: String,
    //required:[true,"Field 'calendarId' is mandatory. Type: String."]
  },
  available: {
      type: Boolean,
      default: true
  },
  platform: String,
  dateOfCreation: { type: Date, default: Date.now, inmutable: true },
  duration: {
    type: Number,
    required: [true, "Field 'duration' is mandatory. Type: Number."],
  },
  date: {
    start: {
      type: Date,
      required: [true, "Field 'date.start' is mandatory. Type: Date."]
    },
    end: {
      type: Date,
    },
  },
  createdBy: {
    type: ObjectId,
    required: [true, "Field 'createdBy' is mandatory. Token might be missing."],
    inmutable: true
  },
  questions: [{ 
    question: String, 
    answers: Array, 
    type: String, 
    obligatory: Boolean 
  }],
})

// eventSchema.path('dateAndTime').validate({
//   validator: function (value) {
//     var self = this;
//     return new Promise(function (resolve, reject) {
//       mongoose.models.Appointment.find({
//         '_id': { $ne: self._id },
//         'user.id': self.user.id,
//         $or: [
//           { dateAndTime: { $lt: self.endDateAndTime, $gte: self.dateAndTime } },
//           { endDateAndTime: { $lte: self.endDateAndTime, $gt: self.dateAndTime } }
//         ]
//       }, function (err, appointments) {
//         resolve(!appointments || appointments.length === 0);
//       });
//     })
//   },
//   message: "Este evento se superpone con otros"
// });


eventSchema.path('date.start').validate(function (value) {
  if (value < new Date()) {
    return false;
  } else return true;
}, "Event can't be in the past.");


module.exports = mongoose.model('events', eventSchema);