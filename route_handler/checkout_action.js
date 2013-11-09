function CheckoutAction(context, route){
	this.context = context;
	this.route = route;
	this.state = route.states.last();
	this.parentState = this.state.parentState();
	this.action = this.state.obj;
};

CheckoutAction.prototype.get = function(callback){
	callback(new SGError());
};

CheckoutAction.prototype.post = function(callback){
	this.parentState.state.caller.do.apply(this.parentState.state.obj, [this.parentState.path, this.context.req.body, callback]);
};

CheckoutAction.prototype.put = function(callback){
	callback(new SGError());
};

CheckoutAction.prototype.delete = function(callback){
	callback(new SGError());
};

module.exports = CheckoutAction;