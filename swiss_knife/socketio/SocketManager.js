io = require('socket.io').listen(app, {log:config.socket.debugMode});

io.configure(function () {
	io.enable('browser client minification');
	io.enable('browser client etag');
	io.enable('browser client gzip');
	io.enable('match origin protocol');
	io.set('log level', config.socket.debugMode ? 1 : 0);
	io.set('transports', [
		'websocket',
		'flashsocket',
		'htmlfile',
		'xhr-polling',
		'jsonp-polling'
	]);
	io.set('authorization', function (handshakeData, callback) {
		var headers = handshakeData.headers;
		console.log(headers);
		var isSecure = false;
		if(('https' in config) && (config.https === true) && (handshakeData.secure || (headers['X-Forwarded-Proto'] === 'https'))) {
			isSecure = true;
		}
		else if(('https' in config) && (config.https === false)) {
			isSecure = true;
		}
		var isCrossDomain = handshakeData.xdomain;
		return callback(null, isSecure && !isCrossDomain);
	});
});

io.sockets.on('connection', function (socket) {}