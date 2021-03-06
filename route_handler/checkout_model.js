function CheckoutModel(context, route){
	this.context = context;
	this.route = route;
	this.model = route.states.last().obj;
};

CheckoutModel.prototype.get = function(callback){
	this.model.getRoot._apply(this.model, this.context.req.mixin, callback);
};

CheckoutModel.prototype.post = function(callback){
	this.model.sgCreate(this.context.req.mixin, callback);
};

CheckoutModel.prototype.put = function(callback){
	var me = this;
	this.get(function(err, docs){
		me.model.schema.sgUpdate.apply(docs, [me.context.req.mixin, callback]);
	});
};

CheckoutModel.prototype.delete = function(callback){
	var me = this;
	this.get(function(err, docs){
		me.model.schema.sgRemove.apply(docs, [callback]);
	});
};

module.exports = CheckoutModel;