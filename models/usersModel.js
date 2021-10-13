const mongoose = require("../bin/mongodb");
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:[true,"Field 'firstname' is mandatory. Type: String."],
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
        required:[true,"Field 'email' is mandatory. Type: String."],
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
        required:[false,"Field 'token' is mandatory. Type: Array."]
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

userSchema.virtual('fullname').
  get(function() { return `${this.firstname} ${this.surname}`; }).
  set(function(v) {
    const firstName = v.substring(0, v.indexOf(' '));
    const lastName = v.substring(v.indexOf(' ') + 1);
    this.set({ firstName, lastName });
  });


userSchema.pre("save", function(next){
    this.password = bcrypt.hashSync(this.password,10)
    next()
})

userSchema.pre("update", function(next){
    this.password = bcrypt.hashSync(this.password,10)
    next()
})

userSchema.pre("validate", function(next){
    this.password = bcrypt.hashSync(this.password,10)
    next()
})

module.exports = mongoose.model("users", userSchema)