var Handle = require('../responses/HttpResponseHandlers.js');

var Caja = require('./GoogleCaja.js');

var validatorInstance = require('./Validator.js');
var check = validatorInstance.check;

var sanitizerInstance = require('./Sanitizer.js');
var sanitize = sanitizerInstance.sanitize;

function applyAllConditions(value, conditions) {
	var condition;
	var isValid;
	for(var i = 0, len = conditions.length; i < len; i++) {
		condition = conditions[i];
		if(!validatorInstance.check(value)[condition]()) {
			isValid = false;
			break;
		}
	}
	return isValid === false ? isValid : value;
}

function handleQueryArgs (req, key) {
	return req.query[key] || undefined;
}

function handleBodyArgs (req, key) {
	return req.body[key] || undefined;
}

function handleParameterElement (req, key) {
	return req.params[key] || undefined;
}

function handleRequest (callback, args, caja, req, res, next) {
	var keys = Object.keys(args);
	var additionalArgs = [];
	var conditions;
	var argument;
	var splitkey;
	var escaped;
	var value;
	var prop;
	var key;
	for(var i = 0, len = keys.length; i < len; i++) {
		key = keys[i];
		splitkey = key.split('.');
		if(splitkey.length !== 2) {
			return Handle.missingQueryElement(res);
		}
		else if(splitkey[0] === 'query') {
			prop = splitkey[1];
			argument = handleQueryArgs(req, prop);
			if(argument === undefined) {
				return Handle.missingQueryElement(res);
			}
		}
		else if(splitkey[0] === 'body') {
			prop = splitkey[1];
			argument = handleBodyArgs(req, prop);
			if(argument === undefined) {
				return Handle.missingParams(res);
			}
		}
		else if(splitkey[0] === 'params') {
			prop = splitkey[1];
			argument = handleParameterElement(req, prop);
			if(argument === undefined) {
				return Handle.missingParams(res);
			}
		}
		conditions = args[key];
		value = applyAllConditions(argument, conditions);
		console.log(argument + ' -> ' + !!value);
		if(value === false) {
			return Handle.validationFail(res);
		}
		else  {
			escaped = (caja === false) ? value : Caja.escape(value);
			additionalArgs.push(escaped);
		}
	}
	//var argsToArray = Array.apply(null, arguments);
	var argsToArray = [req, res, next]; // find better way to do this
	var newArguments = additionalArgs.concat(argsToArray);
	callback.apply(this, newArguments);
}

module.exports = function (app) {

	var BearerAuth = require('../authentication/logic/authenticate_bearer.js');

	app.use(BearerAuth.process);

	var _get = function (uri, args, auth, caja, callback) {
		app.get(uri, function (req, res, next) {
			return auth ? bearerAuth : next();
		}, function (req, res, next) {
			handleRequest(callback, args, caja, req, res, next);
		});
	};
	app.Get = _get;

	var _post = function (uri, args, auth, caja, callback) {
		app.post(uri, function (req, res, next) {
			return auth ? bearerAuth : next();
		}, function (req, res, next) {
			handleRequest(callback, args, caja, req, res, next);
		});
	};
	app.Post = _post;

	var _delete = function (uri, args, auth, caja, callback) {
		app.delete(uri, function (req, res, next) {
			return auth ? bearerAuth : next();
		}, function (req, res, next) {
			handleRequest(callback, args, caja, req, res, next);
		});
	};
	app.Delete = _delete;

	var _put = function (uri, args, auth, caja, callback) {
		app.put(uri, function (req, res, next) {
			return auth ? bearerAuth : next();
		}, function (req, res, next) {
			handleRequest(callback, args, caja, req, res, next);
		});
	};
	app.Put = _put;

};