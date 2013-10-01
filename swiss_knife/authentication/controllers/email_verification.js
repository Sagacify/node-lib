var LogicLib = require('../logic/email_verification-logic');
var Verbose = require('../../../../config/verbose_errors.json');
var SGError = require('../../errorhandler/SagaError');

var state = config.state.unvalidated;

module.exports = function (app) {

	app.SGpost('/auth/user/verify_email', {
		'body.email'	: ['notNull', 'notEmpty', 'isEmail'],
		'body.password'	: ['notNull', 'notEmpty'],
		'body.token'	: ['notNull', 'notEmpty', 'isSha2_Hash']
	}, { auth: false, sanitize: true }, function (email, password, token, req, res) {
		LogicLib.process(email, password, token, state, function (error, token, user) {
			if(error) {
				res.SGsend(new SGError(error.error || Verbose[error.msg]));
			}
			else {
				res.send({ token: token, user: user });
			}
		});
	});

};
