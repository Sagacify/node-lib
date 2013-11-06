var Mailer = require('../../mail/Mailer');
var send_VerficationMail = Mailer.send_VerficationMail;
var send_PasswordResetMail = Mailer.send_PasswordResetMail;


module.exports = function (mixin, callback) {
	var typeof_email = false;
	if(mixin.action === 'Register') {
		typeof_email = 'validation';
	}
	else if(mixin.action === 'ForgotPassword') {
		typeof_email = 'reset_password';
	}
	if(typeof_email) {
		console.log('Email is -> ' + mixin.email);
		Mailer.send_Mail(typeof_email, mixin.email, mixin.token, function (e) {
			if(e) {
				callback('COULDNT_SEND_EMAIL');
			}
			else {
				callback(null, mixin);
			}
		});
	}
	else {
		callback('INVALID_EMAIL_TYPE');
	}
};