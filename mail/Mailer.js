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
				if(e) {
					callback(e);
				}
				else {
					callback(null);
				}
			});
		}
	});
}


function generateMail (data, mailTemplate, callback){
	console.log("EMAIL DATA");
	console.log(data);
	generateHTML(mailTemplate, data, function (e, html, text){
		if(e) {
			callback(e);
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
	attachmentsFiles.forEach(function (anAttachment) {
		attachments.push({
			filePath: attachmentsFilesPath + '/' + anAttachment,
			cid: anAttachment
		});
	});
	return attachments;
}

function getDirname (mailTemplate) {
	return __dirname + '/../../views/emails/templates/' + mailTemplate;
}


function generateHTML (mailTemplate, data, callback) {
	var dirname = __dirname + '/../../views/emails/templates';
	emailTemplates(dirname, function (e, template) {
		if(e) {
			callback(e);
		}
		else {
			template(mailTemplate, data, function (e, html, text) {
				if(e) {
					callback(e);
				}
				else {
					callback(null, html, text);
				}
			});
		}
	});
}

function getSubject (mailTemplate) {
	var dirname = getDirname(mailTemplate);
	return fs.readFileSync(dirname + '/subject.txt', 'utf8');
}

exports.send_Mail = function (type, email, name, token, callback) {
	var types = ['validation', 'reset_password'];
	if(types.indexOf(type) !== -1) {
		var base_uri = '/auth';
		var uri = base_uri + '/' + type;
		var unique_uri = config.hostname + uri + '/' + token;
		sendMessage({
			to: email,
			link: unique_uri, 
			name: name
		}, 'validation_mail', callback);
	}
	else {
		callback('INVALID_EMAIL_TYPE');
	}
};

