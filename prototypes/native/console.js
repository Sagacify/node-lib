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

// console._log = console.log;
// console.log = function(text){
// 	console._log(__script +' : ' + __line);
// 	console._log(text+'\n');
// };