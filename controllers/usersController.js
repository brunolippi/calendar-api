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
    try {
        const userData = await usersModel.findById(req.params.id);
        res.json(userData);
    }catch (e){
        next(e)
    }
  },
  create: async (req, res, next) => {
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
        return res.json({ status: "Updated", ok: 1});
    }catch (e){
       next(e) 
    }
  },
  login: async (req, res, next) => {
    try{
        const user = await usersModel.findOne({email:req.body.email}).select('+password')
        if(user) {
            if(bcrypt.compareSync(req.body.password,user.password)){
                const token = jwt.sign({userId:user._id},req.app.get(("secretKey")))
                req.headers["x-access-token"] = token;
                res.json({ token:token })
            }else {
                res.json({error: "Wrong password."})
            }
        }else{
            res.json({error: "Email not registered."})
        }
    }catch (e){
       next(e) 
    }
  },
  changePassword: async (req, res, next) => {
    try {
      const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userID = req.user.userId;
    let errors = [];
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        errors.push({ msg: "Please fill in all fields." });
    }
    
    if (newPassword !== confirmNewPassword) {
        errors.push({ msg: "New password and it's confirmation do not match." });
    }
    
    if (newPassword.length < 6 || confirmNewPassword.length < 6) {
        errors.push({ msg: "Password should be at least six characters." });
    }
    
    if (errors.length > 0) {
        res.status(409).json({ errors })
    } else {
        usersModel.findOne({ _id: userID }).select('+password').then(user => {
            bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    const salt = bcrypt.genSaltSync(10)
                    user.password = bcrypt.hash(newPassword, salt);
                    user.save();
                    return res.json({ ok: 1, status: 'Password changed.' })
                } else {
                    //Password doesn't match
                    errors.push({ msg: "Current password is not a match." });
                    return res.status(409).json({ errors })
                }
            });
        });
    }
  }catch (e){
    next(e) 
 }}
};
