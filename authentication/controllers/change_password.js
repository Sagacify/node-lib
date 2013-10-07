var LogicLib = require('../logic/change_password-logic');
var Verbose = require('../../../config/verbose_errors.json');
var SGError = require('../../errorhandler/SagaError');

var state = config.state.validated;

module.exports = function (app) {

	app.SGpost('/auth/user/change_password', {
		'body.password'		: ['notNull', 'notEmpty'],
		'body.new_password' : ['notNull', 'notEmpty']
	}, { auth: true, sanitize: true }, function (password, new_password, req, res) {
		var userid = req.user._id;
		LogicLib.process(userid, password, new_password, state, function (error, token) {
			if(error) {
				res.SGsend(new SGError(error.error || Verbose[error.msg]));
			}
			else {
				res.SGsend({ token: token });
			}
		});
	});

};
