var emailTemplates = require('email-templates');
var nodemailer = require('nodemailer');
var fs = require('fs');

var fromEmail = 'noreply@i4-community.com';

// Create an Amazon SES transport object
var transport = nodemailer.createTransport('SES', {
	AWSAccessKeyID: config.AWS.accessKeyId,
	AWSSecretKey: config.AWS.secretAccessKey
	//ServiceUrl: 'https://email.us-east-1.amazonaws.com' // optional
});

setupInfo('SES Configured');

exports.sendMessage = function (data, template, callback) {
	exports.generateMail(data, template, function (e, message) {
		if(e) {
			callback(e);
		}
		else {
			transport.sendMail(message, function (e) {
				if(e){
					console.log('Error occured');
					console.log(e.message);
					callback(e);
				} else {
					console.log('Message sent successfully!');
					callback();
				}
			});
		}
	});
};


exports.generateMail = function (data, mailTemplate, callback){
	exports.generateHTML(mailTemplate, data, function (e, html, text){
		if(e) {
			callback(err);
		}
		else {
			var attachments = exports.getAttachments(mailTemplate);
			var subject = exports.getSubject(mailTemplate);
			var message = {
				from: fromEmail,
				to: data.to.username,
				subject: subject,
				generateTextFromHTML: true
				//attachments:attachments
			};
			message.text = text || undefined;
			//message.html = html || undefined;
			callback(null, message);
		}
	});
};

exports.getAttachments = function (mailTemplate) {
	var attachments = [];
	var dirname = exports.getDirname(mailTemplate);
	var attachmentsFilesPath = dirname + '/attachments';
	var attachmentsFiles = fs.readdirSync(attachmentsFilesPath);
	attachmentsFiles.forEach(function (attachement) {
		attachments.push({
			filePath: attachmentsFilesPath + '/' + attachement,
			cid: anAttachment
		});
	});
	return attachments;
};

exports.getDirname = function (mailTemplate) {
	return './views/emails/templates/' + mailTemplate;
};

exports.generateHTML = function (mailTemplate, data, callback) {
	var dirname = './views/emails/templates';
	emailTemplates(dirname, function (e, template) {
		if(e) {
			callback(e);
		}
		else {
			template(mailTemplate, data, function (e, html, text) {
				if(e) {
					callback(null, html, text);
				}
				else {
					callback(e);
				}
			});
		}
	});
};

exports.getSubject = function (mailTemplate) {
	var dirname = exports.getDirname(mailTemplate);
	return fs.readFileSync(dirname + '/subject.txt', 'utf8');
};

exports.send_VerficationMail = function (token, user) {
	var url = '/auth/validate/validToken/';
	var validationLink = config.hostname + url + token;
	exports.sendMessage({
		to: user,
		link: validationLink
	}, 'validation_mail', null);
};

exports.send_PasswordResetMail = function (token, user) {
	var url = '/auth/auth/new_password/';
	var validationLink = config.hostname + url + token;
	exports.sendMessage({
		to: user,
		link: validationLink
	}, 'reset_password_mail', null);
};
