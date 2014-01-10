require('../develop/develop');
var async = require('async');
var RouteState = require('./route_state');

var CheckoutModel = require('./checkout_model');
var CheckoutDocument = require('./checkout_document');
var CheckoutDocumentArray = require('./checkout_documentarray');
var CheckoutPrimitive = require('./checkout_primitive');
var CheckoutPrimitiveArray = require('./checkout_primitivearray');
var CheckoutAction = require('./checkout_action');
var CheckoutVirtual = require('./checkout_virtual');

function RouteHandler (options) {
	this.options = options || {};
}

RouteHandler.prototype.handle = function(){
	var me = this;
	return function autoGenerate (req, res) {
		me.buildContext(req, res);
		me.buildRoute(function(err){
			if(!err){
				me.checkout(function(err, checkout){
					if(!err){
						me.clientFormat(checkout, function(err, clientFormat){
							if(err){
								// console.log(err);
								// console.log(err.stack)
							}
							res.SGsend(err||clientFormat);
						});
					}
					else{
						console.log(err);
						console.log(err.stack)
						res.SGsend(err);
					}
				});
			}
			else{
				console.log(err);
				console.log(err.stack)
				res.SGsend(err);
			}
		});
	}
};

RouteHandler.prototype.buildContext = function (req) {
	var scope;
	if(this.options.scope == "clientScope"){
		scope = req.clientScope;
	}
	else if(typeof this.options.scope == "function"){
		scope = this.options.scope(req.clientScope, req.user);
	}
	else{
		scope = this.options.scope;
	}
	this.context = {req:req, user:req.user, scope:scope, cache:this.options.cache};
};

RouteHandler.prototype.buildRoute = function(callback) {
	function seriesHandler (context, route) {
		return function (index, callback) {
			var routeState = new RouteState(context, route, index);
			routeState.build(callback);
		};
	}
	var splitPath = this.context.req.route.path.split('/');
	splitPath.popFirst();
	if(!splitPath.last()) {
		splitPath.pop();
	}
	var splitUrl = this.context.req.url.split('?')[0].split('/');
	splitUrl.popFirst();
	if(!splitUrl.last())
		splitUrl.pop();
	this.route = {
		splitPath: splitPath,
		splitUrl:splitUrl,
		states:[],
		length:splitPath.length
	};
	async.eachSeries(splitPath.keys(), seriesHandler(this.context, this.route), function (err) {
		callback(err);
	});
};

RouteHandler.prototype.checkout = function(callback){
	var checkoutClass;
	switch(this.route.states.last().type()) {
		case "Model":
			checkoutClass = CheckoutModel;
			break;
		case "Document":
			checkoutClass = CheckoutDocument;
			break;
		case "DocumentArray":
			checkoutClass = CheckoutDocumentArray;
			break;
		case "Primitive":
			checkoutClass = CheckoutPrimitive;
			break;
		case "PrimitiveArray":
			checkoutClass = CheckoutPrimitiveArray;
			break;
		case "Action":
			checkoutClass = CheckoutAction;
			break;
		case "Virtual":
			checkoutClass = CheckoutVirtual;
			break;
	}

	if(checkoutClass) {
		new checkoutClass(this.context, this.route)[this.context.req.method.toLowerCase()](callback);
	}
	else{
		callback(null);
	}
};

RouteHandler.prototype.clientFormat = function(checkout, callback){
	if(checkout && typeof checkout.populateDevelop == "function"){
		Object.defineProperty(checkout, "context", {
			writable: true,
			value: this.context
		});
		checkout.populateDevelop(callback);
	}
	else{
		callback(checkout);
	}
};

module.exports = RouteHandler;
