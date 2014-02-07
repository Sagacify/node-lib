var Flash = require('../Flash');

var Flash = new Flash({
	email: {
		sender: {
			direct: {}
		},
		templatesPath: '../../views/emails/templates',
		attachmentsPath: 'attachments',
		defaultTransport: 'direct'
	}
});

Flash().with('email', 'direct').send(
	//settings
	{
		from: 'mickael-167018@@vps22813.ovh.net',
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
