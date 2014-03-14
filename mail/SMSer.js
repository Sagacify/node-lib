var fs = require('fs');
var client = require('twilio')(config.sms.accountSid, config.sms.authToken);

var templatePath = __dirname + '/../../views/sms/templates';

exports.send_SMS = function (to, type, prefLang, parameters, callback) {
	fs.readFile(templatePath + '/' + prefLang + '/' + type + '.txt', {encoding:'utf8'}, function (e, template) {
		if(e) {
			console.log(new SGError(e));
		}
		else {
			for(var parameterName in parameters) {
				template = template.replace('{{ '  + parameterName + ' }}', parameters[parameterName]);
			}
			//client.sms.messages.create({
			client.messages.create({
				to:to, // The phone numver we want to deliver the message to
				from: config.sms.from, // A number bought from Twilio that is used for outbound communication
				body: template // body of the SMS message
			}, function (e, message) {
				console.log(e);
				console.log(message.sid);
			});
		}
	});
};

//sendSMS("+32496961218", "Hello World");

//ERROR CODE :
//This phone number is invalid.	21211
//Twilio cannot route to this number.	21612
//Your account doesn't have the international permissions necessary to SMS this number.	21408
//This number is blacklisted for your account.	21610
//This number is incapable of receiving SMS messages.	21614
