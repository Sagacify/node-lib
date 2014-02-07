var fs = require('fs')
  , async = require('async')
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
 * @param {string}	transport	- Name of the transport method (e.g: 'SES', 'direct', 'sendmail', ...etc.)
 *
 * @return {EmailInterface}
 *
 * @api public
 */
EmailInterface.prototype.with = function (transport) {
	return (this.transport = transport) && this;
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
 * @param {object}			[settings.attachments]		- Data use to create the envelop and email body
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
	  , attachmentsPath = basePath + '/' + this.attachmentsPath;

	emailContents.subject = settings.subject || fs.readFileSync(basePath + '/subject.txt', 'utf8');

	var attachments = settings.attachments || fs.readdirSync(attachmentsPath)
	  , attachment;
	for(var i = 0, len = attachments.length; i < len; i++) {
		attachment = attachments[i];
		attachments[i] = {
			fileName: attachment.filename,
			filePath: attachment.filePath || attachmentsPath + '/' + attachment.filename,
			cid: attachment.filePath
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
 * @param {object}		options		- {@link  EmailSender#end} Options for the sending action
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
 * @return {undefined}
 *
 * @api public
 */
EmailInterface.prototype.receive = function (options) {
	var me = this
	  , transportMethod = this.transportMethod;
	this.assembleEmail(data, function (error, parameters) {
		if(error) {
			return callback(error);
		}
		this.controller.send(transportMethod, parameters, options, callback);
	});
};

module.exports = EmailInterface;
