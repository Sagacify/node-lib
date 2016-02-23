var Flash = require('../Flash');

var Flash = new Flash({
	email: {
		sender: {
			ses: {
				AWSAccessKeyID: 'AKIAJQIAKXARY5WMB3NA',
				AWSSecretKey: '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'
			}
		},
		templatesPath: '../../views/emails/templates',
		attachmentsPath: 'attachments'
	}
});

Flash().with('email', 'SES').send(
	//settings
	{
		from: 'noreply@i4-community.com',
		to: 'mickael@sagacify.com',
		lang: 'en',
		type: 'invitation'
	},
	// data
	{
		user: {
			name: 'Mickael van der Beek'
		},
		link: 'http://www.google.be'
	},
	//options
	{
		ensureSuccess: true
	},
	// callback
	function () {
		console.log('Email sent !');
		console.log(arguments);
	}
);
