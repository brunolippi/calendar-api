const mongoose = require("../bin/mongodb");

const tokenSchema = new mongoose.Schema({
    purpose:{
        type:String,
        required:[true,"Es obligatorio el purpose"]
    },
    installed:{
        type:Object
    }
})

module.exports = mongoose.model("tokens", tokenSchema, "tokens")