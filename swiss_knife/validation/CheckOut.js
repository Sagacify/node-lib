var Handle = require('../response/HttpResponseHandlers.js');

var Caja = require('./GoogleCaja.js');
var authState = config.authDefault;
var sanitizeState = config.escapeDefault;

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
	var bearerAuth = BearerAuth.process;
	//app.use(BearerAuth.process);

	var _get = function (uri, args, options, callback) {
		var auth;
		var caja;
		if(arguments.length !== 4) {
			auth = authState;
			caja = sanitizeState;
		}
		else if(arguments.length === 4) {
			auth = !('auth'  in options) || (authState !== options.auth) ? options.auth : authState;
			caja = !('sanitize'  in options) || (sanitizeState !== options.sanitize) ? options.sanitize : sanitizeState;
		}
		app.get(uri, function (req, res, next) {
			return auth ? bearerAuth(req, res, next) : next();
		}, function (req, res, next) {
			handleRequest(callback, args, caja, req, res, next);
		});
	};
	app.SGget = _get;

	var _post = function (uri, args, options, callback) {
		var auth;
		var caja;
		if(arguments.length !== 4) {
			auth = authState;
			caja = sanitizeState;
		}
		else if(arguments.length === 4) {
			auth = !('auth'  in options) || (authState !== options.auth) ? options.auth : authState;
			caja = !('sanitize'  in options) || (sanitizeState !== options.sanitize) ? options.sanitize : sanitizeState;
		}
		app.post(uri, function (req, res, next) {
			return auth ? bearerAuth(req, res, next) : next();
		}, function (req, res, next) {
			handleRequest(callback, args, caja, req, res, next);
		});
	};
	app.SGpost = _post;

	var _delete = function (uri, args, options, callback) {
		var auth;
		var caja;
		if(arguments.length !== 4) {
			auth = authState;
			caja = sanitizeState;
		}
		else if(arguments.length === 4) {
			auth = !('auth'  in options) || (authState !== options.auth) ? authState : options.auth;
			caja = !('sanitize'  in options) || (sanitizeState !== options.sanitize) ? options.sanitize : sanitizeState;
		}
		app.delete(uri, function (req, res, next) {
			return auth ? bearerAuth(req, res, next) : next();
		}, function (req, res, next) {
			handleRequest(callback, args, caja, req, res, next);
		});
	};
	app.SGdelete = _delete;

	var _put = function (uri, args, options, callback) {
		var auth;
		var caja;
		if(arguments.length !== 4) {
			auth = authState;
			caja = sanitizeState;
		}
		else if(arguments.length === 4) {
			auth = !('auth'  in options) || (authState !== options.auth) ? authState : options.auth;
			caja = !('sanitize'  in options) || (sanitizeState !== options.sanitize) ? options.sanitize : sanitizeState;
		}
		app.put(uri, function (req, res, next) {
			console.log('__PUT__');
			return auth ? bearerAuth(req, res, next) : next();
		}, function (req, res, next) {
			handleRequest(callback, args, caja, req, res, next);
		});
	};
	app.SGput = _put;

};