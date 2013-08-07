var nodemailer = require('nodemailer');
var fs         = require("fs");
var emailTemplates = require('email-templates');
var fromEmail = 'noreply@i4-community.com';


// Create an Amazon SES transport object
var transport = nodemailer.createTransport("SES", {
        AWSAccessKeyID: config.AWS.accessKeyId,
        AWSSecretKey: config.AWS.secretAccessKey//,
        //ServiceUrl: "https://email.us-east-1.amazonaws.com" // optional
    });

console.log('SES Configured');


/*
	Send single email for user defined in data
	data = [user:user]
*/

exports.sendMessage = function(data, template, callback){

	var preCallback = function(err){
		if (callback) {
			callback(err);	
		};
	};

	console.log("Receive:");
	console.log(data);

	var message	 = this.generateMail(data, template, function(err, message){
		if (!err) {
			transport.sendMail(message, function(error){
			    if(error){
			        console.log('Error occured');
			        console.log(error.message);
			        preCallback(error, error.message);
			    } else {
					console.log('Message sent successfully!');
		    		preCallback(null);
			    }
			});
		} else {
			preCallback(err);
		}
	});
}


exports.generateMail = function(data, mailTemplate, callback){
	var me = this;
	var html = this.generateHTML(mailTemplate, data, function(err, html, text){
		if (!err) {
			var attachments = me.getAttachments(mailTemplate);
			var subject = me.getSubject(mailTemplate);
			// Message object

			var message = {
			    from: fromEmail,
			    to: data.to.username,
			    subject: subject, 
			    generateTextFromHTML: true/*,
			    attachments:attachments*/
			};

			if (text) {
				message.text = text;
			};

			/*if (html) {
				message.html = html;
			};*/

			callback(null, message);
		} else {
			callback(err);
		}
	});
}

exports.getAttachments = function(mailTemplate){
 	
 	var dirname = this.getDirname(mailTemplate);

	attachments = [];
	var attachmentsFilesPath = dirname+ '/attachments';
	var attachmentsFiles = fs.readdirSync(attachmentsFilesPath);
	attachmentsFiles.forEach(function(anAttachment){
		attachments.push({filePath: attachmentsFilesPath+"/"+anAttachment, cid: anAttachment});
	});
	return attachments;
}

exports.getDirname = function(mailTemplate){
	return this.geRootDir()+"/"+mailTemplate;
}

exports.geRootDir = function(){
	return "./views/emails/templates";
}

exports.generateHTML = function(mailTemplate, data, callback){

	var dirname = this.geRootDir();
	emailTemplates(dirname, function(err, template){
		if (!err && template) {
			template(mailTemplate, data, function(err, html, text){
				if (!err && html) {
					callback(null, html, text);
				} else {
					callback(err);
				}
			});
		} else {
			callback(err);
		}
	});
}


exports.getSubject = function(mailTemplate){
	var dirname = this.getDirname(mailTemplate);
	return fs.readFileSync(dirname+"/subject.txt", encoding="utf8");
}
