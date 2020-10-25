var User            = require('../app/models/user');
var jwt = require('jsonwebtoken');
var keys = require("../config/auth");
var nodemailer  = require("nodemailer");

module.exports.login = (req,res)=>{
    res.render("login",{ message: req.flash('loginMessage') }); 
};

module.exports.localLogin = passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
});

module.exports.signup = (req,res)=>{
    res.render('signup',{ message: req.flash('signupMessage') });
};

module.exports.localSignup = passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
});

module.exports.localVerification = async (req,res)=>{
    const userToken = req.params.authToken;
    const email = req.params.email;
    
    await User.findOne({email:email},function(err,foundUser){
        if(err) return res.status(400).send("User Not found!");

        else{
            if (foundUser.local.isVerified) return res.render("../views/login",{ message: req.flash('signupMessage') });
            else{
                try{
                    const verified = jwt.verify(userToken,'secret');

                    console.log("here");
                    if(verified){
                        foundUser.local.isVerified = true;
                        foundUser.save();
                        return res.render("../views/login",{ message: req.flash('signupMessage') });
                    }
                    else res.send("Your Activation Code has Expired!");
                }catch(err){
                    res.status(400).send("Your Activation Code has Expired or Incorrect!");
                }
            };
        };
    });
};

module.exports.forgetPassword = async (req,res)=>{
    const email = req.body.email;
    const user = await User.findOne({email:email});
    if(user){
        //sending mail...
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: keys.mailerAuth.ADMIN_GMAIL,
                pass: keys.mailerAuth.ADMIN_PASS
            }
        });
        
        // send mail with defined transport object
        const mailOptions = {
            from: keys.mailerAuth.ADMIN_GMAIL, // sender address
            to: email, // list of receivers
            subject: 'Password Reset Pickuply', // Subject line
            html: '<p>Click <a href="http://localhost:3000/renew' + '/' +req.body.email+'">here</a> to reset your Password.</p>' // plain text body
        };
        
        transporter.sendMail(mailOptions, function (err, info) {
            if(err)
            console.log(err)
            else
            console.log('email send');
        });
    }else{
        res.render("signup",{ message: req.flash('signupMessage') });
    }
    res.render("info");
};

module.exports.forgetPasswordReset = async (req,res)=>{
    res.render("reset");
};

module.exports.renew = (req,res)=>{
    res.render("renew",{email:req.params.email});
};

module.exports.renewPassword = async (req,res)=>{
    const email = req.body.email;

    await User.findOne({email:email},function(err,foundUser){
        if(foundUser){
            //hashing password...
            var password = foundUser.generateHash(req.body.password);
            foundUser.local.password = password;
            return foundUser.save();
        }
        else{
            res.render("/signup",{ message: req.flash('signupMessage') });
        }
    });
    res.render("login",{ message: req.flash('loginMessage') });
};

module.exports.facebook = passport.authenticate('facebook', { 
    scope : ['public_profile', 'email']
});

module.exports.facebookLogin = passport.authenticate('facebook', {
    successRedirect : '/profile',
    failureRedirect : '/'
});

module.exports.google = passport.authenticate('google', { 
    scope : ['profile', 'email'],
    prompt: 'select_account'
 });

module.exports.googleLogin = passport.authenticate('google', {
    successRedirect : '/profile',
    failureRedirect : '/'
});

module.exports.connectLocal = (req, res)=>{
    res.render("connect-local",{email:req.params.email});
};

module.exports.localAuthorize = async (req,res)=>{
    await User.findOne({email:req.body.email},function(err,foundUser){
        if(foundUser){
            //hashing password...
            var password = foundUser.generateHash(req.body.password);
            foundUser.local.password = password;
            foundUser.local.name = foundUser.facebook.name;
            return foundUser.save();
        }
        else{
            res.render("/signup",{ message: req.flash('signupMessage') });
        }
    });
    res.redirect('/');
};

module.exports.connectFacebook = passport.authorize('facebook', { 
    scope : ['public_profile', 'email']
});

module.exports.authorizeFacebook = passport.authorize('facebook', {
    successRedirect : '/profile',
    failureRedirect : '/logout'
});


module.exports.connectGoogle = passport.authorize('google', { 
    scope : ['profile', 'email'],
    prompt: 'select_account'
 });

module.exports.authorizeGoogle = passport.authorize('google', {
    successRedirect : '/profile',
    failureRedirect : '/logout'
});

module.exports.unlinkLocal = function(req, res) {
    
    var user = req.user;
    if ((user.facebook.token != null || user.facebook.token != undefined) || (user.google.token != null || user.google.token != undefined)){
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    }else{
        res.redirect('/profile');
    }
    
};

module.exports.unlinkFacebook = function(req, res) {
    var user            = req.user;
    if ((user.local.password != null || user.local.password != undefined) || (user.google.token != null || user.google.token != undefined)){
        user.facebook.token = undefined;
        user.facebook.id = undefined;
        user.facebook.name = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    }else{
        res.redirect('/profile');
    }
    
};

module.exports.unlinkGoogle = function(req, res) {
    var user          = req.user;
    if ((user.local.password != null || user.local.password != undefined) || (user.facebook.token != null || user.facebook.token != undefined)){
        
        user.google.token = undefined;
        user.google.id = undefined;
        user.google.name = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    }else{
        res.redirect('/profile');
    }
    
};

module.exports.getProfile = async (req,res)=>{
    await User.findOne({email:req.params.email},(err,foundUser)=>{
        if(err) console.log(err);
        res.render("profile",{anyuser:foundUser, user:req.user, message:req.flash('loginMessage')});
    });
};

module.exports.sendNotification =async (req,res)=>{
    var senderEmail = req.user.email;
    // console.log("sender:",senderEmail);
    var receiverEmail = req.params.email;
    // console.log("receiver:",receiverEmail)
    //sending mail...
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: keys.mailerAuth.ADMIN_GMAIL,
            pass: keys.mailerAuth.ADMIN_PASS
        }
    });
    
    // send mail with defined transport object
    const mailOptions = {
        from: 'afaq.bin.aftab@gmail.com', // sender address
        to: 'afaq.bin.aftab@gmail.com', // list of receivers
        subject: 'Job Opportunity Pickuply', // Subject line
        html: '<p><strong>Congratulations!</strong> Someone has requested for your skills.<a href="http://localhost:3000">Log in<a> to view his profile.</p>' // plain text body
    };
    
    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
        console.log(err)
        else
        console.log('email send');
    });
    
    await User.findOne({email:receiverEmail},(err,foundUser)=>{
        const data = "Your Skills Are Required!";
        console.log(foundUser);
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        foundUser.notifications.push({message:data,type:"unread",date:date,time:time,sender:senderEmail});
        foundUser.count = foundUser.count+1;
        foundUser.save();
    });
    req.flash("loginMessage","Notification has been sent!");
    res.redirect("/profile/"+receiverEmail);

}

module.exports.getNotification =async (req,res)=>{
    await User.findOne({email:req.user.email},(err,foundUser)=>{
        foundUser.count = 0;
        foundUser.save();
    })
    res.send(req.user.notifications.reverse());
};

module.exports.isLoggedIn = function(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
};