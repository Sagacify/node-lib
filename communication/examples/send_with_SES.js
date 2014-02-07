var EmailInterface = require('./EmailInterface');

var Email = new EmailInterface({
	sender: {
		ses: {
			AWSAccessKeyID: 'AKIAIMQVLS3FLM3WQDXA',
			AWSSecretKey: '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'
		}
	},
	templatesPath: '../../views/emails/templates',
	attachmentsPath: 'attachments/'
});

Email().with('SES').send(
	//settings
	{
		from: 'noreply@i4-community.com',
		to: 'mickael@sagacify.com',
		lang: 'en',
		type: 'invitation'
		//attachments:attachments
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