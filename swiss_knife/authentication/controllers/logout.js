var LogicLib = require('../logic/Logout-logic');
var Verbose = require('../../../../config/verbose_errors.json');

module.exports = function(app) {

	//app.get('/auth/local/logout', function(req, res) { });

	app.post('/auth/local/logout', function(req, res) {
		if(!('username' in req.body) || (!req.body.username.length)) {
			res.send({ msg: Verbose['MISSING_EMAIL'] });
		}
		else if(!('token' in req.body) || (!req.body.token.length)) {
			res.send({ msg: Verbose['MISSING_TOKEN'] });
		}
		else {
			var object = {
				username: req.body.username.toLowerCase(),
				token: req.body.token
			};
			LogicLib.process(object, 'username', config.state.validated, function(error) {
				if(error) {
					console.log(error.error);
					res.send({ msg: Verbose[error.msg] });
				}
				else {
					res.send(null, { success: true });
				}
			});
		}
	});
};
