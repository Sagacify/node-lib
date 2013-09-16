var LogicLib = require('../logic/Registration-logic');
var Verbose = require('../../../../config/verbose_errors.json');
var Mailer = require('../tools/Mailer');

module.exports = function(app) {

	//app.get('/auth/user/register', function(req, res) { });

	app.post('/auth/user/register', function(req, res) {
		if(!('username' in req.body) || (!req.body.username.length)) {
			res.send({ msg: Verbose['MISSING_EMAIL'] });
		}
		else if(!('fullname' in req.body) || (!req.body.fullname.length)) {
			res.send({ msg: Verbose['MISSING_FULLNAME'] });
		}
		else if(!('password' in req.body) || (!req.body.password.length)) {
			res.send({ msg: Verbose['MISSING_PASSWORD'] });
		}
		else {
			var object = {
				username: req.body.username.toLowerCase(),
				password: req.body.password,
				fullname: req.body.fullname
			};
			LogicLib.process(object, 'username', function(error, token, user) {
				if(error) {
					console.log(error.error);
					res.send({ msg: Verbose[error.msg] });
				}
				else {
					Mailer.send_VerficationMail(token, user);
					res.send(null, { success: true });
				}
			});
		}
	});
};
