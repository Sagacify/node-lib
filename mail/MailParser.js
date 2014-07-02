var MailParser = require('mailparser').MailParser;
var ResourceModel = model('Resource');

function SGMailParserStream () {

	var mailparser = new MailParser({
		debug: false
	});

	mailparser.on('end', function (email) {

		email.text = emailBodyCleanup(email.text);
		ResourceModel.sgCreateEmail(email);

	});

	return mailparser;

}

function regexpIndexOf (str, regex, startpos) {
	var pos = startpos || 0
	  , indexOf = str.substring(pos).search(regex);
	return (indexOf >= 0) ? (indexOf + pos) : indexOf;
}

function reverseString (str) {
	return str.split('').reverse().join('');
}

function emailBodyCleanup (email) {
	var regexpQuote = /(\r?\n+>+)/g
	  , indexQuote = regexpIndexOf(email, regexpQuote, 0);
	if(~indexQuote) {
		email = email.substring(indexQuote, -1);
		var regexpNewline = /(\r?\n+)/g
		  , reverseEmail = reverseString(email)
		  , indexAuthor = regexpIndexOf(reverseEmail, regexpNewline, 0);
		if(~indexAuthor) {
			email = email.substring(0, email.length - 1 - indexAuthor);
		}
	}
	return email
			.trim()
			.replace(/\r?\n/g, '<br>');
}

module.exports = SGMailParserStream;