function CheckoutDocument(context, route){
	this.context = context;
	this.route = route;
	this.state = route.states.last();
	this.parentState = this.state.parentState();
	this.doc = this.state.obj;
};

CheckoutDocument.prototype.get = function(callback){
	callback(null, this.doc);
};

CheckoutDocument.prototype.post = function(callback){
	callback(new SGError());
};

CheckoutDocument.prototype.put = function(callback){
	this.doc.sgUpdate.apply(this.doc, [this.context.req.mixin, callback]);
};

CheckoutDocument.prototype.delete = function(callback){
	var me = this;
	if(this.doc instanceof mongoose.Model){
		if(this.doc.sgRemove.hasCallback()){
			this.doc.sgRemove(callback);
		}
		else{
			var ret = this.doc.sgRemove();
			if(ret instanceof Error || ret instanceof SGError){
				callback(ret);
			}
			else{
				callback();
			}
		}
	}
	else if(this.parentState.state.obj instanceof mongoose.Types.DocumentArray){
		this.parentState.state.obj.removeFromArray(this.parentState.path, this.doc, function(err){
			if(!err){
				me.parentState.state.parentState().state.obj.save(callback);
			}
			else{
				callback(err);
			}
		});
	}
	else{
		callback(new SGError());
	}
};

module.exports = CheckoutDocument;