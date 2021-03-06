var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var index = require('./app_server/routes/index');
var users = require('./app_server/routes/users');
var api = require('./app_api/routes/api');

var environment = process.env.NODE_ENV;
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');

mongoose.connect('mongodb://localhost:27017/typoetry');

// On successful connection
mongoose.connection.on('connected', function () {  
  console.log('Mongoose default connection open to database');
}); 

// If the connection throws an error
mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
}); 

require('./app_api/models/poem');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

switch (environment) {
  case 'build':
    console.log('--BUILD--');
    app.use(favicon(path.join(__dirname, 'build', 'favicon.ico')));
    app.use(express.static('./build/'));
    app.use('/public/svg', express.static('./build/svg'));
    app.use('/public/audio', express.static('./build/audio'));
    app.set('views', path.join(__dirname, 'build'));
    break;
  default:
    console.log('--DEV--');
    app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use('/public', express.static(path.join(__dirname, 'public')));
    app.use('/app_client', express.static(path.join(__dirname, 'app_client')));
    app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));
    break;
}

app.use('/', index);
app.use('/users', users);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;