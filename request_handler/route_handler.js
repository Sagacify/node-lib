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

function RouteHandler(options){
	this.options = options;
};

RouteHandler.prototype.handle = function(req, res){
	console.log(req.params);
	
	var me = this;
	return function (req, res) {
		me.buildContext(req, res);
		me.buildRoute(function(err){
			if(!err){
				me.checkout(function(err, checkout){
					if(!err){
						me.clientFormat(checkout, function(err, clientFormat){
							if(err){
								console.log(err);
								console.log(err.stack)
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

RouteHandler.prototype.buildContext = function(req){
	this.context = {req:req, user:req.user, scope:this.options.scope, cache:this.options.cache};
};

RouteHandler.prototype.buildRoute = function(callback){
	var splitPath = this.context.req.route.path.split('/');
	splitPath.popFirst();
	if(!splitPath.last())
		splitPath.pop();
	var splitUrl = this.context.req.url.split('?')[0].split('/');
	splitUrl.popFirst();
	if(!splitUrl.last())
		splitUrl.pop();
	this.route = {splitPath:splitPath, splitUrl:splitUrl, states:[], length:splitPath.length};
	var me = this;
	async.eachSeries(splitPath.keys(), function(index, callback){
		var routeState = new RouteState(me.context, me.route, index);
		routeState.build(callback);
	}, function(err){
		callback(err);
	});
};

RouteHandler.prototype.checkout = function(callback){
	var checkoutClass;
	switch(this.route.states.last().type()){
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
	};

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