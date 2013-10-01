var LogicLib = require('../logic/forgot_password-logic');
var Verbose = require('../../../../config/verbose_errors.json');
var Mailer = require('../../mail/Mailer');
var SGError = require('../../errorhandler/SagaError');

var state = config.state.validated;

module.exports = function (app) {

	app.SGpost('/auth/user/forgot_password', {
		'body.email': ['notNull', 'notEmpty', 'isEmail']
	}, { auth: false, sanitize: true }, function (email, req, res) {
		LogicLib.process(email, state, function (error, token, user) {
			if(error) {
				res.SGsend(new SGError(error.error || Verbose[error.msg]));
			}
			else {
				Mailer.send_PasswordResetMail(token, user, function (error) {
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
