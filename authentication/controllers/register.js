var LogicLib = require('../logic/register-basic');
var Verbose = require('../../../config/verbose_errors.json');
var Mailer = require('../../mail/Mailer');
var SGError = require('../../errorhandler/SagaError');

module.exports = function (app) {

	app.SGpost('/auth/user/register', {
		'body.email'	: ['notNull', 'notEmpty', 'isEmail'],
		'body.password'	: ['notNull', 'notEmpty'],
		'body.username' : ['notNull', 'notEmpty'],
		'body.name' : ['notNull', 'notEmpty']
	}, { auth: false, sanitize: true }, function (email, password, username, name, req, res) {
		LogicLib.process(email, password, username, name, function (error, token, user) {
			if(error) {
				res.SGsend(new SGError(error.error || Verbose[error.msg]));
			}
			else {
				Mailer.send_VerficationMail(token, user, function (error) {
					if(error) {
						res.SGsend(new SGError(error));
					}
					else {
						res.SGsend(200);
					}
				});
			}
		});
	});

};
