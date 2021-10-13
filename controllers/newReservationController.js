const { google } = require("googleapis")
const moment = require('moment'); // http://momentjs.com/docs/
const usersModel = require("../models/usersModel");
const reservationModel = require("../models/reservationModel");
const tokenModel = require("../models/tokenModel");
const eventModel = require("../models/eventModel");

async function initReservation(res,req) {
  try{
    const user = await usersModel.findById(req.body.owner).select('+token')
    console.log(user)
    const credentials = await tokenModel.findOne({purpose: 'calendarApiKey'})
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0])
    oAuth2Client.setCredentials(user.token[0]);

     verifySlot(oAuth2Client, res, req);
     
    }catch{
      res.json("ERRUser")
    }
}

async function verifySlot(auth, res, req) {
  const calendar = google.calendar({ version: "v3", auth });
 
  const startTime = JSON.stringify(req.body.start);
  const endTime = JSON.stringify(req.body.end);
    
  var opening = moment(startTime, moment.defaultFormat)
  var closing = moment(endTime, moment.defaultFormat)

  const parameters = {
    auth: auth,
    resource: {
      timeMin: opening,
      timeMax: closing,
      items: [{ id: req.body.calendarId }],
    },
  };

  calendar.freebusy.query(parameters, function (err, response) {
    if (err) {
      console.log("There was an error contacting the Calendar service: " + err);
      return res.status(500).json({created: false, error: err});
    }
    let eventsBooked = response.data.calendars[req.body.calendarId].busy
    if (eventsBooked.length === 0) {
      addReservation(auth, res, req)
    } else {
      return res.status(409).json({created: false, error: 'occupied'});
    } 
  });
}

async function addReservation(auth, res, req) {

  const eventData = await eventModel.findById(req.params.eventId)

  let randomNu = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 50);

  const description = req.body.questions ? `<h2>${eventData.title}</h2>${eventData.description}

<hr><ul>${req.body.questions.map(e => `<li><b>${e.question}</b> ${e.answer}</li>`).join('')}</ul>` 
  : eventData.description
    
  const event = {
    summary: eventData.title,
    description,
    start: {
      dateTime: req.body.start,
      timeZone: req.body.timeZone
  },
    end: {
      dateTime: req.body.end,
      timeZone: req.body.timeZone
  },
    attendees: req.body.attendees,
    colorId: eventData.colordId || null,
    conferenceData: {
      createRequest: {
        requestId: randomNu,
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
      reminders: {
        useDefault: false,
        overrides: eventData.reminders,
      },
    },
  };

  async function createReservationLog () {
    try {
      const user = new reservationModel({
      title: eventData.title,
      owner: req.body.owner,
      attendees: req.body.attendees,
      calendarId: req.body.calendarId,
      eventId: req.params.eventId,
      time: {
        start: req.body.start,
        end: req.body.end
      },
      questions: req.body.questions
    });
    let usr = await user.save();
    return usr;
  } catch (err) {
      return res.status(409).json(err)
    }
  }

  const calendar = google.calendar({ version: "v3", auth });

  async function callbackEvent (err, newEvent) {
    if (err) {
      console.log(
        "There was an error contacting the Calendar service: " + err
      );
      return res.status(500).json({created: false, error: err});
    } else {
      const eventLink = await newEvent.data.htmlLink
      const meet = await newEvent.data.hangoutLink;
      if (newEvent.data.status === 'confirmed') {
        try {
          await createReservationLog()
          return res.json({created: true, meet, eventLink, event: newEvent.data})
        }catch (err) {
          return res.status(409).json(err)
      }
      };
      return res.status(409).json({created: false, error: 'not-confirmed'});
    }
  }
  calendar.events.insert({
      auth,
      calendarId: req.body.calendarId,
      conferenceDataVersion: 1,
      resource: event,
      sendNotifications: true
    }, callbackEvent
  );
}

module.exports = { initReservation };
