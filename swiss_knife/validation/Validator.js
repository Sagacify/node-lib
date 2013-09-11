var Validator = require('validator').Validator;
var extendedTypes = require('./ExtendedTypes');

var typeNames = Object.keys(extendedTypes);
var len = typeNames.length;
var key;
while(len--) {
	key = typeNames[len];
	Validator.prototype[key] = extendedTypes[key];
}

var instance = new Validator();

instance.error = function (msg) {
	model('Bug')({
		message: msg
	}).upsertBug({
		message: msg
	});
    return this;
};

instance.getErrors = function () {
    return this._errors;
};

module.exports = instance;
