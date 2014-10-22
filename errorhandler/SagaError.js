var FrostyBug = require('./FrostyBug');

function SGError(type, code, verbose, args) {
	if((arguments.length === 1) && (type instanceof Error)) {
		var error = type;
		this.generatePrivateError(error);
	} else {
		this.generatePublicError(type, code, verbose, args);
	}
	
	FrostyBug('FrostyBug', {
		msg: (type instanceof Error) ? type : this
	});
}

SGError.prototype.generatePrivateError = function(error) {
	this.code = 500;
	this.type = 'generic';
	this.verbose = 'Oops, something bad happened.';
	this.stack = ('stack' in error) ? error.stack : (new Error().stack);
};

SGError.prototype.generatePublicError = function(type, code, verbose, args) {
	this.type = type || 'generic';
	this.code = code || 500;
	this.verbose = verbose || '';
	this.stack = new Error().stack;
	this.args = args;
};

module.exports = SGError;