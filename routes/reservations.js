var express = require('express');
var router = express.Router();
const meetController = require('../controllers/meetingNewController')
const available = require('../controllers/availableController')

/* GET home page. */
router.post('/:eventId/new', 
            (req, res, next) => req.app.validateUser(req, res, next),
            meetController.create);
router.post('/:eventId/available', available.validateTime)
router.post('/available/date', available.validateDays);

module.exports = router;