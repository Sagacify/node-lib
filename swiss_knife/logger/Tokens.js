module.exports = function(express) {

	express.logger.token('ip-addr', function(req) {
		return req.socket && (req.socket.remoteAddress || (req.socket.socket && req.socket.socket.remoteAddress));
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