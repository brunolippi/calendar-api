var express = require('express');
var router = express.Router();
const eventController = require('../controllers/eventNewController')
const available = require('../controllers/availableController')

/* GET home page. */
router.post('/new', (req,res,next) => {req.app.validateUser(req,res,next)}, eventController.create);
router.post('/available/', available.validateTime);

module.exports = router;