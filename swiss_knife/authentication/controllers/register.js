var LogicLib = require('../logic/register-basic');
var Verbose = require('../../../../config/verbose_errors.json');
var Mailer = require('../tools/Mailer');

module.exports = function (app) {

	app.SGpost('/auth/user/register', {
		'body.email'	: ['notNull', 'notEmpty', 'isEmail'],
		'body.username' : ['notNull', 'notEmpty'],
		'body.password'	: ['notNull', 'notEmpty']
	}, false, true, function (email, username, password, req, res) {
		var object = {
			username: username,
			password: password,
			email: email
		};
		LogicLib.process(object, 'username', function (error, token, user) {
			if(error) {
				console.log(error.error);
				res.send({
					msg: Verbose[error.msg]
				});
			}
			else {
				Mailer.send_VerficationMail(token, user);
				res.send(200);
			}
		});
	});

};
