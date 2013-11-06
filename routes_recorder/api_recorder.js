var routes = {get:{}, post:{}, put:{}, delete:{}};

exports.routes = routes;

exports.addRoute = function(method, uri, options){
	if(uri && uri.startsWith('/api') && uri != '/api/app_models')
		routes[method][uri] = options;
};