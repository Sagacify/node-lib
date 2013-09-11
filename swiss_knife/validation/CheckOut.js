var Handle = require('../responses/HttpResponseHandlers.js');

var BearerAuth = require('../authentication/logic/Bearer_auth.js');
var bearerAuth = BearerAuth.process;

var Caja = require('./GoogleCaja.js');

var validatorInstance = require('./Validator.js');
var check = validatorInstance.check;

var sanitizerInstance = require('./Sanitizer.js');
var sanitize = sanitizerInstance.sanitize;

function applyAllConditions(value, conditions) {
	var construct = check(value);
	var i = conditions.length;
	var isValid = true;
	var condition;
	var res;
	while(i--) {
		condition = conditions[i];
		console.log(condition.toUpperCase());
		//res = construct[condition]();
		check(value)[condition]();
		check(value).isEmail();
		console.log(value);
		console.log('res : ');
		console.log(res);
		isValid = !res && isValid ? false : true;
		console.log('isValid -> ' + isValid);
	}
	return isValid ? value : isValid;
}

function handleQueryArgs (req, key) {
	return req.query[key] || undefined;
}

function handleBodyArgs (req, key) {
	return req.body[key] || undefined;
}

function handleRequest (callback, args, caja, req, res, next) {
	var keys = Object.keys(args);
	var additionalArgs = [];
	var conditions;
	var argument;
	var keySplit;
	var escaped;
	var value;
	var prop;
	var key;
	for(var i = 0, len = keys.length; i < len; i++) {
		key = keys[i];
		splitkey = key.split('.');
		if(splitkey.length !== 2) {
			console.log('Malformed argument : ' + key);
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
		conditions = args[key];
		//console.log('Val0 -> ' + argument);
		value = applyAllConditions(argument, conditions);
		//console.log('Val3 -> ' + value);
		if(value === false) {
			return Handle.validationFail(res);
		}
		else  {
			escaped = (caja === false) ? value : Caja.escape(value);
			//console.log('Val4 -> ' + escaped);
			additionalArgs.push(value);
		}
	}
	console.log(additionalArgs);
	var argsToArray = Array.apply(null, arguments);
	callback.apply(this, additionalArgs.concat(argsToArray));
}

function handleAuthentication (auth) {
	if(auth === false) {
		return true;
	}
	else if(auth.toLowerCase() === 'bearer') {
		return passport.authenticate('bearer', { session: false });
	}
}

module.exports = function (app) {

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