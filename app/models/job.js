var mongoose = require('mongoose');
var autoIncrement = require("mongoose-auto-increment");

// define the schema for our user model...
autoIncrement.initialize(mongoose.connection);

var jobSchema = mongoose.Schema({
    clientName:String,
    projectDescription:String,
    workerType:String,
    image:String,
    general:{
        clientLocation:String,
        email:String,
        phone:String,
        status:String
    },
    facebookLink:String,
    twitterLink:String,
    linkdinLink:String
});

// create the model for users and expose it to our app
jobSchema.plugin(autoIncrement.plugin, "Job");
module.exports = mongoose.model('Job', jobSchema);