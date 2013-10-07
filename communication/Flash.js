/**
* Flash.js adds transport capabilities to the server.
* MongoDB back-ups and logs flow through this middleware.
*/

// TODO : Add reverse proxy authentication as pub/sub feature and dynamic IP address remedy.

var tls = require('tls');
var fs = require('fs');

var mongoFrequency = 1000 * 60 * 60 * 24;
var logsFrequency = 1000 * 60 * 60 * 2;

exports.transport = function(app) {
	app.get('/bug_report', function(req, res, next) {
		
	});

	setInterval(backupMongo, mongoFrequency);
	setInterval(backupLogs, logsFrequency);
};

function tlsSend() {
	var options = {
		key: fs.readFileSync('server-key.pem'),
		cert: fs.readFileSync('server-cert.pem'),
		// This is necessary only if using the client certificate authentication.
		requestCert: true,
		// This is necessary only if the client uses the self-signed certificate.
		ca: [ fs.readFileSync('client-cert.pem') ]
	};

	var server = tls.createServer(options, function(cleartextStream) {
		console.log('server connected', cleartextStream.authorized ? 'authorized' : 'unauthorized');
		cleartextStream.write('welcome!\n');
		cleartextStream.setEncoding('utf8');
		cleartextStream.pipe(cleartextStream);
	});

	server.listen(8000, function() {
		console.log('server bound');
	});
}
