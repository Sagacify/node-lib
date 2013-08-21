var LogicLib = require('../logic/Password_change-logic');
var Verbose = require('../../../../config/verbose_errors.json');

module.exports = function(app) {

	//app.get('/api/user/change_password', function(req, res) { });

	app.post('/api/user/change_password', function(req, res) {
		if(!('username' in req.body) || (!req.body.username.length)) {
			res.send({ msg: Verbose['MISSING_EMAIL'] });
		}
		else if(!('token' in req.body) || (!req.body.token.length)) {
			res.send({ msg: Verbose['MISSING_TOKEN'] });
		}
		else if(!('password' in req.body) || (!req.body.password.length)) {
			res.send({ msg: Verbose['MISSING_PASSWORD'] });
		}
		else if(!('new_password' in req.body) || (!req.body.new_password.length)) {
			res.send({ msg: Verbose['MISSING_NEW_PASSWORD'] });
		}
		else {
			var object = {
				username: req.body.username.toLowerCase(),
				password: req.body.password,
				new_password: req.body.new_password,
				token: req.body.token
			};
			LogicLib.process(object, 'username', config.state.validated, function(error, token) {
				if(error) {
					console.log(error.error);
					res.send({ msg: Verbose[error.msg] });
				}
				else {
					res.send(null, { token: token });
				}
			});
		}
	});
};
