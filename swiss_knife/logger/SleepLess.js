/**
* SleepLess.js adds request logging capabilities.
* To specify which informations will be save edit the models and Tokens.js files. 
*/

exports.logger = function(app, express) {

	require('./request');
	require('./Tokens')(express);

	var MongoLogger = {
		write: function(request) {
			var parameters = request.split(/<<|>>/g)[1].split('|');
			var json = {};
			var parameter;
			var parameterName;
			var parameterValue;
			for(var i = 0; i < parameters.length; i++) {
				parameter = parameters[i].split(/\*/);
				parameterName = parameter[0];
				parameterValue = parameter[1];
				if(parameterValue === '-') {
					json[parameterName] = null;
				}
				else if((parameterName.indexOf('{') !== -1) && (parameterName.indexOf('}') !== -1)) {
					json[parameterName] = JSON.parse(parameterValue);
				}
				else {
					json[parameterName] = parameterValue;
				}
			}
			var paramsURL = json.url.split('/');
			var file = paramsURL[paramsURL.length - 1];
			var blacklist = ['.js', '.html', '.jpg', '.jpeg', '.png', '.json'];
			var exlude = false;
			for(var k = 0; k < blacklist.length; i++) {
				if(file.indexOf(blacklist[k]) !== -1) {
					exlude = true;
					break;
				}
			}
			if(!exlude) {
				var request = model('SLRequest')(json).saveRequest();
			}
		}
	};

	app.use(express.logger({
		stream 				: 	MongoLogger,
		format 				:
		'<<' +
			'ip_addr*:ip-addr' +
			'|' +
			'ip_version*:ip-version' +
			'|' +
			'tcp_port*:tcp-port' +
			'|' +
			'url*:url' +
			'|' +
			'req_protocol*:req-protocol' +
			'|' +
			'http_method*:method' +
			'|' +
			'http_referrer*:referrer' +
			'|' +
			'http_status*:status' +
			'|' +
			'user*:user' +
			'|' +
			'user_agent*:user-agent' +
			'|' +
			'response_time*:response-time' +
			'|' +
			'req_body*:req-body' +
			'|' +
			'req_length*:req-length' +
		'>>'
	}));
};