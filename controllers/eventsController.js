const usersModel = require("../models/usersModel");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports = {
  getAll: async (req, res, next) => {
    try{
        const userData = await usersModel.find({}).populate("category");
        res.json(userData);
    }catch (e){
        next(e)
    }
  },
  getById: async (req, res, next) => {
    console.log(req.params.id);
    try {
        const userData = await usersModel.findById(req.params.id);
        res.json(userData);
    }catch (e){
        next(e)
    }
  },
  create: async (req, res, next) => {
    console.log(req.body);
    try{
        const user = new usersModel({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            calendarId: req.body.cal,
            token: req.body.token,
            credentials: req.body.cred
          });
          let usr = await user.save();
          res.json(usr);
    }catch (e){
        next(e)
    }
    
  },
  update: async (req, res, next) => {
    try{
        const userData = await usersModel.update({ _id: req.params.id }, req.body, { multi: false })
        res.json(userData);
    }catch (e){
       next(e) 
    }
  },
  login: async (req, res, next) => {
    try{
        const user = await usersModel.findOne({email:req.body.email})
        if(user) {
            if(bcrypt.compareSync(req.body.password,user.password)){
                const token = jwt.sign({userId:user._id},req.app.get(("secretKey")))
                res.json({token:token})
                req.headers["x-access-token"] = token;
            }else {
                res.json({error: "Wrong password."})
            }
        }else{
            res.json({error: "Email not registered."})
        }
    }catch (e){
       next(e) 
    }
  }
};