const mongoose = require("../bin/mongodb");
const bcrypt = require('bcrypt')

const tokenSchema = new mongoose.Schema({
    access_token:String
})

mongoose.model('tokenSchema', tokenSchema);

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"El campo name es obligatorio"],
        minlength:1,
        maxlength:100
    },
    email:{
        type:String,
        unique:true,
        required:[true,"Es obligatorio el mail"]
    },
    password:{
        type:String,
        required:[true,"Es obligatorio el password"]
    },
    calendarId:{
        type:String
       // required:[true,"Es obligatorio el calendarId"]
    },token:Array,
    horarios:Array,
    reservas:Array,
    credentials:Array
})

userSchema.pre("save", function(next){
    this.password = bcrypt.hashSync(this.password,10)
    next()
})

module.exports = mongoose.model("users", userSchema)