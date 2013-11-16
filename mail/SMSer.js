var client = require('twilio')(config.sms.accountSid, config.sms.authToken);
 

//Send an SMS text message
//@callback(err, responseData)
function sendSMS(to, body, callback){
	client.sms.messages.create({
		to:to, // The phone numver we want to deliver the message to
		from: config.sms.from, // A number bought from Twilio that is used for outbound communication
		body: body // body of the SMS message
		}, callback);
}

//ERROR CODE :
//This phone number is invalid.	21211
//Twilio cannot route to this number.	21612
//Your account doesn't have the international permissions necessary to SMS this number.	21408
//This number is blacklisted for your account.	21610
//This number is incapable of receiving SMS messages.	21614

