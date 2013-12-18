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
	console.log('\n' + red + message + __function + ' in ' + __script + ' : ' + __line + reset);
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
	if(!error) {
		console.log(error);
	}
	else if(error instanceof Error) {
		console.log(error.stack || error);
	}
	else if(error.constructor.name === 'SGError') {
		console.log('Type : ' + error.type);
		console.log('Verbose : ' + error.verbose);
		console.log(error.stack);
	}
	else if(error.isObject() &&  'stack' in error) {
		console.log(error.stack);
	}
	else {
		console.log(error);
	}
	console.log(reset);
};