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
		consoleError(args.stack || args.msg);
	}
	if(_NODE_ENV !== 'development') {
		if(args && (args.length > 0)) {
			var bug = model('Bug')({
				message: args.err
			}).upsertBug({
				message: args.err
			});
		}
	}
});

// var NativeError = Error;

// Error = function Error (arg) {
// 	//EventEmitter.emit('FrostyBug', { msg: arguments });
// 	err = new NativeError(arg);
// 	return err;
// };



// for(var key in NativeError){
// 	Error[key] = NativeError[key];
// }

// var NativeFunction = Function;
// Function = function Function(){
// 	console.log("fun")
// 	return new NativeFunction(arguments);
// };


// Error = function Error (arg) {
// 	EventEmitter.emit('FrostyBug', { msg: arguments });
// 	return new NativeError();
// };

process.on('uncaughtException', function(err) {
	emitEvent('FrostyBug', { msg: err });
});

module.exports = emitEvent;
