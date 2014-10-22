var colors = {
	red		: '\u001b[31m',
	blue	: '\u001b[34m',
	reset	: '\u001b[0m',
	green	: '\x1B[32m'
};

exports.deprecatedAlert = function () {
	var red = colors.red;
	var reset = colors.reset;
	var message = 'DEPRECATED METHOD ';
	console.error('\n' + red + message + __function + ' in ' + __script + ' : ' + __line + reset);
	process.exit(1);
};

exports.setupInfo = function (modulename) {
	var green = colors.green;
	var reset = colors.reset;
	var message = 'STARTED -> ';
	console.error(green + message + modulename + reset);
};

exports.consoleError = function (error) {
	var red = colors.red;
	var reset = colors.reset;
	console.error(red);
	if(!error) {
		console.error(error);
	}
	else if(error instanceof Error) {
		console.error(error.stack || error);
	}
	else if(error.constructor.name === 'SGError') {
		console.error('Type : ' + error.type);
		console.error('Verbose : ' + error.verbose);
		console.error(error.stack);
	}
	else if(error.isObject() &&  'stack' in error) {
		console.error(error.stack);
	}
	else {
		console.error(error);
	}
	console.error(reset);
};