/**
* FrostyBug.js adds server-side error reporting features.
*/

var events = require('events');

exports.errorHandler = function(app) {

	require('./bug-model');

	var EventEmitter = new events.EventEmitter();

	app.use(function(req, res, next) {
		EventEmitter.on('FrostyBug', function(args) {
			console.log('Args : ');
			console.log(args);
			if(args && (args.length > 0)) {
				var bug = model('FRBug')({ message: args }).saveBug();
			}
			res.send(500, 'Oh, oh, the server got an error.');
		});
		next();
	});

	(function() {
		var oldError = Error;
		Error = function(arg) {
			EventEmitter.emit('FrostyBug');
			console.log('constructor');
			return new oldError(arg);
		};
		process.on('uncaughtException', function(err) {
			EventEmitter.emit('FrostyBug');
		});
	})();

};
