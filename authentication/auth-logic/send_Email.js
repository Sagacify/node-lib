var Mailer = require('../../mail/Mailer');
var send_VerficationMail = Mailer.send_VerficationMail;
var send_PasswordResetMail = Mailer.send_PasswordResetMail;
var LanguageManager = require('../../languages/Language');

var emailTypeMap = {
	'Register': 'validation',
	'ForgotPassword': 'reset_password'
};

module.exports = function (mixin, callback) {
	var typeof_email = false;
	typeof_email = emailTypeMap[mixin.action];

	if(mixin.template) {
		typeof_email = mixin.template;
	}

	if(typeof_email) {
		var token = mixin.token;
		var name = mixin.user.name || mixin.user.firstname + ' ' + mixin.user.lastname;
		var link = config.hostname + '/auth/' + (emailTypeMap[mixin.action] || mixin.template) + '/' + token;

		Mailer.send_Mail(
			typeof_email,
			mixin.email,
			name,
			link,
			mixin.user.title,
			LanguageManager.getPreferedLanguage(mixin.user.prefLang),
			token,
		function (e, msg) {
			if (e) {
				console.log('Email Error');
				console.log(e);
				console.log(msg);
			}
			else {
				console.log("No Error");
				console.log(msg);
			}
		});
		callback(null, mixin);
	}
	else {
		callback('INVALID_EMAIL_TYPE');
	}
};