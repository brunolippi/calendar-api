var express = require('express');
var router = express.Router();

const status = (req, res) => {
    res.json('Running')
}
/* GET status page. */
router.get('/', status);


module.exports = router;