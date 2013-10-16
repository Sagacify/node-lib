require('../develop/model');

function RouteHandler(options){
	this.options = options;
};

RouteHandler.prototype.handle = function(req, res){
	var me = this;
	this.buildContext(req, res);
	this.finalState(function(err, routeState){
		if(!err){
			me.checkout(routeState, function(err, checkout){
				if(!err){
					me.clientFormat(checkout, function(err, clientFormat){
						res.SGsend(err||clientFormat);
					});
				}
				else{
					res.SGsend(err);
				}
			});
		}
		else{
			res.SGsend(err);
		}
	});

};

RouteHandler.prototype.buildContext = function(req){

};

RouteHandler.prototype.finalState = function(callback){

};

RouteHandler.prototype.checkout = function(routeState, callback){

};

RouteHandler.prototype.clientFormat = function(checkout, callback){

};

module.exports = RouteHandler;