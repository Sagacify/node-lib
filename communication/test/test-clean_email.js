var fs = require('fs');
var dirname = __dirname + '/emails';
var directory = fs.readdirSync(dirname);

var EmailInterface = new (require('../EmailInterface'))();

var filename = '';
var email = '';

for(var i = 0, len = directory.length; i < len; i++) {
	filename = directory[i];
	email = fs.readFileSync(dirname + '/' + filename, 'utf8');

	console.log('------------------------- START (' + i + ') -------------------------');
	console.log(email);
	console.log('------------------------- RESULT (' + i + ') -------------------------');
	console.log(EmailInterface().getCleanEmailBody(email));
	console.log('------------------------- END (' + i + ') -------------------------');
}
