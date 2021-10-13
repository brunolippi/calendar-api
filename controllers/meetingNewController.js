const reservationModel = require('../models/reservationModel');
const newReservation = require('./newReservationController')

module.exports ={
    getAll: async (req, res, next) => {
      try{
          const userData = await reservationModel.find({ owner: req.body.owner });
          res.json(userData);
      }catch (e){
          next(e)
      }
    },
    getAllFuture: async (req, res, next) => {
      try{
          const userData = await reservationModel.find({ owner: req.body.owner });
          res.json(userData);
      }catch (e){
          next(e)
      }
    },
    getById: async (req, res, next) => {
      console.log(req.params.id);
      try {
          const userData = await reservationModel.findById(req.params.id);
          res.json(userData);
      }catch (e){
          next(e)
      }
    },
    create: (req,res,next) => {
        try {
            const event =  newReservation.addEvent(res, req)
        }catch (e){
            console.log(e)
        }
    }
}