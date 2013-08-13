var LogicLib = require('../logic/Forgotten_password-logic');
var Verbose = require('../../../config/verbose_errors.json');
var Mailer = require('../tools/Mailer');

module.exports = function(app) {

	//app.get('/auth/user/forgot_password', function(req, res) { });

	app.post('/auth/user/forgot_password', function(req, res) {
		if(!('username' in req.body) || (!req.body.username.length)) {
			res.send({ msg: Verbose['MISSING_EMAIL'] });
		}
		else {
			var object = {
				username: req.body.username.toLowerCase()
			};
			LogicLib.process(object, 'username', config.state.validated, function(error, token, user) {
				if(error) {
					console.log(error.error);
					res.send({ msg: Verbose[error.msg] });
				}
				else {
					Mailer.send_PasswordResetMail(token, user);
					res.send(null, { success: true });
				}
			});
		}
	});
};
