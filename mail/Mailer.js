var emailTemplates = require('email-templates');
var nodemailer = require('nodemailer');
var fs = require('fs');

var fromEmail = config.AWS.sesFromEmail;

// Create an Amazon SES transport object
var transport = nodemailer.createTransport('SES', {
	AWSAccessKeyID: config.AWS.accessKeyId,
	AWSSecretKey: config.AWS.secretAccessKey
	//ServiceUrl: 'https://email.us-east-1.amazonaws.com' // optional
});

setupInfo('SES Configured');

//var lang = 'en';

function sendMessage (to, data, template, prefLang, callback) {
	generateMail(to, data, template, prefLang, function (e, message) {
		if(e) {
			console.log(e);
			callback(e);
		}
		else {
			transport.sendMail(message, function (e) {
				if(e) {
					console.log(e);
					callback(e);
				}
				else {
					callback(null);
				}
			});
		}
	});
}


function generateMail (to, data, mailTemplate, prefLang, callback){
	generateHTML(mailTemplate, data, prefLang, function (e, html, text){
		if(e) {
			console.log(e);
			callback(e);
		}
		else {
			var attachments = getAttachments(mailTemplate, prefLang);
			var subject = getSubject(mailTemplate, prefLang);
			var message = {
				from: fromEmail,
				to: to,
				subject: subject,
				generateTextFromHTML: true,
				attachments:attachments
			};
			message.text = text || undefined;
			message.html = html || undefined;
			callback(null, message);
		}
	});
}

function getAttachments (mailTemplate, prefLang) {
	var attachments = [];
	var dirname = getDirname(mailTemplate, prefLang);
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

function getDirname (mailTemplate, prefLang) {
	return __dirname + '/../../views/emails/templates/' + prefLang +'/' + mailTemplate;
}


function generateHTML (mailTemplate, data, prefLang, callback) {
	var dirname = __dirname + '/../../views/emails/templates/' + prefLang;

	emailTemplates(dirname, function (e, template) {
		if(e) {
			console.log(e);
			callback(e);
		}
		else {
			template(mailTemplate, data, function (e, html, text) {
				if(e) {
					console.log(e);
					callback(e);
				}
				else {
					callback(null, html, text);
				}
			});
		}
	});
}

function getSubject (mailTemplate, prefLang) {
	var dirname = getDirname(mailTemplate, prefLang);
	return fs.readFileSync(dirname + '/subject.txt', 'utf8');
}

exports.send_Mail = function (type, email, name, prefLang, token, callback) {
	var types = ['validation', 'reset_password', 'cancellation_appointment_by_user', 'cancellation_appointment_by_pro'];

	if(prefLang && types.indexOf(type) !== -1) {
		var base_uri = '/auth';
		var uri = base_uri + '/' + type;
		var unique_uri = config.hostname + uri + '/' + token;
		sendMessage(email, {
			to: email,
			link: unique_uri,
			name: name
		}, type, prefLang, callback);
	}
	else {
		callback('INVALID_EMAIL_TYPE');
	}
};

exports.sendMail = function (emailTo, type, prefLang, parameters, callback){
	
	/*Checking type*/
	var types = ['validation', 'reset_password', 'cancellation_appointment_by_user', 'cancellation_appointment_by_pro', 'appointment_reminder', 'appointment_booking_confirmation'];
	
	if(prefLang && types.indexOf(type) !== -1) {
		console.log(emailTo);
		console.log(parameters);
		sendMessage(emailTo, parameters, type, prefLang, callback);
	}
	else {
		callback('INVALID_EMAIL_TYPE');
	}
};