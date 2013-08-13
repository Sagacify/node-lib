var mail = require('../../../lib/mailler');

exports.send_VerficationMail = function(token, user) {
	var url = '/i4/auth/validate/validToken/';
	var validationLink = config.hostname + url + token;
	mail.sendMessage({ to: user, link: validationLink }, 'validation_mail', null);
};

exports.send_PasswordResetMail = function(token, user) {
	var url = '/i4/auth/new_password/';
	var validationLink = config.hostname + url + token;
	mail.sendMessage({ to: user, link: validationLink }, 'reset_password_mail', null);
};
