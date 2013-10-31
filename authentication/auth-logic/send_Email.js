var Mailer = require('../../mail/Mailer');
var send_VerficationMail = Mailer.send_VerficationMail;
var send_PasswordResetMail = Mailer.send_PasswordResetMail;

module.exports = function (mixin, callback) {	
	if(mixin.typeof_email === 'verification_email') {
		Mailer.send_VerficationMail(mixin.email, mixin.token, function (e) {
			if(e) {
				callback('COULDNT_SEND_EMAIL');
			}
			else {
				callback(null, mixin);
			}
		});
	}
	else if(mixin.typeof_email === 'password_reset_email') {
		Mailer.send_PasswordResetMail(mixin.email, mixin.token, function (e) {
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