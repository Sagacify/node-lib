require('./request-model');

function ExpressRequestLogger (tokens, req, res) {

	// if(req.is('json') || req.is('application/json') || req.is('application/javascript')) {

		var request = {
			ip_addr			:	req.ips.length ? req.ips : req.ip,
			url				:	req.path,
			req_protocol	:	req.protocol,
			http_method		:	tokens.method(req, res),
			http_refferer	:	tokens.referrer(req, res),
			http_status		:	tokens.status(req, res),
			user			:	req.user && req.user._id || undefined,
			headers			:	req.headers,
			query			:	req.query,
			// user_agent		:	tokens['user-agent'](req, res),
			// req_length		:	tokens['req-length'](req, res),
			response_time	:	tokens['response-time'](req, res)
		};

		var cookies;
		if((cookies = Object.keys(req.cookies)).length) {
			request.cookies = cookies;
		}

		if(req.path.substr(0, '/auth'.length) === '/auth') {
			request.req_body = Object.keys(req.body || {}).length ? Object.keys(req.body) : undefined;
		}

		// WinstonLogger.requests(request);
		model('SLRequest')(request).saveRequest();

	// }

}

module.exports = ExpressRequestLogger;