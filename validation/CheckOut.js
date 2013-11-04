var mpath = require('mpath');
var requestHandler = require('../request_handler/request_handler');

var authState = config.authDefault;
var sanitizeState = config.escapeDefault;

var SGError = require('../errorhandler/SagaError');

// var validatorInstance = require('./Validator.js');
// var check = validatorInstance.check;

// var sanitizerInstance = require('./Sanitizer.js');
// var sanitize = sanitizerInstance.sanitize;

var is = require('../strict_typing/validateType');

var methodName = 'lenInferiorTo';
var methodNameLen = methodName.length;

var apiRecorder = require('../routes_recorder/api_recorder');

var routeHandler = require('../request_handler/route_handler');

function applyToEle (value, conditions) {
	var condition;
	var arg;
	for(var i = 0, len = conditions.length; i < len; i++) {
		condition = conditions[i];
		if(condition.substr(0, methodNameLen) === methodName) {
			arg = condition.replace(methodName, '');
			condition = methodName;
		}
		if(!validatorInstance.check(value)[condition](arg)) {
			return false;
		}
	}
	return value;
}

function applyAllConditions (obj, conditions) {
	return is.Null(obj) || !is.Array(obj) ? applyToEle(obj, conditions) : obj.reduce(function (a, b) {
		return a && applyToEle(b, conditions);
	}, true);
}

function hasUndefined (obj) {
	if(is.Null(obj)) {
		return true;
	}
	else if(is.Array(obj)) {
		return obj.reduce(function (a, b) {
			return a && (is.NotNull(b));
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
		argument = mpath.get(key, req.mixin);
		isOptional = (conditions.length >= 1) && /optional/i.test(conditions[0]);
		isPresent = !hasUndefined(argument);
		if(!isPresent && !isOptional) {
			return res.SGsend(new SGError('Validation', 400, 'Validation failed'));
		}
		else {
			if(isOptional) {
				conditions.splice(0, 1);
			}
			value = !isPresent ? null : applyAllConditions(argument, conditions);
			if(value === false) {
				return res.SGsend(new SGError('Validation', 400, 'Validation failed'));
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
	var BearerAuth = require('../../app/auth-middlewares/authenticate_token.js');

	function expressMethodWrapper (methodName, uri, options, callback) {
		if(arguments.length == 3){
			callback = options;
			options = {};
		}

		if(typeof callback !== "function"){
			//callback = requestHandler.handle(callback);
			callback = new routeHandler(callback).handle();
		}

		apiRecorder.addRoute(methodName, uri, {});

		var auth = ('auth' in options)?options.auth:authState;
		var caja = ('sanitize' in options)?options.sanitize:sanitizeState;

		app[methodName](uri, function (req, res, next) {
			return auth ? BearerAuth(req, res, next) : next();
		}, function (req, res, next) {
			var filter = {};
			req.query.keys().forEach(function (queryKey){
				if(queryKey != "offset" && queryKey != "limit" && queryKey != "sort_by" && queryKey != "sort_how"){
					filter[queryKey] = JSON.parse(req.query[queryKey]);
				}
			});
			var sort = {};
			if(req.query.sort_by){
				sort[req.query.sort_by] = req.query.sort_how||'asc';
			}
			req.mixin = req.params.clone().merge(req.body).merge({
				paginate: {
					offset: req.query.offset,
					limit: req.query.limit
				},
				sort: sort,
				filter: filter
			});

			handleRequest(callback, options.validation || {}, caja, req, res, next);
		});
	}


	var _get = function (uri, options, callback) {
		var argsToArray = Array.apply(null, arguments);
		var newArguments = ['get'].concat(argsToArray);
		expressMethodWrapper.apply(this, newArguments);
	};
	app.SGget = _get;

	var _post = function (uri, options, callback) {
		var argsToArray = Array.apply(null, arguments);
		var newArguments = ['post'].concat(argsToArray);
		expressMethodWrapper.apply(this, newArguments);
	};
	app.SGpost = _post;

	var _delete = function (uri, options, callback) {
		var argsToArray = Array.apply(null, arguments);
		var newArguments = ['delete'].concat(argsToArray);
		expressMethodWrapper.apply(this, newArguments);
	};
	app.SGdelete = _delete;

	var _put = function (uri, options, callback) {
		var argsToArray = Array.apply(null, arguments);
		var newArguments = ['put'].concat(argsToArray);
		expressMethodWrapper.apply(this, newArguments);
	};
	app.SGput = _put;

};