var Moment = require('moment'); // http://momentjs.com/docs/
var moment = require('moment-timezone');
var _ = require('lodash'); // https://lodash.com/docs
const { google } = require("googleapis");
const usersModel = require("../models/usersModel");

let horDisp = [];

async function validateTime(req, res) {
  try{
    const dataUser = await usersModel.findOne({ calendarId: req.body.email })

    let hours =  dataUser.horarios[0]
    
    const reqDay = JSON.stringify(req.body.time);
    
    var opening = moment(reqDay, moment.defaultFormat).add(0, 'days').hours(hours.start).minute(0).second(0);
    var closing = moment(reqDay, moment.defaultFormat).add(0, 'days').hours(hours.end).minute(0).second(0);
    
    const { client_secret, client_id, redirect_uris } = dataUser.credentials[0].installed;
    
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
      );
      oAuth2Client.setCredentials(dataUser.token[0]);
      
      const calendar = google.calendar({ version: "v3", oAuth2Client });
      
      const parameters = {
        auth: oAuth2Client,
        resource: {
          timeMin: opening,
          timeMax: closing,
          items: [{ id: dataUser.calendarId }],
        },
      };
      
      calendar.freebusy.query(parameters, function (err, response) {
        if (err) {
          console.log("There was an error contacting the Calendar service: " + err);
          return err;
        }
        let resp = response.data.calendars[dataUser.calendarId].busy
        let eventsBooked = JSON.stringify(response.data.calendars[dataUser.calendarId].busy)
        if (resp.length === 0) {
          console.log("No upcoming events found.");
          date(req, res, hours)
        } else {
          console.log('ID:' + dataUser.calendarId)
          for (var i = 0; i < resp.length; i++) {
            var eventstart = moment(resp[i].start)
            var eventend = moment(resp[i].end)
            var event = [eventstart, eventend]
            horDisp.push(event)
          }
        }
        console.log("horDisp" + horDisp)
        date(req, res, hours, horDisp)
      });
    }catch{
    console.log('Usuario no existente: ' + req.body.email)
    res.json('ERRUsuario')
    }
    }
    
    function date(req, res, hours, events) {
      
      var slots = [];
      
      var reqDay = req.body.time;
      
  var x = {
    nextSlot: hours.window,
    breakTime: [
      ['11:00', '14:00'], ['16:00', '18:00']
    ],
    startTime: hours.start,
    endTime: hours.end
  };

  var slotTime = moment(reqDay).hours(hours.start)
  var endTime = moment(reqDay).hours(hours.end)

  function isOccupied(slotTime, breakTimes) {
    if (breakTimes === undefined) {
      return false
    }else{
      return breakTimes.some((br) => {
        return slotTime >= moment(br[0]) && slotTime < moment(br[1]);
      });
    }
  }

  function isInBreak(slotTime, breakTimes) {
    return breakTimes.some((br) => {
      const start = slotTime.hours(br[0]);
      const end = slotTime.hours(br[1]);
      return slotTime >= start && slotTime < end;
    }); // No funca yet.
  }

  while (slotTime < endTime) {
      if (!isOccupied(slotTime, events)) {
        slots.push(moment(slotTime).format("HH:mm"));
    }
    slotTime = slotTime.add(x.nextSlot, 'minutes');
  }

  console.log(slots)
  res.json(slots);
}

module.exports = { date, validateTime };


