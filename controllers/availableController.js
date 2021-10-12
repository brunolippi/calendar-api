var Moment = require('moment'); // http://momentjs.com/docs/
var moment = require('moment-timezone');
var _ = require('lodash'); // https://lodash.com/docs
const { google } = require("googleapis");
const usersModel = require("../models/usersModel");
const tokenModel = require("../models/tokenModel");

let occupied = [];

async function validateTime(req, res) {
  try {
    // In the future insted of retrieving this data from user, will request it from event.
    const dataUser = await usersModel.findOne({ calendarId: req.body.calendarId })
    let hours = dataUser.horarios[0]

    const reqDay = JSON.stringify(req.body.time);

    var opening = moment(reqDay, moment.defaultFormat).add(0, 'days').hours(hours.start).minute(0).second(0);
    var closing = moment(reqDay, moment.defaultFormat).add(0, 'days').hours(hours.end).minute(0).second(0);

    const credentials = await tokenModel.findOne({ purpose: "calendarApiKey" })
    const { client_secret, client_id, redirect_uris } = credentials.installed;

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
      console.log(response.data.calendars[[Object.keys(response.data.calendars)[0]]])
      let resp = response.data.calendars[dataUser.calendarId || Object.keys(response.data.calendars)[0]].busy
      let eventsBooked = JSON.stringify(resp)
      if (resp.length === 0) {
        console.log("No upcoming events found.");
        return date(req, res, hours);
      } else {
        for (var i = 0; i < resp.length; i++) {
          var eventstart = moment(resp[i].start)
          var eventend = moment(resp[i].end)
          var event = [eventstart, eventend]
          occupied.push(event)
        }
      }
      console.log("occupied: ", occupied)
      return date(req, res, hours, occupied);
    });
  } catch (e) {
    console.log('Usuario no existente: ' + req.body.email, "Error:", e)
    return res.json('ERRUsuario');
  }
}

async function validateDays(req, res) {
  try {
    const dataUser = await usersModel.findOne({ calendarId: req.body.calendarId })
    let hours = dataUser.horarios[0]

    const reqStartDay = JSON.stringify(req.body.time.start);
    const reqEndDay = JSON.stringify(req.body.time.end);

    var opening = moment(reqStartDay, moment.defaultFormat).add(0, 'days').hours(hours.start).minute(0).second(0);
    var closing = moment(reqEndDay, moment.defaultFormat).add(0, 'days').hours(hours.end).minute(0).second(0);

    const credentials = await tokenModel.findOne({ purpose: "calendarApiKey" })
    const { client_secret, client_id, redirect_uris } = credentials.installed;

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
      let resp = response.data.calendars[dataUser.calendarId || Object.keys(response.data.calendars)[0]].busy
      console.log("Response: ", resp)
      let eventsBooked = JSON.stringify(resp)
      res.json(resp)
      // if (resp.length === 0) {
      //   return date(req, res, hours)
      // } else {
      //   for (var i = 0; i < resp.length; i++) {
      //     var eventstart = moment(resp[i].start)
      //     var eventend = moment(resp[i].end)
      //     var event = [eventstart, eventend]
      //     occupied.push(event)
      //   }
      // }
      // return date(req, res, hours, occupied)
    });
  } catch (e) {
    console.log('Usuario no existente: ' + req.body.email, "Error:", e)
    return res.json('ERRUsuario')
  }
}

function date(req, res, hours, events) {

  let slots = [];

  let reqDay = req.body.time;

  let x = {
    nextSlot: hours.window,
    breakTime: [
      ['11:00', '14:00'], ['16:00', '18:00']
    ],
    startTime: hours.start,
    endTime: hours.end
  };

  let slotTime = moment(reqDay).hours(hours.start)
  let endTime = moment(reqDay).hours(hours.end)

  function isOccupied(slotT, breaks) {
    const slot = moment(slotT);
    if (breaks === undefined) {
      return false
    } else {
      return breaks.some((br) => {
        console.log(br[0], br[1])
        console.log(!(moment(br[0])
        .isBetween(slot, slot.add(x.nextSlot, 'minutes'))))
        console.log((moment(br[0])
        .isBetween(slot, slot.add(x.nextSlot, 'minutes'))))
        return !(moment(br[0])
        .isBetween(slot, slot.add(x.nextSlot, 'minutes')))
        && slot >= moment(br[0]) 
        && !(moment(br[1])
        .isBetween(slot, slot.add(x.nextSlot, 'minutes'))) 
        && slot.add(x.nextSlot, 'minutes') <= moment(br[1]);
      });
    }
  }

  while (slotTime < endTime) {
    if (!isOccupied(slotTime, events)) {
      console.log(slotTime)
      slots.push(moment(slotTime).format("HH:mm"));
    }
    slotTime = slotTime.add(x.nextSlot, 'minutes');
  }
  occupied.length = 0; // Without it, the array would keep the previous occupied slots and accumulate 'em.
  return res.json(slots);
}

module.exports = { date, validateDays, validateTime };


