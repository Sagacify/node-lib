var Validator = require('validator').Validator;
Validator.prototype.error = function (msg) {
    this._errors.push(msg);
    return this;
};
Validator.prototype.getErrors = function () {
    return this._errors;
};
var v = new Validator();
var validate = v.check;
var sanitize = v.sanitize;

function applyValidation (value, condition) {
	return validate[condition](value);
}

function applySanitization (value, transform) {
	return sanitize[transform](value) || value;
}

function applyAllConditions(value, conditions) {
	var isValid;
	for(var i = 0, len = conditions.length; i < len; i++) {
		if(condition in validate) {
			isValid = isValid && applyValidation(value, condition);
		}
		else if(condition in sanitize) {
			value = applySanitization(value, condition);
		}
	}
	return isValid ? value : isValid;
}

function handleQueryArgs (req, key) {
	return req.query[key] || undefined;
}

function handleParameters () {
	return req.parameters[key] || undefined;
}

function handleRequest (callback, args, req, res, next) {
	var keys = Object.keys(args);
	var additionalArgs = [];
	var argument;
	var keySplit;
	var value;
	var key;
	for(var i = 0, len = keys.length; i < len; i++) {
		key = keys[i];
		splitkey = key.split('.');
		if(splitkey.length !== 2) {
			console.log('Malformed argument : ' + key);
		}
		else if(splitkey[0] === 'query') {
			argument = handleQueryArgs(req, key);
		}
		else if(splitkey[0] === 'parameters') {
			argument = handleParameters(req, key);
		}
		value = applyAllConditions(key);
		if((argument != null) || (value === false)) {
			res.send({ success: false });
		}
	}
	var argsToArray = Array.apply(null, arguments);
	callback.apply(this, additionalArgs.concat(argsToArray));
}

module.methods = function (app) {

	exports.get = function (uri, args, callback) {
		app.get(uri, passport.authenticate('bearer', { session: false }), function (req, res, next) {
			handleRequest(callback, args, req, res, next);
		});
	};

	exports.post = function (uri, args) {
		app.post(uri, passport.authenticate('bearer', { session: false }), function (req, res, next) {
			handleRequest(callback, args, req, res, next);
		});
	};

	exports.delete = function (uri, args) {
		app.delete(uri, passport.authenticate('bearer', { session: false }), function (req, res, next) {
			handleRequest(callback, args, req, res, next);
		});
	};

	exports.put = function (uri, args) {
		app.put(uri, passport.authenticate('bearer', { session: false }), function (req, res, next) {
			handleRequest(callback, args, req, res, next);
		});
	};

};