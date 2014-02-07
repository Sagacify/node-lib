var simplesmtp = require('simplesmtp')
  , MailParserStream = require('./MailParser')
  , fs = require('fs');

function emailQueueId () {
	return Math.abs(Math.random() * Math.random() * Date.now() | 0).toString() +
			Math.abs(Math.random() * Math.random() * Date.now() | 0).toString();
}

function EmailReceiver () {
	var instance = this;

	var smtp = simplesmtp.createServer({
		disableDNSValidation: true,
		SMTPBanner: 'My Server',
		debug: false
	});

	smtp.listen(25, function (e) {
		if(e) {
			console.log('Could not start server on port 25. Ports under 1000 require root privileges.');
			console.log(e);
		}
		else {
			console.log('SMTP server listening on port 25');
		}
	});

	smtp.on('validateSender', function (connection, email, callback) {

		console.log('Validating sender ...');
		callback(null, true);

	}).on('validateRecipient', function (connection, email, callback) {

		console.log('Validating recipient ...');
		callback(null, true);

	}).on('startData', function (connection) {

		console.log('Start data ...');
		connection.saveStream = MailParserStream();

	}).on('data', function (connection, chunk) {

		console.log('Receiving chunk ...');
		connection.saveStream.write(chunk);

	}).on('dataReady', function (connection, callback) {

		console.log('End of Email');
		connection.saveStream.end();
		callback(null, emailQueueId());

	});

	EmailReceiver = function () {
		return instance;
	};
}

module.exports = EmailReceiver;
