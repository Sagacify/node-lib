function CheckoutModel(context, route){
	this.context = context;
	this.route = route;
	this.model = route.states.last().obj;
};

CheckoutModel.prototype.get = function(callback){
	// var me = this;
	// setInterval(function(){
	// 	me.model.process._apply(me.model, me.context.req.mixin, callback);
	// }, 3000);
	this.model.get._apply(this.model, this.context.req.mixin, callback);
};

CheckoutModel.prototype.post = function(callback){
	this.model.sgCreate(this.context.req.body, callback);
};

CheckoutModel.prototype.put = function(callback){
	var me = this;
	this.get(function(err, docs){
		me.model.schema.sgUpdate.apply(docs, [me.context.req.body, callback]);
	});
};

CheckoutModel.prototype.delete = function(callback){
	var me = this;
	this.get(function(err, docs){
		me.model.schema.sgRemove.apply(docs, [callback]);
	});
};

module.exports = CheckoutModel;