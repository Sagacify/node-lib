/**
* FrostyBug.js adds server-side error reporting features.
*/

// require('./bug-model');

var events = require('events');
var EventEmitter = new events.EventEmitter();

function emitEvent(event, data) {
	EventEmitter.emit(event, data);
}

EventEmitter.on('FrostyBug', function (args) {
	// if(config.errorLog) {
	// 	if(args) {
	// 		var bug = model('Bug')({
	// 			message: args.err
	// 		}).upsertBug({
	// 			message: args.err
	// 		});
	// 	}
	// }
	if('SLBug' in mongoose.models) {
		model('SLBug')({
			error: {
				msg: args.stack || args.msg
			}
		}).saveBug();
	}
	consoleError(args.stack || args.msg);
});

process.on('uncaughtException', function (err) {
	emitEvent('FrostyBug', { msg: err });
});

module.exports = emitEvent;
