var SGStrictTyping = require('../strict_typing/SGStrictTyping');

var routes = {get:{}, post:{}, put:{}, delete:{}};

exports.routes = routes;

exports.addRoute = function(method, uri, options){
	if(uri && uri.startsWith('/api') && uri != '/api/app_models'){
		console.log(options.validation)
		options.validation = SGStrictTyping.develop_ValidationConfig(options.validation);
		console.log(method)
		console.log(uri)
		console.log(options.validation)
		routes[method][uri] = options;
	}
};