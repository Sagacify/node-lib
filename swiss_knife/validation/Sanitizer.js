var Sanitizer = require('validator').Filter;

Sanitizer.prototype.error = function (msg) {
	model('Bug')({
		message: msg
	}).upsertBug({
		message: msg
	});
    return this;
};

Sanitizer.prototype.getErrors = function () {
    return this._errors;
};

exports.class = Sanitizer;
