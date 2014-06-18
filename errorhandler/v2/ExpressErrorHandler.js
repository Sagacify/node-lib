/**
* FrostyBug.js adds server-side error reporting features.
*/

require('./bug-model');

function errorReceiver (app) {

	app.post('/api/error-handler/firebug', function (req, res, next) {

		model('SLBug')(req.body).saveBug(req.body || {});

		res.send(200);
	
	});

}

module.exports = errorReceiver;