var express = require('express');
var router = express.Router();
const usersController = require('../controllers/usersController')
const generateToken = require('../controllers/generateToken')

router.get('/token'/*, (req,res,next) => {req.app.validateUser(req,res,next)}*/, generateToken.generateURL);
router.post('/registro', usersController.create);
router.post('/token'/*, (req,res,next) => {req.app.validateUser(req,res,next)}*/, generateToken.processCode);
router.post('/login', usersController.login);
router.put('/:id', (req,res,next) => {req.app.validateUser(req,res,next)}, usersController.update);

module.exports = router;
