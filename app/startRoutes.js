const express  = require('express');
var multer = require('multer');
var path = require('path');
var router = express.Router();
var User            = require('./models/user');
var Job            = require('./models/job');


// router.use(express.static(__dirname + "./public"));

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    req.flash("loginMessage", "Please Login To The Profile First!");
    res.redirect('/login');
};

var Storage = multer.diskStorage({
    destination:"D:\\University\\Programming\\Web-Development\\PickUply\\public\\assets\\profiles",
    filename:(req,file,cb)=>{
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
    }
});

var upload = multer({
    storage:Storage
}).single('profile');

////

router.post("/started",async (req,res)=>{
    await User.find({ location: req.body.location.toLowerCase()},(err,foundUsers)=>{
        if(err){
            console.log(err);
        }
        else res.render("started",{workers:foundUsers,location: req.body.location, user:req.user});
    });
    
});

router.get("/started/:subType",isLoggedIn, async (req,res)=>{
    await User.find({subtype:req.params.subType,location: req.user.location.toLowerCase()},(err,foundUsers)=>{
        if(err){
            console.log(err);
        }
        else res.render("started",{workers:foundUsers,location: req.user.location,user:req.user});
    }); 
});

router.get("/update",isLoggedIn,(req,res)=>{
    res.render("update",{user:req.user});
});

router.get("/delete",isLoggedIn,async(req,res)=>{
    await User.findByIdAndRemove(req.user.id, function(err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("loginMessage", "Profile Deleted!");
            res.redirect("/");
        }
    });
});

router.post("/update",isLoggedIn, upload ,async (req,res,next)=>{
    await User.findOne({email: req.body.email},(err,foundUser)=>{
        if(err) console.log(err);
        foundUser.local.name = req.body.name;
        foundUser.email = req.body.email;
        foundUser.phone = req.body.phone;
        foundUser.location = req.body.location.toLowerCase();
        foundUser.description = req.body.description;
        foundUser.qualification = req.body.qualification;
        foundUser.subtype = req.body.subtype;
        foundUser.facebookLink=req.body.fb;
        foundUser.twitterLink = req.body.tw;
        foundUser.linkdinLink = req.body.ld;
        if(req.file) foundUser.image = req.file.filename;
        return foundUser.save();
    });
    req.flash("loginMessage", "Successfully Updated The Profile.")
    res.redirect("/profile");

});

router.get("/profile/:email",isLoggedIn,async (req,res)=>{
    await User.findOne({email:req.params.email},(err,foundUser)=>{
        if(err) console.log(err);
        res.render("profile",{anyuser:foundUser, user:req.user});
    });
});

router.get("/postJob",isLoggedIn, async (req,res)=>{
    res.render("post",{user:req.user});
});

router.post("/postJob",isLoggedIn, async (req,res)=>{
    Job.create({
        clientName:req.body.name,
        projectDescription:req.body.description,
        workerType:req.body.subtype,
        image:"public\assets\images\signup-image(1).jpg",
        general:{
            clientLocation:req.body.location,
            email:req.body.email,
            phone:req.body.phone,
            status:req.body.status
        },
        facebookLink:req.body.fb,
        twitterLink:req.body.tw,
        linkdinLink:req.body.ld
    },(err,job)=>{
        if(err) console.log(err);
        else console.log(job);
    });
    res.redirect("/");
});

router.get("/jobs",isLoggedIn,async (req,res)=>{
    await Job.find({'general.clientLocation':req.user.location},(err,foundJobs)=>{
        if(err) console.log(err);
        res.render("jobs",{user:req.user,jobs:foundJobs,location:req.user.location});
    });
});

router.get("/jobs/:subType",isLoggedIn, async (req,res)=>{
    await Job.find({workerType:req.params.subType, 'general.clientLocation':req.user.location},(err,foundJobs)=>{
        if(err){
            console.log(err);
        }
        else res.render("jobs",{jobs:foundJobs,user:req.user,location:req.user.location});
    }); 
});


module.exports = router;