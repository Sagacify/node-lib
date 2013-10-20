function CheckoutView(context, route){
	this.context = context;
	this.route = route;
	this.state = route.states.last();
	this.parentState = this.state.parentState();
	this.view = this.state.obj;
};

CheckoutView.prototype.get = function(callback){
	this.parentState.state.caller.get.apply(this.parentState.state.obj, [this.parentState.path, {params:this.context.req.mixin.filter}, callback]);
};

CheckoutView.prototype.post = function(callback){
	this.parentState.state.caller.do.apply(this.parentState.state.obj, [this.parentState.path+"_add", this.context.req.body, callback]);
};

CheckoutView.prototype.put = function(callback){
	var me = this;
	this.get(function(err, collDoc){
		if(collDoc instanceof mongoose.Document){
			collDoc.sgUpdate.apply(collDoc, [me.context.req.body, callback]);
		}
		else if(collDoc instanceof Array){
			if(collDoc.length == 0){
				callback(null);
			}
			else{
				if(collDoc[0] instanceof mongoose.Document){
					collDoc[0].schema.sgUpdate.apply(collDoc, [me.context.req.body, callback]);
				}
				else{
					callback(null);
				}
			}
		}
		else{
			callback(new SGError());
		}
	});
};

CheckoutView.prototype.delete = function(callback){
	var me = this;
	this.get(function(err, collDoc){
		if(collDoc instanceof mongoose.Document){
			collDoc.sgRemove.apply(collDoc, [callback]);
		}
		else if(collDoc instanceof Array){
			if(collDoc.length == 0){
				callback(null);
			}
			else{
				if(collDoc[0] instanceof mongoose.Document){
					collDoc[0].schema.sgRemove.apply(collDoc, [callback]);
				}
				else{
					callback(null);
				}
			}
		}
		else{
			callback(new SGError());
		}
	});
};

module.exports = CheckoutView;