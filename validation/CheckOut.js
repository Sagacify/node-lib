var authState = config.authDefault;
var sanitizeState = config.escapeDefault;

var SGError = require('../errorhandler/SagaError');

var SGMixinValidation = require('./SGMixinValidation');

// var validatorInstance = require('./Validator.js');
// var check = validatorInstance.check;

// var sanitizerInstance = require('./Sanitizer.js');
// var sanitize = sanitizerInstance.sanitize;

var is = require('../strict_typing/validateType');

var methodName = 'lenInferiorTo';
var methodNameLen = methodName.length;

var apiRecorder = require('../routes_recorder/api_recorder');

var routeHandler = require('../route_handler/route_handler');

module.exports = function (app) {
	var BearerAuth = require('../../app/auth-middlewares/authenticate_token.js');

	function expressMethodWrapper (methodName, uri, options, callback) {
		apiRecorder.addRoute(methodName, uri, options);

		var auth = ('auth' in options) ? options.auth : authState;
		var caja = ('sanitize' in options) ? options.sanitize : sanitizeState;

		app[methodName](uri, function (req, res, next) {
			return (auth === true) || (auth === 'optional') ? BearerAuth(auth, req, res, next) : next();
		}, function (req, res, next) {
			if(req.query._scope){
				req.clientScope = req.query._scope;
				delete req.query._scope;
			}

			var specialValidation = options.validation || {};
			var specialQueryFields = ['offset', 'sort_by', 'sort_how', 'limit'];
			var filter = {};
			req.query.keys().forEach(function (queryKey) {
				if(specialQueryFields.indexOf(queryKey) === -1) {
					filter[queryKey] = req.query[queryKey];
					// filter[queryKey] = JSON.parse(req.query[queryKey]);
				}
			});

			var sort = {};
			if('sort_by' in req.query) {
				sort[req.query.sort_by] = req.query.sort_how || 'asc';
			}

			var mixin_options = {};
			if(('offset' in req.query) && ('limit' in req.query)) {
				mixin_options.paginate = {
					offset: req.query.offset,
					limit: req.query.limit
				};
				specialValidation['paginate.offset'] = ['isOptional', 'String', 'notNull', 'notEmpty'];
				specialValidation['paginate.limit'] = ['isOptional', 'String', 'notNull', 'notEmpty'];
			}
			else{
				mixin_options.paginate = {};
			}

			if(Object.keys(sort).length) {
				mixin_options.sort = sort;
				specialValidation['sort'] = ['isOptional', 'isObject'];
			}
			if(Object.keys(filter).length) {
				mixin_options.filter = filter;
				specialValidation['filter'] = ['isOptional', 'isObject'];
			}

			options.validation = specialValidation;

			if((typeof callback !== "function") || (callback.name === 'autoGenerate')){
				callback = new routeHandler(callback).handle();
			}

			//The cloneToObject() method is needed because FUCK VISION-MEDIA !
			// --> https://github.com/visionmedia/express/issues/1742
			req.mixin = req.params.cloneToObject().merge(req.body).merge(mixin_options);
			SGMixinValidation(callback, options.validation || {}, caja, req, res, next);
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