var client = require('twilio')(config.sms.accountSid, config.sms.authToken);
 
var templatePath = '../../views/sms/templates';


//Send an SMS text message
//@callback(err, responseData)
exports.send_SMS = function (type, to, parameters, callback) {
	fs.readFile(templatePath + '/' + parameters.lang + '/' + type + '.txt', function (e, template) {
		if(e) {
			console.log(new SGError(e));
		}
		else {
			for(var parameterName in parameters) {
				template = template.replace('{{ '  + parameterName + ' }}', parameters[parameterName]);
			}
			client.sms.messages.create({
				to:to, // The phone numver we want to deliver the message to
				from: config.sms.from, // A number bought from Twilio that is used for outbound communication
				body: template // body of the SMS message
			}, callback);
		}
	});
};

//ERROR CODE :
//This phone number is invalid.	21211
//Twilio cannot route to this number.	21612
//Your account doesn't have the international permissions necessary to SMS this number.	21408
//This number is blacklisted for your account.	21610
//This number is incapable of receiving SMS messages.	21614