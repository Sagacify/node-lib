var Flash = require('../Flash');

var Flash = new Flash({
	email: {
		receiver: {

		}
	}
});

Flash().with('email').receive(function () {
	console.log('Received email !');
	console.log(arguments);
});