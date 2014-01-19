var request = require('request');
var supertest = require('supertest');
var http = supertest('http://localhost:8000');

var specialValues = {
	'Date': require('./specialDates'),
	'String': require('./specialStrings'),
	'Number': require('./specialNumbers'),
	'Boolean': require('./specialBooleans'),
	'Primitives': require('./specialPrimitives')
};

function extract_apis (method_routes, method, apis) {
	var urls = Object.keys(method_routes);
	var api;
	var url;
	for(var i = 0, len = urls.length; i < len; i++) {
		url = urls[i];
		api = method_routes[url];
		apis[url] = {
			schema: api.validation,
			method: method
		};
	}
}

function extract_routes (models) {
	if(models.routes) {
		var routes = models.routes;
		var methods = Object.keys(routes);
		var apis = {};
		var method_routes;
		var method;
		for(var i = 0, len = methods.length; i < len; i++) {
			method = methods[i];
			method_routes = routes[method];
			extract_apis(method_routes, method, apis);
		}
		pown_Server(apis);
	}
}

function pown_Server (apis) {
	var urls = Object.keys(apis);
	var async_config = [];
	for(var i = 0, len = urls.length; i < len; i++) {
		(function () {
			api.post(url)
			.set('user-agent', 'Chrome')
			.send(rule_obj)
			.expect(expected_code, done);
		})()
	}
}

var model_share_url = 'http://localhost:8000/api/app_models';
request({
	url: model_share_url,
	method: 'GET',
	json: true
}, function (e, req, models) {
	if(e) {
		console.log(e);
	}
	else {
		var body = req.body;
		var json = body.replace(/(<[^>]+>)/g, '');
		json = JSON.parse(json);
		extract_routes(json);
	}
});
	