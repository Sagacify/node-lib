var LogicLib = require('../logic/change_password-logic');
var Verbose = require('../../../../config/verbose_errors.json');

var state = config.state.validated;

module.exports = function (app) {

	app.Post('/auth/user/change_password', {
		'body.password'		: ['notNull', 'notEmpty'],
		'body.new_password' : ['notNull', 'notEmpty']
	}, true, true, function (password, new_password, req, res) {
		var userid = req.user._id;
		LogicLib.process(userid, password, new_password, state, function (error, token) {
			if(error) {
				console.log(error.error);
				res.send({
					msg: Verbose[error.msg]
				});
			}
			else {
				res.send({ token: token });
			}
		});
	});

};
