/**
* DrunkUser.js is a fuzzing based testing tool.
* The fuzzer loops through REST API urls and sends seni-random strings.
* At the end a report is produced based on server crash errors and statuses.
*/

var fs = require('fs');
var request = require('request');
var yamlConfig = require('yaml-config');

var _NODE_ENV = process.env.NODE_ENV || 'development';
var config = yamlConfig.readConfig('../../../config/config.yaml', _NODE_ENV);

function drunkTalk() {
	return new Buffer(0xFFFD).toString();
}

(function() {
	request.get({ url: config.hostname + '/me/identity'}, function(req, res, data) {
		var body = JSON.parse(data);
		if('me' in body) {
			var identity = body.me;
			DrunkUser(config.hostname, identity, 0);
		}
	}).on('error', function(error) {
		console.log(error);
	});
})();

function DrunkUser(hostname, pathList, i) {
	if((i + 1) === identity.length) {
		return console.log('DrunkUser\'s fuzzing tests are done!');
	}
	request.post({ url: hostname + pathList[0], body: drunkTalk() }, function(req, res, data) {
		var body = JSON.parse(data);
		DrunkUser(hostname, pathList, i + 1);
	}).on('error', function(error) {
		console.log(error);
	});
}