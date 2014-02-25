var Mailer = require('../../mail/Mailer');
var send_VerficationMail = Mailer.send_VerficationMail;
var send_PasswordResetMail = Mailer.send_PasswordResetMail;
var LanguageManager = require('../../languages/Language');

module.exports = function (mixin, callback) {
	console.log('\n> SEND EMAIL :');
	var typeof_email = false;
	if(mixin.action === 'Register') {
		typeof_email = 'validation';
	}
	else if(mixin.action === 'ForgotPassword') {
		typeof_email = 'reset_password';
	}
	console.log(typeof_email, mixin.email, name, LanguageManager.getPreferedLanguage(mixin.user.prefLang), mixin.token);
	if(typeof_email) {
		var name = mixin.user.firstname + ' ' + mixin.user.lastname;
		Mailer.send_Mail(
			typeof_email, 
			mixin.email, 
			name, 
			LanguageManager.getPreferedLanguage(mixin.user.prefLang), 
			mixin.token, 
		function (err, msg) {
			if (err) {
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