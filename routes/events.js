var express = require('express');
var router = express.Router();
const meetController = require('../controllers/meetingNewController')
const available = require('../controllers/availableController');
const eventsController = require('../controllers/eventsController');

/* GET home page. */
router.post('/create', (req,res,next) => {req.app.validateUser(req,res,next)}, eventsController.create);
router.get('/all', (req,res,next) => {req.app.validateUser(req,res,next)}, eventsController.getAll);
// router.get('/future', (req,res,next) => {req.app.validateUser(req,res,next)}, eventsController.getAllFuture);
router.get('/:id', (req,res,next) => {req.app.validateUser(req,res,next)}, eventsController.getById);
router.put('/:id', (req,res,next) => {req.app.validateUser(req,res,next)}, eventsController.update);

router.post('/:eventId/new', (req,res,next) => {req.app.validateUser(req,res,next)}, meetController.create);
router.post('/available/', available.validateTime)
router.post('/available/date', available.validateDays);

module.exports = router;