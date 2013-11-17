
//Testing with test api key

var stripe = require("stripe")(config.stripe.authKey);
stripe.setApiVersion('2013-10-29');

// card = {
//     number : 5555555555554444,
//     exp_month : 11,
//     exp_year : 16,
//     cvc : 473
// }


// //This will gather information from a Strip form (containing the credit card number) and generate a token from it
// function charge(card, callback){

//     var charge = stripe.charges.create({
//         amount: 1000, // amount in cents, again
//         currency: "eur",
//         card: card,
//         description: "kfrancoi@gmail.com"
//         });
// }

// charge(card, function(err, charge) {
//             console.log(charge);
//             if (err && err.type === 'StripeCardError') {
//             // The card has been declined
//             }
//             else {
//                 console.log(charge);
//             }
//         });

//If we plan to do muliple charging on users, we need to create a customer for the  first. This will create a customer and charge him,
//then save the customer id.
//Once a customer has been created, its stripe ID should be saved in the database.
//@callback(err, customer) : returning a customer object
//@plan : a string - defined on the strip interface - indicating the plan the customer should be charged for
exports.createCustomerWithCard = function(cardDict, plan, userName, userEmail, userMetadata, callback){
    stripe.customers.create({
        card: stripeToken,
        description: userName,
        email: userEmail,
        metadata: userMetadata,
        plan: plan
        }).then(callback)
}

exports.createCustomerWithToken = function(stripeToken, customerName, customerEmail, callback){
    stripe.customers.create({
        card : stripeToken,
        email : customerEmail,
        description : customerName
        }).then(callback);
}

exports.subscribeCustomerToPlan = function(customerId, plan, callback){
	stripe.customers.updateSubscription(customerId, { plan: plan, prorate: true}).then(callback);
}

// export.updateCustomerDetailsWithUser = function(user){

// }


exports.retrievePlan = function(plan, callback){
	stripe.plans.retrieve(plan, callback);
}

//export.updateCustomer
//update customer email 

//Example Customer
// {
//   "object": "customer",
//   "created": 1384017667,
//   "id": "cus_2uUOzekuA2AJ7j",
//   "livemode": false,
//   "description": null,
//   "email": null,
//   "delinquent": false,
//   "metadata": {
//   },
//   "subscription": null,
//   "discount": null,
//   "account_balance": 0,
//   "cards": {
//     "object": "list",
//     "count": 0,
//     "url": "/v1/customers/cus_2uUOzekuA2AJ7j/cards",
//     "data": [

//     ]
//   },
//   "default_card": null
// }

// function chargeCustomer(user){
//     var customerId = getStripeCustomerId(user);

//     stripe.charges.create({
//         amount: 1500, // amount in cents, again
//         currency: 'usd',
//         customer: customer.id
//     });
// }