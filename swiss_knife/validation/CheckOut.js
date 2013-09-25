var mpath = require('mpath');

var authState = config.authDefault;
var sanitizeState = config.escapeDefault;

var validatorInstance = require('./Validator.js');
var check = validatorInstance.check;

var sanitizerInstance = require('./Sanitizer.js');
var sanitize = sanitizerInstance.sanitize;

function applyToEle (value, conditions) {
	var condition;
	for(var i = 0, len = conditions.length; i < len; i++) {
		condition = conditions[i];
		if(!validatorInstance.check(value)[condition]()) {
			return false;
		}
	}
	return value;
}

function applyAllConditions (obj, conditions) {
	return (obj == null) || !obj.isArray() ? applyToEle(obj, conditions) : obj.reduce(function (a, b) {
		return a && applyToEle(b, conditions);
	}, true);
}

function hasUndefined (obj) {
	if(obj == undefined) {
		return true;
	}
	else if(obj.isArray()) {
		return obj.reduce(function (a, b) {
			return a && (b != undefined);
		}, true);
	}
	else {
		return false;
	}
}

function handleRequest (callback, args, caja, req, res, next) {
	var keys = Object.keys(args);
	var additionalArgs = [];
	var isOptional;
	var conditions;
	var isPresent;
	var argument;
	var value;
	var key;
	for(var i = 0, len = keys.length; i < len; i++) {
		key = keys[i];
		conditions = args[key].concat(caja ? ['cajaData'] : []);
		argument = mpath.get(key, req);
		isOptional = (conditions.length >= 1) && /optional/i.test(conditions[0]);
		isPresent = !hasUndefined(argument);
		if(!isPresent && !isOptional) {
			return res.send(401);
		}
		else {
			if(isOptional) {
				conditions.splice(0, 1);
			}
			value = !isPresent ? null : applyAllConditions(argument, conditions);
			if(value === false) {
				return res.send(401);
			}
			else  {
				additionalArgs.push(value);
			}
		}
	}
	var argsToArray = Array.apply(null, arguments);
	argsToArray.splice(0, 3);
	var newArguments = additionalArgs.concat(argsToArray);
	callback.apply(this, newArguments);
}

module.exports = function (app) {

	var BearerAuth = require('../authentication/logic/authenticate_bearer.js');
	var bearerAuth = BearerAuth.process;

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