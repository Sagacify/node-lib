var fs = require('fs')
  , async = require('async')
  , MailParser = require('mailparser').MailParser
  , EmailSender = require('./EmailSender')
  , EmailReceiver = require('./EmailReceiver')
  , EmailTemplates = require('email-templates');


/**
 * @class EmailInterface
 * @classdesc `EmailInterface` class that serves as an interface / middleman between the code base and the EmailSender.
 *
 * @param {object} [options]					- Options
 * @param {object} [options.attachmentsPath]	-  Path to the directory containing the attachments
 * @param {object} [options.sender]				-  {@link EmailSender} Options for the email sending service
 * @param {object} [options.receiver]			-  {@link EmailReceiver} Options for the email sending service
 *
 * @return {EmailInterface}
 */
function EmailInterface (options) {
	var instance = this;

	options = options || {};

	this.attachmentsPath = options.attachmentsPath || './';
	this.templatesPath = options.templatesPath;

	if(options.sender) {
		this.sender = new EmailSender(options.sender);
	}

	if(options.receiver) {
		this.receiver = new EmailReceiver(options.receiver);
	}

	this.transport = null;

	return (EmailInterface = function () {
		return instance;
	});
}

/**
 * Small chaining method that sets the transport type for the following send command.
 *
 * @function with
 * @memberof EmailInterface.prototype
 *
 * @param {string}	transport	-	Name of the transport method (e.g: 'SES', 'direct', 'sendmail', ...etc.)
 *
 * @return {EmailInterface}
 *
 * @api public
 */
EmailInterface.prototype.with = function (transport) {
	return (this.transport = transport, this);
};

/**
 * Chaining of some RegExps to clean up quotes and email authors.
 *
 * @function getCleanEmailBody
 * @memberof EmailInterface.prototype
 *
 * @param {string}	email	-	The fully buffered / streamed email content
 *
 * @return {string}
 *
 * @api private
 */
EmailInterface.prototype.getCleanEmailBody = function (email) {

	function regexpIndexOf (str, regex, startpos) {
		var pos = startpos || 0
		  , indexOf = str.substring(pos).search(regex);
		return (indexOf >= 0) ? (indexOf + pos) : indexOf;
	}

	function reverseString (str) {
		return str.split('').reverse().join('');
	}

	var regexpQuote = /\r?\n+>+/g
	  , indexQuote = regexpIndexOf(email, regexpQuote, 0);
	if(~indexQuote) {
		email = email.substring(indexQuote, -1);
		var regexpNewline = /\r?\n+/g
		  , reverseEmail = reverseString(email)
		  , indexAuthor = regexpIndexOf(reverseEmail, regexpNewline, 0);
		if(~indexAuthor) {
			email = email.substring(0, email.length - 1 - indexAuthor);
		}
	}
	return email.trim()
		.replace(/\r?\n/g, '<br>')
		.replace(/\b(?!(?:.\B)*(.)(?:\B.)*\1)[\t(<\/?br>)]+\b/g, '<br>');
};

/**
 * Closure function that return new instances of a mail parser stream to which receiveid emails are piped to.
 *
 * @function InstanciateMailParser
 * @memberof EmailInterface.prototype
 *
 * @param {function}	callback	- Callback
 *
 * @return {function}
 *
 * @api public
 */
EmailInterface.prototype.InstanciateMailParser = function (callback) {
	var me = this;
	return function () {
		var mailParser = new MailParser({
			debug: false
		});
		mailParser.on('end', function (email) {
			email.text = me.getCleanEmailBody(email.text);
			callback(null, email);
		});
		return mailParser;
	};
};

/**
 * Assembles an object containing all the needed informations to create a valid
 * envelope and (HTML) email body.
 *
 * @function assembleEmail
 * @memberof EmailInterface.prototype
 *
 * @param {object}			settings					- Data use to create the envelop and email body
 * @param {string}			settings.from				- Sender email
 * @param {(string|array)}	settings.to					- Destination email address(es)
 * @param {array}			[settings.cc]				- Recipients in the Cc field
 * @param {array}			[settings.bcc]				- Recipients in the Bcc field
 * @param {string}			[settings.replyTo]			- ReplyTo field
 * @param {string}			[settings.inReplyTo]		- Message Id to which the email replies to
 * @param {string}			[settings.references]		- Messages Id list
 * @param {array}			[settings.attachments]		- List of attachments files / buffers or strings
 * @param {string}			[settings.subject]			- Subject of the email
 * @param {string}			settings.text				- Plaintext body
 * @param {string}			[settings.html]				- HTML body
 * @param {object}			[settings.header]			- HTTP / SMTP headers
 * @param {object}			[settings.ref]				- Reference (ObjectId) to a resource
 *
 * @param {object}			[data]						- Data to feed to the templating engine
 *
 * @param {function}		callback					- Callback
 *
 * @return {undefined}
 *
 * @api private
 */
EmailInterface.prototype.assembleEmail = function (settings, data, callback) {
	var emailContents = settings || {}
	  , content = settings.html || settings.text || '';

	var dirname = __dirname
	  , lang = settings.lang || 'en'
	  , type = settings.type
	  , path = dirname + '/' + this.templatesPath + '/' + lang
	  , basePath = path + '/' + type
	  , attachmentsPath = basePath + '/' + this.attachmentsPath
	  , staticAttachments = fs.readdirSync(attachmentsPath) || [];

	var subject = settings.subject || fs.readFileSync(basePath + '/subject.txt', 'utf8');
	emailContents.subject = settings.ref ? subject + ' (ref:' + settings.ref + ')' : subject;

	var attachments = (settings.attachments || []).concat(staticAttachments)
	  , attachment
	  , filename;
	for(var i = 0, len = attachments.length; i < len; i++) {
		attachment = attachments[i];
		filename = attachment.filename || attachment.fileName || attachment;
		if(filename.startsWith('.')) {
			continue;
		}
		attachments[i] = {
			fileName: filename,
			filePath: attachment.filePath || attachmentsPath + '/' + filename,
			cid: /*this.attachmentsPath + '/' +*/ filename
		};
	}

	emailContents.attachments = attachments;

	// TODO : Optimize this function to be called only once at the construction of a new instance
	EmailTemplates(path, function (error, template) {
		if(error) {
			return callback(error);
		}

		template(type, data, function (error, html, text) {
			if(error) {
				return callback(error);
			}

			emailContents.html = html;
			emailContents.text = text;
			emailContents.generateTextFromHTML = !!html;
			callback(null, emailContents);
		});
	});

};

/**
 * Send an email with wathever transport was setup by EmailSender.
 *
 * @function send
 * @memberof EmailInterface.prototype
 *
 * @param {object}		settings	- {@link  EmailInterface#assembleEmail} Data use to create the envelop and email body
 * @param {object}		data		- Data to feed to the templating engine
 * @param {object}		options		- {@link  EmailSender#send} Options for the sending action
 * @param {function}	callback	- Callback
 *
 * @return {undefined}
 *
 * @api public
 */
EmailInterface.prototype.send = function (settings, data, options, callback) {
	var me = this
	  , transport = this.transport;
		this.assembleEmail(settings, data, function (error, emailContents) {
		if(error) {
			return callback(error);
		}
		me.sender.send(transport, emailContents, options, callback);
	});
};

/**
 * Receives emails on the local email server, parses and forwards them to a callback.
 *
 * @function receive
 * @memberof EmailInterface.prototype
 *
 * @param {function} callback	- Callback function called after the entire email has been streamed and parsed
 *
 * @return {undefined}
 *
 * @api public
 */
EmailInterface.prototype.receive = function (callback) {
	var mailParserInstanciator = this.InstanciateMailParser(callback);
	this.receiver.receive(mailParserInstanciator);
};

module.exports = EmailInterface;
