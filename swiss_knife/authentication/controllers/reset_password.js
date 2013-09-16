var LogicLib = require('../logic/Password_reset-logic');
var Verbose = require('../../../../config/verbose_errors.json');

module.exports = function(app) {

	//app.get('/auth/user/reset_password', function(req, res) { });

	app.post('/auth/user/reset_password', function(req, res) {
		if(!('username' in req.body) || (!req.body.username.length)) {
			res.send({ msg: Verbose['MISSING_EMAIL'] });
		}
		else if(!('token' in req.body) || (!req.body.token.length)) {
			res.send({ msg: Verbose['MISSING_TOKEN'] });
		}
		else if(!('password' in req.body) || (!req.body.password.length)) {
			res.send({ msg: Verbose['MISSING_PASSWORD'] });
		}
		else {
			var object = {
				username: req.body.username.toLowerCase(),
				password: req.body.password,
				token: req.body.token
			};
			LogicLib.process(object, 'username', config.state.unvalidated, function(error, token, user) {
				if(error) {
					console.log(error);
					res.send({ msg: Verbose[error.msg] });
				}
				else {
					res.send(null, { token: token, user: user });
				}
			});
		}
	});
};
