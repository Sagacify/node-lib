var LogicLib = require('../logic/logout-logic');
var Verbose = require('../../../../config/verbose_errors.json');

var state = config.state.validated;

module.exports = function (app) {

	app.SGpost('/auth/user/logout', {}, true, true, function (req, res) {
		var userid = req.user.id;
		LogicLib.process(userid, state, function (error) {
			if(error) {
				console.log(error.error);
				res.send({
					msg: Verbose[error.msg]
				});
			}
			else {
				res.send(200);
			}
		});
	});

};
