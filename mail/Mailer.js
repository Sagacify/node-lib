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

function sendMessage (data, template, callback) {
	generateMail(data, template, function (e, message) {
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
					callback(null);
				}
			});
		}
	});
}


function generateMail (data, mailTemplate, callback){
	generateHTML(mailTemplate, data, function (e, html, text){
		if(e) {
			callback(err);
		}
		else {
			var attachments = getAttachments(mailTemplate);
			var subject = getSubject(mailTemplate);
			var message = {
				from: fromEmail,
				to: data.to,
				subject: subject,
				generateTextFromHTML: true
				//attachments:attachments
			};
			message.text = text || undefined;
			//message.html = html || undefined;
			callback(null, message);
		}
	});
}

function getAttachments (mailTemplate) {
	var attachments = [];
	var dirname = getDirname(mailTemplate);
	var attachmentsFilesPath = dirname + '/attachments';
	var attachmentsFiles = fs.readdirSync(attachmentsFilesPath);
	attachmentsFiles.forEach(function (attachement) {
		attachments.push({
			filePath: attachmentsFilesPath + '/' + attachement,
			cid: anAttachment
		});
	});
	return attachments;
}

function getDirname (mailTemplate) {
	return './views/emails/templates/' + mailTemplate;
}

function generateHTML (mailTemplate, data, callback) {
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
}

function getSubject (mailTemplate) {
	var dirname = getDirname(mailTemplate);
	return fs.readFileSync(dirname + '/subject.txt', 'utf8');
}

exports.send_VerficationMail = function (email, token, callback) {
	var url = '/auth/validate/validToken/';
	var validationLink = config.hostname + url + token;
	sendMessage({
		to: email,
		link: validationLink
	}, 'validation_mail', callback);
};

exports.send_PasswordResetMail = function (email, token, callback) {
	var url = '/auth/auth/new_password/';
	var validationLink = config.hostname + url + token;
	sendMessage({
		to: email,
		link: validationLink
	}, 'reset_password_mail', callback);
};
