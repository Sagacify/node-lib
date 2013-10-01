/**
* FrostyBug.js adds server-side error reporting features.
*/

require('./bug-model');

var events = require('events');
var EventEmitter = new events.EventEmitter();

EventEmitter.on('FrostyBug', function(err) {
	if(_NODE_ENV !== 'production') {
		console.log(err.stack);
		//console.log(arguments);
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






process.on('uncaughtException', function(err) {
	EventEmitter.emit('FrostyBug', err);
});

exports.EventEmitter = EventEmitter;
