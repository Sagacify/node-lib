var emailTemplates = require('email-templates');
var nodemailer = require('nodemailer');
var fs = require('fs');

//var fromEmail = config.AWS.sesFromEmail;

// Create an Amazon SES transport object
//var transport = nodemailer.createTransport('SES', {
// 	AWSAccessKeyID: config.AWS.accessKeyId,
// 	AWSSecretKey: config.AWS.secretAccessKey,
// 	ServiceUrl: 'https://email.eu-west-1.amazonaws.com' // optional
// });

setupInfo('SES Configured');

//var lang = 'en';

function sendMessage (to, data, template, prefLang, callback) {
	generateMail(to, data, template, prefLang, function (e, message) {
		if(e) {
			console.log("GenerateMail error");
			console.log(e);
			callback(e);
		}
		else {
			transport.sendMail(message, function (error, response) {
				console.log("Mail sent ?")
				console.log(error)
				if(error) {
					callback(error);
				}
				else {
					console.log("Mail successfully sent");
					callback(null, "Success");
				}
			});
		}
	});
}


function generateMail (to, data, mailTemplate, prefLang, callback){
	generateHTML(mailTemplate, data, prefLang, function (e, html, text){
		if(e) {
			console.log("generateHTML error");
			console.log(e);
			callback(e);
		}
		else {
			var attachments = getAttachments(mailTemplate, prefLang);
			var subject = getSubject(mailTemplate, prefLang);
			var message = {
				from: fromEmail,
				to: to,
				sender: config.AWS.sesSender + ' <' + fromEmail + '>',
				subject: subject,
				generateTextFromHTML: true,
				attachments:attachments
			};
			message.text = text || undefined;
			message.html = html || undefined;
			console.log('\n> E-Mail Message :');
			//console.log(message);
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
			filename: anAttachment,
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
			console.log("emailTemplates error");
			console.log(e);
			return callback(e);
		}

		template(mailTemplate, data, function (e, html, text) {
			if(e) {
				console.log("template error");
				console.log(e);
				return callback(e);
			}

			callback(null, html, text);
		});
	});
}

function getSubject (mailTemplate, prefLang) {
	var dirname = getDirname(mailTemplate, prefLang);
	return fs.readFileSync(dirname + '/subject.txt', 'utf8');
}

exports.send_Mail = function (type, email, name, link, title, prefLang, token, callback) {
	console.log('EMAIL TO -> ' + email);
	console.log(arguments);
	//var types = ['validation', 'reset_password'];
	if(prefLang && type/*types.indexOf(type) !== -1*/) {
		sendMessage(email, {
			to: email,
			link: link,
			name: name,
			title: title
		}, type, prefLang, callback);
	}
	else {
		callback('INVALID_EMAIL_TYPE');
	}
};

exports.sendMail = function (emailTo, type, prefLang, parameters, callback){
	
	/* Checking type is deprecated - this should be checked on the app code, not on the lib*/ 
	/*Checking type*/
	//var types = ['validation', 'reset_password', 'resource'];
	
	if(prefLang)/* && types.indexOf(type) !== -1)*/ {
		console.log("Email to")
		console.log(emailTo);
		console.log("Parameters")
		console.log(parameters);
		sendMessage(emailTo, parameters, type, prefLang, callback);
	}
	else {
		callback('INVALID_EMAIL_TYPE');
	}
};