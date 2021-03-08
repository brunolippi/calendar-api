var express = require('express');
var router = express.Router();

const status = (req, res) => {
    setTimeout(() => {
        res.json('Up')
    }, 1500)
}
/* GET status page. */
router.post('/', status);


module.exports = router;