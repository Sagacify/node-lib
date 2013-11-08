var SGStrictTyping = require('../strict_typing/SGStrictTyping');

var routes = {get:{}, post:{}, put:{}, delete:{}};

exports.routes = routes;

exports.addRoute = function(method, uri, options){
	if(uri && uri.startsWith('/api') && uri != '/api/app_models'){
		options.validation = SGStrictTyping.develop_ValidationConfig(options.validation);
		routes[method][uri] = options;
	}
};