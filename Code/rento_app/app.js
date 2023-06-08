//Allows to load vairables from a .env, to ensure top privacy 
//and security.
require('dotenv').config();

// Node module to create HTTP errors for the app.
const createError = require('http-errors');
//Node.js web application framework
const express = require('express');
//Module provides tools to work with several file and directory paths
const path = require('path');
//Module that allows Express to obtain cookie data, used for authentication
//of user. 
const cookieParser = require('cookie-parser');
//Responsible for parsing incoming request bodies in a middleware of Node.js
const bodyParser = require('body-parser');
//Used to simplify the process of logging requests for the app.
const logger = require('morgan');
//HTTP server-side framework used to create and manage a session middleware.
const session = require('express-session');
//Authentication middleware for Node.js.
const passport = require("passport");
//Used to display messages to user, such as logging in to account.
const flash = require("connect-flash");
//To let the app know we will be using ejs file, instead of html.
const ejs = require('ejs');
//files in models are used to create the schema of the database.
const Category = require("./models/category");
//Used to setup configurations or connection for the database.
const mongoose = require('mongoose');
//A MySQL session store that is used to upload session data to the MySQL database
const MongoStore = require('connect-mongo'); 
//Data needed to connect to MySQL, hidden from public view.
const connectDB = require("./config/db");
const csurf = require("tiny-csrf");

//Creation of e-commerce app
const app = express();
//Calling the settings for passport
require('./config/passport');

//Setting up database connection
let client = connectDB();


//Setting up to be able to use and display ejs file properly.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("cookie-parser-secret"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client: client,
    }),
    //session will expire after an hour
    cookie: { maxAge: 60 * 1000 * 60 },
  })
);
app.use(csurf("123456789iamasecret987654321look"));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// global variables across routes
app.use(async (req, res, next) => {
  try {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    res.locals.currentUser = req.user;
    const categories = await Category.find({}).sort({ title: 1 }).exec();
    res.locals.categories = categories;
    next();
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// add breadcrumbs for tracking in case of errors.
get_breadcrumbs = function (url) {
  var rtn = [{ name: 'Home', url: '/' }],
    acc = '', // accumulative url
    arr = url.substring(1).split('/');

  for (i = 0; i < arr.length; i++) {
    acc = i != arr.length - 1 ? acc + '/' + arr[i] : null;
    rtn[i + 1] = {
      name: arr[i].charAt(0).toUpperCase() + arr[i].slice(1),
      url: acc,
    };
  }
  return rtn;
};
app.use(function (req, res, next) {
  req.breadcrumbs = get_breadcrumbs(req.originalUrl);
  next();
});

//routes config
const indexRouter = require("./routes/index");
const listingRouter = require("./routes/listing");
const accountsRouter = require("./routes/account");
const pagesRouter = require("./routes/pages");
app.use("/listing", listingRouter);
app.use("/account", accountsRouter);
app.use("/pages", pagesRouter);
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var port = process.env.PORT || 3000;
app.set('port', port);
app.listen(port, () => {
  console.log('Server running at port ' + port);
});

module.exports = app;