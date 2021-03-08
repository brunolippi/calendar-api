var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const jwt = require('jsonwebtoken');

var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var eventsRouter = require('./routes/events');
var statusRouter = require('./routes/status');

var app = express();

var whitelist = ['http://example1.com', 'http://lvh.me', 'http://localhost']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}


// In production, turn corsOptions on
 app.use(cors()/*(corsOptions)*/);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('secretKey','')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/event', eventsRouter);
app.use('/status', statusRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

function validateUser (req,res,next){
  jwt.verify(req.headers["x-access-token"],req.app.get("secretKey"),function(err,decoded){
    if(err){
      res.json({message:err.message})
    }else{
      req.body.tokenData=decoded
      next()
    }
  })
};

app.validateUser = validateUser;

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page in JSON
  res.status(err.status || 500);
  res.json({ "error": err.message});
});

module.exports = app;
