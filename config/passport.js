var LocalStrategy   = require('passport-local').Strategy;//local-auth
var FacebookStrategy = require('passport-facebook').Strategy;//facebook auth
var GoogleStrategy = require('passport-google-oauth20');//google auth
var User            = require('../app/models/user');
var mailer              = require("../helpers/mailer");
var configAuth = require("../config/auth");

// expose this function to our app using module.exports
module.exports = function(passport) {

    // used to serialize the user for the session...
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user...
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        console.log(req);
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ email :  email}, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {
                //generating token
                
                
                // if there is no user with that email, create the user
                var newUser            = new User();

                // set the user's local credentials
                
                newUser.local.name = req.body.name;
                newUser.email = email;
                newUser.local.password = newUser.generateHash(password);
                newUser.token = newUser.generateJWT();
                newUser.type = req.body.type;
                newUser.facebookLink = null;
                newUser.twitterLink = null;
                newUser.linkdinLink = null;

                newUser.facebook.id = null;
                newUser.facebook.token = null;
                newUser.facebook.name = null;
                
                newUser.google.id = null;
                newUser.google.token = null;
                newUser.google.name = null;
                  
                //mailing
                mailer(req.body.email,newUser.token);

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser,req.flash('signupMessage', 'You need to update your profile immediately') );
                });
            };

        });    

        });

    }));



    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================

    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ email :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the account is unlinked...
            if(user.local.password == undefined)
                return done(null, false, req.flash('loginMessage', 'Local account is unlinked, signIn using social accounts or create a new account.'));
            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user, req.flash('loginMessage', 'Successfully LoggedIn!'));
        });

    }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================

    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        passReqToCallback : true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        profileFields: configAuth.facebookAuth.profileFields
        
    },

    // facebook will send back the token and profile
    function(req, token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function() {
            // check if the user is already logged in
            if (!req.user) {

                // find the user in the database based on their facebook id
                User.findOne({ email : profile.emails[0].value }, function(err, user) {
                    console.log(profile);
                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err) return done(err);

                    // if the user is found, then log them in
                    if (user) {//unlinked account...

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        // just add our token and profile information
                        if (!user.facebook.token) {
                            user.facebook.token = token;
                            user.facebook.name  = profile.name.givenName+" "+profile.name.familyName;
                            // user.email = profile.emails[0].value;
                            user.facebook.id    = profile.id;

                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }
                        
                        return done(null, user); // user found, return that user
                    } else {//new Account
                         // if there is no user found with that facebook id, create them

                        var newUser = new User();
                        // set all of the facebook information in our user model
                        
                        newUser.local.name = profile.name.givenName+" "+profile.name.familyName;;
                        newUser.local.password = null;
                        newUser.token = null;
                        newUser.type='Client';
                        newUser.facebookLink = null;
                        newUser.twitterLink = null;
                        newUser.linkdinLink = null;

                        newUser.facebook.id    = profile.id; // set the users facebook id                   
                        newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
                        newUser.facebook.name  = profile.name.givenName+" "+profile.name.familyName; // look at the passport user profile to see how names are returned
                        newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                        newUser.google.id = null;
                        newUser.google.token = null;
                        newUser.google.name = null;

                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }
                });
            } else {//link accounts
                // user already exists and is logged in, we have to link accounts

                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                    if(user && req.user.email == profile.emails[0].value){//facebook linked to another account...
                        return done(null,user);
                    }else if(req.user.email == profile.emails[0].value){
                        var user = req.user; // pull the user out of the session

                        // update the current users facebook credentials
                        user.facebook.id    = profile.id;
                        user.facebook.token = token;
                        user.facebook.name  = profile.name.givenName+" "+profile.name.familyName;
                        // user.email = profile.emails[0].value;

                        // save the user
                        user.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, user);
                        });
                    }else{
                        return done(null,user);//locally registered on different mail...
                    };
                });
            };
        });
    }));

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================


    passport.use(new GoogleStrategy({

    clientID        : configAuth.googleAuth.clientID,
    clientSecret    : configAuth.googleAuth.clientSecret,
    callbackURL     : configAuth.googleAuth.callbackURL,
    passReqToCallback: true
    },

    // google will send back the token and profile
    function(req,token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                // find the user in the database based on their facebook id
                User.findOne({ email: profile.emails[0].value}, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        // just add our token and profile information
                        if (!user.google.token) {//unlinked account...
                            user.google.token = token;
                            user.google.name  = profile.displayName;
                            // user.email = profile.emails[0].value;
                            user.google.id    = profile.id;

                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } else {//new Account
                        // if the user isnt in our database, create a new user
                        var newUser          = new User();

                        // set all of the relevant information
                        
                        newUser.local.name = profile.displayName;
                        newUser.local.password = null;
                        newUser.token = null;
                        newUser.type = 'Client';
                        newUser.facebookLink = null;
                        newUser.twitterLink = null;
                        newUser.linkdinLink = null;

                        newUser.facebook.id = null;
                        newUser.facebook.token = null;
                        newUser.facebook.name = null;

                        newUser.google.id    = profile.id;
                        newUser.google.token = token;
                        newUser.google.name  = profile.displayName;
                        newUser.email = profile.emails[0].value; // pull the first email

                        // save the user
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            } else {//link accounts
                User.findOne({ 'google.id' : profile.id }, function(err, user) {
                    if(user && user.email == profile.emails[0].value){//facebook linked to another account...
                        return done(null,user);
                    }else if(req.user.email === profile.emails[0].value){
                        // user already exists and is logged in, we have to link accounts
                        var user = req.user; // pull the user out of the session
                        console.log(req.user.email);
                        // update the current users facebook credentials
                        user.google.id    = profile.id;
                        user.google.token = token;
                        user.google.name  = profile.displayName;
                        // user.email = profile.emails[0].value;

                        // save the user
                        user.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, user);
                        });
                    }else{
                        return done(null,user);//locally registered on different mail...
                    };
                });
            };
        });
    }));
};