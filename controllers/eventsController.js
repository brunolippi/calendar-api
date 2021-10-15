const eventModel = require("../models/eventModel");

module.exports = {
  getAll: async (req, res, next) => {
    try{
        const eventData = await eventModel.find({ available: true });
        res.json(eventData);
    }catch (e){
        next(e)
    }
  },
  getAllFuture: async (req, res, next) => {
    try{
        const eventData = await eventModel.find({ date: {start: {$gte: new Date()}} });
        res.json(eventData);
    }catch (e){
        next(e)
    }
  },
  getById: async (req, res, next) => {
    try {
        const eventData = await eventModel.findById(req.params.id);
        res.json(eventData);
    }catch (e){
        next(e)
    }
  },
  create: async (req, res, next) => {
    try{
        const event = new eventModel({
            title: req.body.title,
            description: req.body.description,
            owner: req.body.owner,
            available: req.body.available,
            calendarId: req.body.calendarId,
            platform: req.body.platform,
            duration: req.body.duration,
            date: req.body.date,
            questions: req.body.questions,
            createdBy: req.body.tokenData.userId
          });
          let evnt = await event.save();
          res.json(evnt);
    }catch (e){
        next(e)
    }
  },
  update: async (req, res, next) => {
    try{
        const eventData = await eventModel.update({ _id: req.params.id }, req.body, { multi: false })
        res.json(eventData);
    }catch (e){
       next(e) 
    }
  }
};
