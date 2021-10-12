var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const jwt = require('jsonwebtoken');
const usersModel = require("./models/usersModel");

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


// !!! In production, turn corsOptions on

 app.use(cors()/*(corsOptions)*/);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('secretKey', process.env.SECRECT_KEY)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/events', eventsRouter);
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

async function validateAdminRole (email) {
  if(email){
  const dataUser = await usersModel.findOne({ email })
  const role = dataUser.role
  if (role === 'admin') return true
  return false;
} else return false
};

async function validateAdmin (req,res,next){
  const role = await validateAdminRole(req.body.email)
  if (role) {
    jwt.verify(req.headers["x-access-token"],req.app.get("secretKey"),function(err,decoded){
      if(err){
        res.json({message:err.message})
      }else{
        req.body.tokenData=decoded
        next()
      }
  })} else return res.status(401).json({message: 'User is not admin or "email" field is missing.'})
};

app.validateAdmin = validateAdmin;

app.use((req, res, next) => {
  // Allowed methods
     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  
  // Allowed headers (ie. 'X-Requested-With,content-type')
     res.setHeader('Access-Control-Allow-Headers', '*');
  
  next();
  })

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  // render the error page in JSON
  if(err.code === 11000) return res.status(409).json({ "error": err.message});
  res.status(err.status || 500);
  res.json({ "error": err.message});
});

module.exports = app;
