var LogicLib = require('../logic/login-basic');
var Verbose = require('../../../config/verbose_errors.json');
var SGError = require('../../errorhandler/SagaError');

var state = config.state.validated;

module.exports = function (app) {

	app.SGpost('/auth/user/login', {
		'body.username' : ['notNull', 'notEmpty'],
		'body.password'	: ['notNull', 'notEmpty']
	}, { auth: false, sanitize: true }, function (username, password, req, res) {
		LogicLib.process(username, password, state, function (error, token, user) {
			if(error) {
				res.SGsend(new SGError(error.error || Verbose[error.msg]));
			}
			else {
				res.SGsend({
					token: token,
					user: user
				});
			}
		});
	});

};
