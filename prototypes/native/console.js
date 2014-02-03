Object.defineProperty(global, '__stack', {
	get: function () {
		var origin = Error.prepareStackTrace;
		Error.prepareStackTrace = function (_, stack) {
			return stack;
		};
		var error = new Error();
		Error.captureStackTrace(error, arguments.callee);
		var stack = error.stack;
		Error.prepareStackTrace = origin;
		return stack;
	}
});

Object.defineProperty(global, '__benchmarkStack', {
	get: function () {
		var stackLimit = Error.stackTraceLimit;
		Error.stackTraceLimit = 100;
		var origin = Error.prepareStackTrace;
		Error.prepareStackTrace = function (_, stack) {
			return stack;
		};
		var error = new Error();
		Error.captureStackTrace(error, arguments.callee);
		var stack = error.stack;
		Error.prepareStackTrace = origin;
		Error.stackTraceLimit = stackLimit;
		return stack;
	}
});

Object.defineProperty(global, '__benchmarkOrigin', {
	get: function () {
		var stack = __benchmarkStack;
		var structured = '';
		var isQueryBenchmark;
		var isStrictTyping;
		var isRouteHandler;
		var isNodeModule;
		var isValidation;
		var isPrototype;
		var hasSlash;
		var filename;
		var trace;
		for(var i = 0, len = stack.length; i < len; i++) {
			trace = stack[i];
			filename = trace.getFileName();
			isQueryBenchmark = filename.indexOf('queryBenchmarks');
			isStrictTyping = filename.indexOf('strict_typing');
			isRouteHandler = filename.indexOf('route_handler');
			isNodeModule = filename.indexOf('node_modules');
			isValidation = filename.indexOf('validation');
			isPrototype = filename.indexOf('prototypes');
			hasSlash = filename.indexOf('/');
			if((hasSlash !== -1) && (isNodeModule === -1) && (isStrictTyping === -1) && (isQueryBenchmark === -1) && (isPrototype === -1) && (isRouteHandler === -1) && (isValidation === -1)) {
				structured += trace.getFileName() + ' : ';
				structured += trace.getLineNumber() + ' - ';
				structured += trace.getFunctionName() + '()';
				break;
			}
		}
		var fullStructured = '';
		for(var k = 0, len = stack.length; k < len; k++) {
			trace = stack[k];
			fullStructured += trace.getFileName() + ' : ';
			fullStructured += trace.getLineNumber() + ' - ';
			fullStructured += trace.getFunctionName() + '()';
		}
		return [structured, fullStructured];
	}
});

// Object.defineProperty(global, '__formatQueryStack', {
// 	get: function () {
// 		var stack = __benchmarkStack;
// 		var structured = '';
// 		for(var i = 0, len = stack.length; i < len; i++) {
// 			structured += trace.getFileName() + ' : ';
// 			structured += trace.getLineNumber() + ' - ';
// 			structured += trace.getFunctionName() + '()';
// 			structured += '\n';
// 		}
// 		return structured;
// 	}
// });

Object.defineProperty(global, '__line', {
	get: function () {
		var stack = __stack[2];
		return stack && stack.getLineNumber() || '';
	}
});

Object.defineProperty(global, '__function', {
	get: function () {
		var stack = __stack[2];
		return stack && stack.getFunctionName() || 'anonymous';
	}
});

Object.defineProperty(global, '__script', {
	get: function () {
		var stack = __stack[2];
		return stack && stack.getFileName() || '';
	}
});


var winston = require('winston');
winston.add(winston.transports.File, { filename: 'somefile.log' });

// console._log = console.log;
// console.log = function(text){
// 	console._log(__script + ' : ' + __line);
// 	console._log.apply(this, arguments);
// };


// console._log = console.log;
// console.log = function(text){
// 	winston.info(text); 
// };