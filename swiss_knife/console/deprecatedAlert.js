var colors = require('./colors').codes;

exports.deprecatedAlert = function (modulename, methodename, trace) {
	var red = colors.red;
	var blue = colors.blue;
	var reset = colors.reset;
	var message = 'DEPRECATED METHOD in ';
	console.log(red + message + modulename + reset + ' -> ' + blue + methodename + reset);
	console.log(trace);
	process.exit(1);
};

exports.setupInfo = function (modulename) {
	var green = colors.green;
	var reset = colors.reset;
	var message = 'STARTED -> ';
	console.log(green + message + modulename + reset);
};

exports.consoleError = function (error) {
	var red = colors.red;
	var reset = colors.reset;
	console.log(red);
	console.log(error);
	console.log(reset);
	(_NODE_ENV === 'development') && process.exit(1);
};