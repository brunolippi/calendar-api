var express = require('express');
var router = express.Router();
const usersController = require('../controllers/usersController')
const generateToken = require('../controllers/generateToken')

router.post('/credentials', (req,res,next) => {req.app.validateAdmin(req,res,next)}, generateToken.insertCredentials);
router.get('/token'/*, (req,res,next) => {req.app.validateUser(req,res,next)}*/, generateToken.generateURL);
router.post('/token'/*, (req,res,next) => {req.app.validateUser(req,res,next)}*/, generateToken.processCode);

router.post('/login', usersController.login);
router.post('/signup', usersController.create);
router.put('/password', (req,res,next) => {req.app.validateUser(req,res,next)}, usersController.changePassword);

router.get('/all', (req,res,next) => {req.app.validateUser(req,res,next)}, usersController.getAll);
router.get('/:id', (req,res,next) => {req.app.validateUser(req,res,next)}, usersController.getById);
router.put('/:id', (req,res,next) => {req.app.validateUser(req,res,next)}, usersController.update);

module.exports = router;
