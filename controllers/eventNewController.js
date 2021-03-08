const eventModel = require('../models/newEventModel')

module.exports ={
    create: (req,res,next) => {
        try {
            const event =  eventModel.addEvent(res, req)
        }catch (e){
            console.log(e)
        }
    }
}