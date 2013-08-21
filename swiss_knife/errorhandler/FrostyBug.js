/**
* FrostyBug.js adds server-side error reporting features.
*/

require('./bug-model');

var events = require('events');

exports.errorHandler = function(app) {

	var EventEmitter = new events.EventEmitter();

	EventEmitter.on('FrostyBug', function(args) {
		if(args && (args.length > 0)) {
			var bug = model('FRBug')({
				message: args.msg
			}).upsertBug({
				message: args.msg
			});
		}
	});

	(function() {
		var oldError = Error;
		Error = function(arg) {
			EventEmitter.emit('FrostyBug', { msg: arguments });
			return new oldError(arg);
		};
		process.on('uncaughtException', function(err) {
			EventEmitter.emit('FrostyBug');
		});
	})();

};
