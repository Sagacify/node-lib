var Sanitizer = require('validator').Filter;

var instance = new Sanitizer();

instance.error = function (msg) {
	model('Bug')({
		message: msg
	}).upsertBug({
		message: msg
	});
    return false;
};

instance.getErrors = function () {
    return this._errors;
};

module.exports = instance;
