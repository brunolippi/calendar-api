const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis")
const moment = require('moment'); // http://momentjs.com/docs/
const usersModel = require("../models/usersModel");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

const TOKEN_PATH = "token.json";

// !! !! SI NO HAY TOKEN, CRASHEA !! !!

// el token lo obtiene de la db


async function addEvent(res,req) {
  try{
    const user = await usersModel.findOne({calendarId: req.body.email})
    const { client_secret, client_id, redirect_uris } = user.credentials[0].installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0])
    oAuth2Client.setCredentials(user.token[0]);

    
    
    // Check if we have previously stored a token.
    /* fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      //oAuth2Client.setCredentials(JSON.parse(token)); 
      */
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
      return err;
    }
    console.log(
      "Response from the Calendar service: " +
        JSON.stringify(response.data.calendars[userData.calendarId].busy)
    );
    let eventsBooked = response.data.calendars[userData.calendarId].busy
    if (eventsBooked.length === 0) {
      console.log("No upcoming events found.");
      add(auth, res, req, userData)
    } else {
      res.json('Horario ocupado')
    } 
  });
}

function add(auth, res, req, data) {

  var randomNu = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 50);
  console.log(randomNu);
  var event = {
    summary: req.body.titulo,
    description: req.body.desc,
    start: {
      dateTime: req.body.start,
      timeZone: "America/Buenos_Aires"
  },
    end: {
      dateTime: req.body.end,
      timeZone: "America/Buenos_Aires"
  },
    attendees: req.body.invs,
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

  const calendar = google.calendar({ version: "v3", auth });
  calendar.events.insert(
    {
      auth: auth,
      calendarId: data.calendarId,
      conferenceDataVersion: 1,
      resource: event,
      sendNotifications: true
    },
    function (err, newEvent) {
      if (err) {
        console.log(
          "There was an error contacting the Calendar service: " + err
        );
        res.json("err: " + err);
        var statusMeet = event.meetStatus;
        console.log(statusMeet);
        return;
      } else {
        console.log("Event created: %s", newEvent.htmlLink);
        var statusMeet = event.meetStatus;
        console.log(statusMeet);
        res.json("Evento creado");
        return;
      }
    }
  );
}

module.exports = { addEvent };
