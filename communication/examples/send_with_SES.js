var Flash = require('../Flash');

var Flash = new Flash({
	email: {
		// sender: {
		// 	ses: {
		// 		AWSAccessKeyID: 'AKIAIMQVLS3FLM3WQDXA',
		// 		AWSSecretKey: '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'
		// 	}
		// },
		receiver: {

		},
		templatesPath: '../../views/emails/templates',
		attachmentsPath: 'attachments'
	}
});

// Flash().with('email', 'SES').send(
// 	//settings
// 	{
// 		from: 'noreply@i4-community.com',
// 		to: 'mickael@sagacify.com',
// 		lang: 'en',
// 		type: 'invitation'
// 	},
// 	// data
// 	{
// 		user: {
// 			name: 'Mickael van der Beek'
// 		},
// 		link: 'http://www.google.be'
// 	},
// 	//options
// 	{
// 		ensureSuccess: true
// 	},
// 	// callback
// 	function () {
// 		console.log('Email sent !');
// 		console.log(arguments);
// 	}
// );

Flash().with('email').receive(function () {
	console.log('Received email !');
	console.log(arguments);
});