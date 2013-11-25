var Mailer = require('../../mail/Mailer');
var send_VerficationMail = Mailer.send_VerficationMail;
var send_PasswordResetMail = Mailer.send_PasswordResetMail;


var languageMapper = {
	"Français" : "fr",
	"English" : "en",
	"Nederlandse" : "nl"
}

module.exports = function (mixin, callback) {
	var typeof_email = false;
	if(mixin.action === 'Register') {
		typeof_email = 'validation';
	}
	else if(mixin.action === 'ForgotPassword') {
		typeof_email = 'reset_password';
	}
	if(typeof_email) {
		var name = mixin.user.firstname + ' ' + mixin.user.lastname;
		Mailer.send_Mail(typeof_email, mixin.email, name, languageMapper[mixin.prefLang], mixin.token, function (e) {
			//TODO resend mail if fail
			// if(e) {
			// 	callback('COULDNT_SEND_EMAIL');
			// }
			// else {
			// 	callback(null, mixin);
			// }
		});
		callback(null, mixin);
	}
	else {
		callback('INVALID_EMAIL_TYPE');
	}
};