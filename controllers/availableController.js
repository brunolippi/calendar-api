var moment = require('moment-timezone');
const { google } = require("googleapis");
const tokenModel = require("../models/tokenModel");
const eventModel = require('../models/eventModel');

let occupied = [];

async function validateTime(req, res) {
  try {
    const dataEvent = await eventModel.findById(req.params.eventId).populate('owner')
    
    const dataUser = dataEvent.owner
    const hours = dataEvent.owner.time

    const reqDay = JSON.stringify(req.body.time);

    const opening = moment(reqDay, moment.defaultFormat).add(0, 'days').hours(hours.start).minute(0).second(0);
    const closing = moment(reqDay, moment.defaultFormat).add(0, 'days').hours(hours.end).minute(0).second(0);

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
        items: [{ id: dataEvent.calendarId }],
      },
    };

    calendar.freebusy.query(parameters, function (err, response) {
      if (err) {
        console.log("There was an error contacting the Calendar service: " + err);
        return err;
      }
      let resp = response.data.calendars[dataEvent.calendarId || Object.keys(response.data.calendars)[0]].busy
      if (resp.length === 0) {
        return date(req, res, hours);
      } else {
        for (let i = 0; i < resp.length; i++) {
          let eventstart = moment(resp[i].start)
          let eventend = moment(resp[i].end)
          let event = [eventstart, eventend]
          occupied.push(event)
        }
      }
      return date(req, res, hours, occupied);
    });
  } catch (e) {
    console.log('Usuario no existente: ' + req.body.email, "Error:", e)
    return res.status(409).json('ERRUsuario');
  }
}

async function validateDays(req, res) {
  try {
    const dataEvent = await eventModel.findById(req.params.eventId).populate('owner')
    
    const dataUser = dataEvent.owner
    const hours = dataEvent.owner.time


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
        items: [{ id: dataEvent.calendarId }],
      },
    };

    calendar.freebusy.query(parameters, function (err, response) {
      if (err) {
        console.log("There was an error contacting the Calendar service: " + err);
        return err;
      }
      let resp = response.data.calendars[dataEvent.calendarId || Object.keys(response.data.calendars)[0]].busy
      return res.json(resp)
    });
  } catch (e) {
    console.log('Usuario no existente: ' + req.body.email, "Error:", e)
    return res.json('ERRUsuario')
  }
}

function date(req, res, hours, events) {
  let slots = [];

  let reqDay = req.body.time;
  let slotTime = moment(reqDay).hours(hours.start)
  let endTime = moment(reqDay).hours(hours.end)

  function isOccupied(slot, breakTimes) {
    if (breakTimes === undefined) {
      return false
    }else{
      return breakTimes.some((br) => {
        return slot >= moment(br[0]) && slot < moment(br[1]);
      });
    }
  }

  while (slotTime < endTime) {
    if (!isOccupied(slotTime, events)) {
      slots.push(moment(slotTime).format("HH:mm"));
    }
    slotTime = slotTime.add(hours.window, 'minutes');
  }
  events.length = 0; // Without it, the array would keep the previous occupied slots and accumulate 'em.
  
  return res.json(slots);
}

module.exports = { date, validateDays, validateTime };


