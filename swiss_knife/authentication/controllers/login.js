var LogicLib = require('../logic/Login-logic');
var Verbose = require('../../../../config/verbose_errors.json');

module.exports = function(app) {

	//app.get('/auth/user/login', function(req, res) { });

	app.post('/auth/user/login', function(req, res) {
		if(!('username' in req.body) || (!req.body.username.length)) {
			res.send({ msg: Verbose['MISSING_EMAIL'] });
		}
		else if(!('password' in req.body) || (!req.body.password.length)) {
			res.send({ msg: Verbose['MISSING_PASSWORD'] });
		}
		else {
			var object = {
				username: req.body.username.toLowerCase(),
				password: req.body.password
			};
			LogicLib.process(object, 'username', config.state.validated, function(error, token, user) {
				if(error) {
					console.log(error.error);
					res.send({ msg: Verbose[error.msg] });
				}
				else {
					res.send(null, { token: token, user: user });
				}
			});
		}
	});
};
