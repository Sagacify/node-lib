var EmailInterface = require('./EmailInterface');

/**
 * @class Flash
 * @classdesc `Flash` class for communicating with different protocols like SMS and emails.
 *
 * @param {object}						[options]			- Options
 * @param {object}						[options.email]		- {@link EmailInterface} Options for the email protocol
 *
 * @return {Flash}
 */
function Flash (options) {
	var instance = this;

	this.protocols = {};

	if(options.email) {
		this.protocols.email = new EmailInterface(options.email);
	}

	if(options.sms) {
		// new SMS Interface
	}

	return (Flash = function () {
		return instance;
	});
}

/**
 * Tells `Flash` what communication protocol and transport method to use.
 *
 * @function with
 * @memberof Flash.prototype
 *
 * @param {string} protocol			- Protocol to use (SMS or email at the moment)
 * @param {string} [transport]		- Transport method (SES, direct, sendmail ...etc.)
 *
 * @return {(undefined|EmailInterface)}
 *
 * @api private
 */
Flash.prototype.with = function (protocol, transport) {
	if(protocol in this.protocols) {
		return this.protocols[protocol]().with(transport);
	}
};

module.exports = Flash;
