const mongoose = require("../bin/mongodb");
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Field 'name' is mandatory. Type: String."],
        minlength:1,
        maxlength:100
    },
    surname:{
        type:String,
        required:[true,"Field 'surname' is mandatory. Type: String."],
        minlength:1,
        maxlength:100
    },
    email:{
        type:String,
        unique:true,
        required:[true,"Field 'mail' is mandatory. Type: String."],
        validate: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
    },
    password:{
        type:String,
        required:[true,"Field 'password' is mandatory. Type: String."],
        select: false,
    },
    calendarId:{
        type:String,
        required:[true,"Field 'calendarId' is mandatory. Type: String."]
    },
    token:{
        type: Array,
        select: false,
        required:[true,"Field 'token' is mandatory. Type: Array."]
    },  
    dateOfCreation: { type: Date, default: Date.now, inmutable: true },
    role: {
        type:String,
        default: 'user',
        immutable: doc => doc.role !== 'admin'
    },
    time:{
        start: {
            type:String,
            required:[true,"Field 'time.start' is mandatory. Type: String."]
        },
        end: {
            type:String,
            required:[true,"Field 'time.end' is mandatory. Type: String."]
        },
        window: {
            type:String,
            required:[true,"Field 'time.window' is mandatory. Type: String."]
        },
    },
    reservations: [{start: String, end: String}],
    settings: Object,
})

userSchema.pre("save", function(next){
    this.password = bcrypt.hashSync(this.password,10)
    next()
})

userSchema.pre("update", function(next){
    this.password = bcrypt.hashSync(this.password,10)
    next()
})

module.exports = mongoose.model("users", userSchema)