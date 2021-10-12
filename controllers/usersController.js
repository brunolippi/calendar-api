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
        console.log(userData)
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
            surname: req.body.surname,
            email: req.body.email,
            password: req.body.password,
            calendarId: req.body.calendarId,
            time: req.body.time,
            token: req.body.token,
            settings: req.body.settings,
          });
          let usr = await user.save();
          res.json({
            role: usr.role,
            _id: usr._id,
            email: usr.email,
            calendarId: usr.calendarId,
        });
    }catch (e){
        next(e)
    }
    
  },
  update: async (req, res, next) => {
    try{
        const userData = await usersModel.update({ _id: req.params.id }, { ...req.body
        }, { multi: false })
        return res.json({ status: "ok", ok: 1});
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
