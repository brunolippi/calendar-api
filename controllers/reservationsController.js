const reservationModel = require('../models/reservationModel')

module.exports ={
    create: (req,res,next) => {
        try {
            const reservation = new reservationModel({
            title: req.body.title,
            owner: req.body.owner,
            calendarId: req.body.calendarId,
            eventId: req.params.eventId,
            attendees: req.body.attendees,
            time: {
              start: req.body.start,
              end: req.body.end
            },
            questions: req.body.questions
          });
          let rsv = await reservation.save();
          return rsv;
        }catch (e){
            console.log(e)
        }
    }
}