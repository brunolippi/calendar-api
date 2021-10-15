const { google } = require("googleapis");
const tokenModel = require("../models/tokenModel");
const usersModel = require("../models/usersModel");

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

async function insertCredentials(req, res, next) {
    try{
        const find = await tokenModel.findOne({ purpose: "calendarApiKey"}).exec() 
        if (find !== null) return res.status(403).json('Credentials already installed. Modify them from the admin panel.'); 
        const credentials = new tokenModel({
            purpose: 'calendarApiKey',
            installed: req.body.installed
          });
          let usr = await credentials.save();
          return res.json(usr);
    }catch (e){
        console.log(e)
        next(e) 
    }
}

async function generateURL(req, res, next) {
    try{
        const find = await tokenModel.findOne({ purpose: "calendarApiKey"}).exec() 
        
        const { client_secret, client_id, redirect_uris } = find.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
    
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        
        return res.json(authUrl);
    } catch (e){
        console.log(e)
        next(e) 
    }
}

async function processCode(req, res) {
    const code = req.body.code

    const token = await tokenModel.findOne({ purpose: "calendarApiKey" })

    const { client_secret, client_id, redirect_uris } = token.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    try {
        oAuth2Client.getToken(code, updateAccount)
    } catch (err) {
        console.error('Error retrieving access token', err)
            res.status(err.code).json("Error retrieving access token", err)
    }

    async function updateAccount(err, calToken) {
        if (err) {
            console.error('Error retrieving access token', err)
            res.status(err.code).json("Error retrieving access token", err)
        }

        const filter = { email: req.body.email };
        const add = { token: calToken, horarios: [{start: req.body.start, end: req.body.end}] };

        let update = await usersModel.findOneAndUpdate(filter, add)

        return res.json(update)
    }
}

module.exports = { generateURL, processCode, insertCredentials };

