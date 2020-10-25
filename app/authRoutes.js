const express  = require('express');
var authenticate = require("../helpers/authenticate"); 
var router = express.Router();

//Home Page...
router.get("/", (req,res)=>{
    res.render("home",{currentUser:req.user, message: req.flash('loginMessage')});
});
router.get("/about", (req,res)=>{
    res.render("about",{user:req.user});
});
router.get("/faq",(req,res)=>{
    res.render("faq",{user:req.user});
});
router.get("/started",(req,res)=>{
    res.render("started",{user:req.user});
});
//Login
router.get("/login",authenticate.login);
router.post('/login',authenticate.localLogin);

//SignUp
router.get('/signup',authenticate.signup);
router.post('/signup',authenticate.localSignup);

//Verification
router.get("/register/verification/:authToken/:email",authenticate.localVerification);

//Password Forget...
router.post("/forgetPassword", authenticate.forgetPassword);

router.get("/forgetPassword",authenticate.forgetPasswordReset);

router.get("/renew/:email",authenticate.renew);

router.post("/resetPassword", authenticate.renewPassword);    

// route for facebook authentication and login
router.get('/auth/facebook', authenticate.facebook);

// handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback', authenticate.facebookLogin);

// send to google to do the authentication
// profile gets us their basic information including their name
// email gets their emails
router.get('/auth/google', authenticate.google);

// the callback after google has authenticated the user
router.get('/auth/google/callback',authenticate.googleLogin);

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

// locally --------------------------------
router.get('/connect/local/:email', authenticate.connectLocal);
router.post('/connect/local', authenticate.localAuthorize);

// facebook -------------------------------

// send to facebook to do the authentication
router.get('/connect/facebook', authenticate.connectFacebook);

// handle the callback after facebook has authorized the user
router.get('/connect/facebook/callback',authenticate.authorizeFacebook);


// google ---------------------------------

// send to google to do the authentication
router.get('/connect/google', authenticate.connectGoogle);

// the callback after google has authorized the user
router.get('/connect/google/callback',authenticate.authorizeGoogle);

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

// local -----------------------------------
router.get('/unlink/local', authenticate.unlinkLocal);

// facebook -------------------------------
router.get('/unlink/facebook', authenticate.unlinkFacebook);

// google ---------------------------------
router.get('/unlink/google', authenticate.unlinkGoogle);

//Profile Page...
router.get('/profile',authenticate.isLoggedIn,(req,res)=>{
    res.render('profile',{ anyuser : req.user, user:req.user, message: req.flash('loginMessage') }); 
});
router.get("/profile/:email",authenticate.isLoggedIn,authenticate.getProfile);

router.get("/notify/:email",authenticate.sendNotification);
router.get("/notifications",authenticate.isLoggedIn,authenticate.getNotification);

//logout
router.get('/logout',(req,res)=>{
    req.logout();
    req.flash("loginMessage","You are Logged Out!");
    res.redirect("/");
});

module.exports = router;
// route middleware to make sure a user is logged in
