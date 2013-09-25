/**
* FrostyBug.js adds server-side error reporting features.
*/

require('./bug-model');

var events = require('events');
var EventEmitter = new events.EventEmitter();

function emitEvent(event, data) {
	EventEmitter.emit(event, data);
}

EventEmitter.on('FrostyBug', function(args) {
	if(_NODE_ENV !== 'production') {
		var error = args.msg;
		consoleError(error);
	}
	if(_NODE_ENV !== 'development') {
		if(args && (args.length > 0)) {
			var bug = model('Bug')({
				message: args.msg
			}).upsertBug({
				message: args.msg
			});
		}
	}
});

// var NativeError = Error;
// Error = function Error (arg) {
// 	EventEmitter.emit('FrostyBug', { msg: arguments });
// 	return new NativeError();
// };

process.on('uncaughtException', function(err) {
	emitEvent('FrostyBug', { msg: err });
});

module.exports = emitEvent;