var FrostyBug = require('./FrostyBug');

module.exports = function SGError (type, code, verbose) {
	if((arguments.length === 1) && (type instanceof Error)) {
		var error = type;
		this.code = 500;
		this.type = 'generic';
		this.verbose = 'Oops, something bad happened.';
		this.stack = ('stack' in error) ? error.stack : (new Error().stack);
	}
	else {
		this.type = type || 'generic';
		this.code = code || 500;
		this.verbose = verbose || '';
		this.stack = new Error().stack;
	}
	FrostyBug('FrostyBug', {
		msg: (type instanceof Error) ? type : this
	});
};
