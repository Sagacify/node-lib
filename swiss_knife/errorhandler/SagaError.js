var verbose_errors = require('./verbose_errors');

var FrostyBug = require('./FrostyBug');
var EventEmitter = FrostyBug.EventEmitter;

module.exports = function SGError (type, code, verbose){
	this.type = type||'generic';
	this.code = code||verbose_errors[this.type][0];
	this.verbose = verbose||verbose_errors[this.type][1];
	this.stack = new Error().stack;
	EventEmitter.emit('FrostyBug', { msg: this });
};
