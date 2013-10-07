module.exports = function(express) {

	express.logger.token('ip-addr', function(req) {
		return ('ips' in req) && (req.ips) ? req.ips : ('ip' in req) && (req.ip) ? req.ip : '-';
	});

	express.logger.token('ip-version', function(req) {
		if(('socket' in req) && ('_peername' in req.socket) && ('family' in req.socket._peername)) {
			return req.socket._peername.family || '-';
		}
		else if(('connection' in req) && ('_peername' in req.connection) && ('family' in req.connection._peername)) {
			return req.connection._peername.family || '-';
		}
		else {
			return '-';
		}
	});

	express.logger.token('tcp-port', function(req) {
		if(('socket' in req) && ('_peername' in req.socket) && ('port' in req.socket._peername)) {
			return req.socket._peername.port || '-';
		}
		else if(('connection' in req) && ('_peername' in req.connection) && ('port' in req.connection._peername)) {
			return req.connection._peername.port || '-';
		}
		else {
			return '-';
		}
	});

	express.logger.token('req-protocol', function(req) {
		return req.protocol || '-';
	});

	express.logger.token('user', function(req, res) {
		return ('user' in req) ? req.user._id : '-';
	});

	express.logger.token('req-body', function(req) {
		return Object.keys(req.body).length && !/auth/i.test(req.url) ? JSON.stringify(req.body) : '-';
	});

	express.logger.token('req-length', function(req) {
		return ('socket' in req) && ('bytesRead' in req.socket) && req.socket.bytesRead && !/auth/i.test(req.url) ? req.socket.bytesRead : '-';
	});

};
