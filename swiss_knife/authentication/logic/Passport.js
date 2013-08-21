var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var LoginLib = require('../logic/Login-logic.js');
var TokenLib = require('../logic/Authenticate_Token-logic.js');
var Config = require('../../../../config/verbose_errors.json');

// LOGIN strategy
passport.use(new LocalStrategy(function(username, password, done) {
	var object = {
		username: username.toLowerCase(),
		password: password
	};
	LoginLib.process(object, 'username', Config.state.validated, function(error, token, user) {
		if(error) {
			console.log(error);
			//return done(null, false, { message: error.msg });
			return done(null, false);
		}
		else {
			user.token = token;
			return done(null, user);
		}
	});
}));

// BEARER / TOKEN strategy
passport.use(new BearerStrategy(/*{ passReqToCallback: true },*/ function(token, done) {
	var authHeader = token.split('|');
	var object = {
		username: authHeader[0].toLowerCase(),
		token: authHeader[1]
	};
	process.nextTick(function () {
		TokenLib.process(object, 'username', Config.state.validated, function(error, token, user) {
			if(error) {
				console.log(error);
				//return done(null, false, { message: error.msg });
				return done(null, false);
			}
			else {
				user.token = token;
				return done(null, user, { scope: 'all' });
			}
		});
	});
}));

passport.serializeUser(function(user, done) {
	console.log('serialize');
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	console.log('deserialize');
	User.findOne(id, function (err, user) {
		done(err, user);
	});
});

