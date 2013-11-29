//var client = require('twilio')(config.sms.accountSid, config.sms.authToken);
//var client = require('twilio')("ACa2a197984dbe6e2132fcf0ea2a140f24", "684d13d663c6e335a149f4be54f250c1"); //Test
var client = require('twilio')("AC0f3edf2d17a09848c65003cd66bd9982", "8b2575130fe9b6fd8c948078ecb234ab");
//Send an SMS text message
//@callback(err, responseData)
function sendSMS(to, body, callback){
	client.sms.messages.create({
		to:to, // The phone numver we want to deliver the message to
		from: "+32470337816", // A number bought from Twilio that is used for outbound communication
		body: body // body of the SMS message
		}, function(err, res){
			console.log("ERR");
			console.log(err);
			console.log("RES");
			console.log(res);
		});
}

// function sendSMS(to, body, callback){
// 	client.sms.messages.create({
// 		to:to, // The phone numver we want to deliver the message to
// 		from: config.sms.from || "+32496961218", // A number bought from Twilio that is used for outbound communication
// 		body: body // body of the SMS message
// 		}, callback);
// }

sendSMS("+32496961218", "Hello World");

//ERROR CODE :
//This phone number is invalid.	21211
//Twilio cannot route to this number.	21612
//Your account doesn't have the international permissions necessary to SMS this number.	21408
//This number is blacklisted for your account.	21610
//This number is incapable of receiving SMS messages.	21614

