var LogicLib = require('../logic/email_verification-logic');
var Verbose = require('../../../../config/verbose_errors.json');

var state = config.state.unvalidated;

module.exports = function (app) {

	app.Post('/auth/user/verify_email', {
		'body.username' : ['notNull', 'notEmpty'],
		'body.email'	: ['notNull', 'notEmpty', 'isEmail'],
		'body.password'	: ['notNull', 'notEmpty'],
		'body.token'	: ['notNull', 'notEmpty', 'isSha2_Hash']
	}, false, true, function (userid, password, token, req, res) {
		LogicLib.process(userid, password, token, state, function (error, token, user) {
			if(error) {
				console.log(error.error);
				res.send({ msg: Verbose[error.msg] });
			}
			else {
				res.send(null, { token: token, user: user });
			}
		});
	});

};
