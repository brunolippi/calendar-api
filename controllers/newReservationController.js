const { google } = require("googleapis")
const moment = require('moment'); // http://momentjs.com/docs/
const usersModel = require("../models/usersModel");
const reservationModel = require("../models/reservationModel");
const tokenModel = require("../models/tokenModel");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

async function addEvent(res,req) {
  try{
    const user = await usersModel.findOne({email: req.body.email})
    const credentials = await tokenModel.findOne({purpose: 'calendarApiKey'})
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0])
    oAuth2Client.setCredentials(user.token[0]);

     validateTime(oAuth2Client, res, req);
     
    }catch{
      res.json("ERRUser")
    }
}

async function validateTime(auth, res, req) {
  const calendar = google.calendar({ version: "v3", auth });


  const userData = await usersModel.findOne({calendarId: req.body.email})
  
  const startTime = JSON.stringify(req.body.start);
  const endTime = JSON.stringify(req.body.end);
    
  var opening = moment(startTime, moment.defaultFormat)
  var closing = moment(endTime, moment.defaultFormat)

  const parameters = {
    auth: auth,
    resource: {
      timeMin: opening,
      timeMax: closing,
      items: [{ id: userData.calendarId }],
    },
  };

  calendar.freebusy.query(parameters, function (err, response) {
    if (err) {
      console.log("There was an error contacting the Calendar service: " + err);
      return res.status(500).json({created: false, error: err});
    }
    let eventsBooked = response.data.calendars[userData.calendarId].busy
    if (eventsBooked.length === 0) {
      add(auth, res, req, userData)
    } else {
      return res.status(409).json({created: false, error: 'occupied'});
    } 
  });
}

function add(auth, res, req, data) {

  var randomNu = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 50);
    
  var event = {
    summary: req.body.title,
    description: req.body.desc,
    start: {
      dateTime: req.body.start,
      timeZone: "America/Buenos_Aires"
  },
    end: {
      dateTime: req.body.end,
      timeZone: "America/Buenos_Aires"
  },
    attendees: req.body.attendees,
    colorId: req.body.colordId,
    conferenceData: {
      createRequest: {
        requestId: randomNu,
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 1440 },
          { method: "popup", minutes: 10 },
        ],
      },
    },
  };

  async function createReservationLog () {
    try {
      const user = new reservationModel({
      title: req.body.title,
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
  calendar.events.insert(
    {
      auth: auth,
      calendarId: data.calendarId,
      conferenceDataVersion: 1,
      resource: event,
      sendNotifications: true
    },
    callbackEvent
  );
}

module.exports = { addEvent };
