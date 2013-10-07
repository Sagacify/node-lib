var LogicLib = require('../logic/logout-logic');
var Verbose = require('../../../config/verbose_errors.json');
var SGError = require('../../errorhandler/SagaError');

var state = config.state.validated;

module.exports = function (app) {

	app.SGpost('/auth/user/logout', {}, { auth: true, sanitize: true }, function (req, res) {
		var userid = req.user.id;
		LogicLib.process(userid, state, function (error) {
			if(error) {
				res.SGsend(new SGError(error.error || Verbose[error.msg]));
			}
			else {
				res.SGsend(200);
			}
		});
	});

};
