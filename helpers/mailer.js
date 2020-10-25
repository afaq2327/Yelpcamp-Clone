const 
nodemailer = require("nodemailer"),
keys = require("../config/auth");


module.exports = function(receiverEmail,authToken){
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
        to: receiverEmail, // list of receivers
        subject: 'Email Verification Pickuply', // Subject line
        html: '<p>Click <a href="http://localhost:3000/register/verification/' + authToken + '/'+receiverEmail+'">here</a> to activate your Account.</p>' // plain text body
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
        console.log(err);
        else
        console.log("email send!");
    });

}