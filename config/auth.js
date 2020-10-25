module.exports = {

    'facebookAuth' : {
        'clientID'      : '799933870479782', // your App ID
        'clientSecret'  : '43552ec9163059e2f6bc35cf2b166e32', // your App Secret
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback',
        'profileURL'    : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields' : ['id', 'email', 'name'] // For requesting permissions from Facebook API
    },

    'googleAuth' : {
        'clientID'      : '83880638613-kl2363mna5mc7ms38u2v065c964v4h0u.apps.googleusercontent.com',
        'clientSecret'  : 'IMzQIAVw4PDXAUzkWZG4Qvhl',
        'callbackURL'   : 'http://localhost:3000/auth/google/callback'
    },
    'mailerAuth' : {
        ADMIN_GMAIL : 'afaq.bin.aftab@gmail.com',
        ADMIN_PASS : 'AFaq2327,',
    },
    'databaseAuth':{
        'url' : 'mongodb://localhost/PickUply'
    }
    
};