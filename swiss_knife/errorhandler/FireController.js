/**
* FrostyBug.js adds server-side error reporting features.
*/

require('./bug-model');

var events = require('events');

exports.errorReceiver = function(app) {

	app.post('/error-handler/firebug', function(req, res, next) {

		var bug = model('Bug')(req.body).upsertBug(req.body);

		res.send(200);
	
	});

};