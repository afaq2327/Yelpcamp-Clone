// server.js

// set up ======================================================================
// get all the tools we need
const 
express  = require('express');
app      = express();//framework for routing
port     = 3000;//listen
mongoose = require('mongoose');//mongodb...
passport = require('passport');//authentication...
flash    = require('connect-flash');//notifications...

morgan       = require('morgan');//is used for logging request to the console...
cookieParser = require('cookie-parser');
bodyParser   = require('body-parser');
session      = require('express-session');

configDB = require('./config/auth.js');

// configuration ===============================================================
mongoose.set('useCreateIndex', true);
mongoose.connect(configDB.databaseAuth.url,{ useNewUrlParser: true, useUnifiedTopology: true },function(){
    console.log("db connected");
}); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.set('view engine', 'ejs'); // set up ejs for templating
app.use(express.static(__dirname + "/public"));

// required for passport
app.use(session({ secret: 'Yes We Code' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// routes ======================================================================
const authRouter = require('./app/authRoutes.js'); // load our routes and pass in our app and fully configured passport
const startRouter = require('./app/startRoutes.js');

app.use("/",authRouter);
app.use("/found",startRouter);

// launch ======================================================================
app.listen(port);
console.log('The server is listening on port ' + port);
