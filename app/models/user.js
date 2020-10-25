var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var autoIncrement = require("mongoose-auto-increment");

// define the schema for our user model...
autoIncrement.initialize(mongoose.connection);

var userSchema = mongoose.Schema({
    email: String,
    image: String,
    description: String,
    qualification: String,
    local            : {
        password     : String,
        name         : String,
        isVerified   : {
            type: Boolean,
            default: false
        }
    },
    facebook         : {
        id           : String,
        token        : String,
        name         : String,
    },
    google           : {
        id           : String,
        token        : String,
        name         : String
    },
    token: String,
    type: String,
    subtype:String,
    location: {
        type:String,
        default:null
    },
    phone: {
        type:String,
        default:null
    },
    notifications:Array,
    count:{
        type:Number,
        default:0
    },
    description : String,
    facebookLink:String,
    twitterLink:String,
    linkdinLink:String
});

// methods ======================

// generating a hash...
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

// checking if password is valid...
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

//generating json web token...
userSchema.methods.generateJWT = function() {
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        id: this._id,
        name: this.local.name,
        exp: parseInt(exp.getTime() / 1000),
    }, 'secret');
};

// create the model for users and expose it to our app
userSchema.plugin(autoIncrement.plugin, "User");
module.exports = mongoose.model('User', userSchema);