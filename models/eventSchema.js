const mongoose = require("../bin/mongodb");
var Schema = mongoose.Schema;

var eventSchema = new Schema({
  title: { type: String, required: 'Titulo de evento requerido' },
  user: {
    id: { type: String, required: true },
    displayName: String
  },
  dateAndTime: { type: Date, required: true },
  endDateAndTime: { type: Date, required: true },
  remarks: String
});

eventSchema.virtual('duration')
  .get(function () {
    var durationMs = this.endDateAndTime - this.dateAndTime;
    if (durationMs) {
      return Math.abs(this.endDateAndTime - this.dateAndTime) / 1000 / 60;
    }
    else {
      return;
    }
  });

eventSchema.path('dateAndTime').validate({
  validator: function (value) {
    var self = this;
    return new Promise(function(resolve, reject) {
      mongoose.models.Appointment.find( { 
        '_id': { $ne: self._id },
        'user.id': self.user.id,
        $or: [ 
          { dateAndTime: { $lt: self.endDateAndTime, $gte: self.dateAndTime } }, 
          { endDateAndTime: { $lte: self.endDateAndTime, $gt: self.dateAndTime } }
        ] 
      }, function (err, appointments) {
        resolve(! appointments || appointments.length === 0);
      });  
    })
  },
  message: "Este evento se superpone con otros"
});

eventSchema.path('dateAndTime').validate(function (value) {
  var isValid = true;
  if (value < new Date()) {
    isValid = false;
  }
  return isValid;
}, "El evento no puede ser en pasado");


module.exports = mongoose.model('Appointment', eventSchema);