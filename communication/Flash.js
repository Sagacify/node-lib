var sSES = require('./SES_mail-sender')
  , sSMS = require('./SMSer_sms-sender')
  , sEmail = require('./PostMan_mail-sender');

var sEmail = require('./MailBox_mail-receiver');

function Flash (options) {
	var instance = this;

	this.nextMethod = null;

	this.senderOptions = {
		ses: options.sSES || {},
		sms: options.sSMS || {},
		email: options.sEmail || {}
	};

	this.reiceiverOptions = {
		email: options.rEmail || {}
	};

	Flash = function () {
		return instance;
	};
}

Flash.prototype.senders = {
	ses: cSES.apply(cSES, this.getOptions('s', 'ses')),
	sms: cSMS.apply(cSMS, this.getOptions('s', 'sms')),
	email: cEmail.apply(cEmail, this.getOptions('s', 'email'))
};

Flash.prototype.receivers = {
	email: rEmail(this.getOptions('s', 'email'))
};


Flash.prototype.getOptions = function (type, classname) {
	return this[type === 'c' ? 'senderOptions' : 'reiceiverOptions'][classname];
};

Flash.prototype.with = function (method) {
	return (this.nextMethod = method) && this;
};

Flash.prototype.send = function () {
	if(!this.nextMethod) return;
	var method = this.senders[this.toLowerCase()];
	method.send.apply(this.nextMethod, arguments);
	this.nextMethod = null;
};

Flash.prototype.receive = function () {
	var method = this.receivers[transport.toLowerCase()];
	if(!this.nextMethod) return;
	method.send.apply(this.nextMethod, arguments);
	this.nextMethod = null;
};

var iFlash = new Flash();
module.exports = iFlash;