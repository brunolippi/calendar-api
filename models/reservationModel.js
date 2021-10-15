const mongoose = require("../bin/mongodb");
const ObjectId = require('mongodb').ObjectID;

const reservationSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Field 'title' is mandatory. Type: String."],
        minlength:1,
        maxlength:100
    },
    owner:{
        type: ObjectId,
        ref: 'users',
        required:[true,"Field 'owner' is mandatory. Type: ObjectId."],
    },
    eventId:{
        type: ObjectId,
        ref: 'events',
        //required:[true,"Field 'eventId' is mandatory. Type: ObjectId."],
    },
    calendarId:{
        type:String,
        //required:[true,"Field 'calendarId' is mandatory. Type: String."]
    },
    dateOfCreation: { type: Date, default: Date.now },
    attendees:[{
        email: {
            type:String,
            validate: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            required:[true,"Field 'attendees.email' is mandatory. Type: String."]
        },
        displayName: {
            type:String,
        },
    }],
    time:{
        start: {
            type:Date,
            required:[true,"Field 'time.start' is mandatory. Type: Date."]
        },
        end: {
            type:Date,
            required:[true,"Field 'time.end' is mandatory. Type: Date."]
        },
    },
    questions: [{question: String, answer: String}],
})

reservationSchema.virtual('duration')
  .get(function () {
    var durationMs = this.time.end - this.time.start;
    if (durationMs) {
      return Math.abs(durationMs) / 1000 / 60;
    }
    else {
      return;
    }
  });

module.exports = mongoose.model("reservations", reservationSchema)