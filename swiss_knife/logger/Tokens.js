module.exports = function(express) {

	express.logger.token('ip-addr', function(req) {
		var ipAddress = req.get('x-forwarded-for');
		if((ipAddress != null) && ('socket' in req) && ('remoteAddress' in req.socket)) {
			ipAddress = req.socket.remoteAddress;
		}
		else if((ipAddress != null) && ('socket' in req) && ('socket' in req.socket) && ('remoteAddress' in req.socket.socket)) {
			ipAddress = req.socket.socket.remoteAddress;
		}
		return ipAddress;
	});

	express.logger.token('ip-version', function(req) {
		return (req.socket._peername.family) ? req.socket._peername.family : req.connection._peername.family || ' - ';
	});

	express.logger.token('tcp-port', function(req) {
		return (req.socket._peername.port) ? req.socket._peername.port : req.connection._peername.port || ' - ';
	});

	express.logger.token('req-protocol', function(req) {
		return req.protocol;
	});

	express.logger.token('user', function(req, res) {
		return ('user' in req) ? req.user._id : '-';
	});

	express.logger.token('req-body', function(req) {
		return Object.keys(req.body).length ? JSON.stringify(req.body) : '-';
	});

	express.logger.token('req-length', function(req) {
		return req.socket.bytesRead;
	});

};