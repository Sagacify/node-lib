function CheckoutModel(context, route){
	this.context = context;
	this.route = route;
	this.model = route.states.last().obj;
};

CheckoutModel.prototype.get = function(callback){
	this.model.process._apply(this.model, this.context.req.mixin, callback);
};

CheckoutModel.prototype.post = function(callback){
	this.model.create(this.context.req.body, callback);
};

CheckoutModel.prototype.put = function(callback){
	var me = this;
	this.get(function(err, docs){
		me.model.sgUpdate.apply(docs, [me.context.req.body, callback]);
	});
};

CheckoutModel.prototype.delete = function(callback){
	var me = this;
	this.get(function(err, docs){
		me.model.sgRemove.apply(docs, [callback]);
	});
};

module.exports = CheckoutModel;