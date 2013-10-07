var verbose_errors = require('./verbose_errors');

var FrostyBug = require('./FrostyBug');

module.exports = function SGError (type, code, verbose) {
	if((arguments.length === 1) && (type instanceof Error)) {
		var error = type;
		this.code = 600;
		this.type = 'generic';
		this.verbose = 'Oops, something bad happened.';
		this.stack = ('stack' in error) ? error.stack : (new Error().stack);
	}
	else {
		this.type = type || 'generic';
		this.code = code || verbose_errors[this.type]?verbose_errors[this.type][0]:600;
		this.verbose = verbose || verbose_errors[this.type]?verbose_errors[this.type][1]:"";
		this.stack = new Error().stack;
	}
	FrostyBug('FrostyBug', { msg: (type instanceof Error) ? type : this });
};
