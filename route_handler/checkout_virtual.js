function CheckoutVirtual(context, route){
	this.context = context;
	this.route = route;
	this.state = route.states.last();
	this.parentState = this.state.parentState();
	this.virtual = this.state.obj;
};

CheckoutVirtual.prototype.get = function(callback){
	this.parentState.state.caller.get.apply(this.parentState.state.obj, [this.parentState.path, this.context.req.mixin.filter, callback]);
};

CheckoutVirtual.prototype.post = function(callback){
	var me = this;
	if(this.parentState.state.type() == "Document"){
		this.parentState.state.obj.addInArray(this.parentState.path, this.context.req.body._item||this.context.req.body, function(err, added){
			if(!err){
				me.parentState.state.obj.save(function(err){
					console.log(err)
					callback(err, me.parentState.state.obj);
				});
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

CheckoutVirtual.prototype.put = function(callback){
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

CheckoutVirtual.prototype.delete = function(callback){
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

module.exports = CheckoutVirtual;