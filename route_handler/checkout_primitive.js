function CheckoutPrimitive(context, route){
	this.context = context;
	this.route = route;
	this.state = route.states.last();
	this.parentState = this.state.parentState();
	this.primitive = this.state.obj;
};

CheckoutPrimitive.prototype.get = function(callback){
	console.log(this.primitive)
	if(this.parentState.state.obj.isRef(this.parentState.path)){
		this.parentState.state.obj.populate(this.parentState.path, function(err){
			if(!err){
				callback(null, parentState.state.obj.get(parentState.state.path));
			}
			else{
				callback(err)
			}
		});
	}
	else{
		callback(null, this.primitive);
	}
};

CheckoutPrimitive.prototype.post = function(callback){
	callback(new SGError());
};

CheckoutPrimitive.prototype.put = function(callback){
	var me = this;
	if(this.parentState.state.obj.isRef(this.parentState.path)){
		this.get(function(err, doc){
			doc.sgUpdate.apply(doc, [me.context.req.body._item||me.context.req.body, callback]);
		});
	}
	else{
		callback(new SGError());
	}
};

CheckoutPrimitive.prototype.delete = function(callback){
	var me = this;
	var previousState = this.state.previousState();
	if(previousState.type() == "Model"){
		var filter = {};
		var key = this.state.pathPart().substring(1, this.state.pathPart().length);
		filter[key] = this.urlPart();
		parentState.state.obj.process(filter, null, null, callback);
	}
	else if(previousState.type() == "PrimitiveArray"){
		var parentPreviousState = previousState.parentState();
		if(parentPreviousState.state.type() == "Document"){
			parentPreviousState.state.obj.removeFromArray(parentPreviousState.path, this.primitive, function(err){
				if(!err){
					parentPreviousState.state.obj.save(function(err){
						callback(err, parentPreviousState.state.obj);
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
	}
	else if(this.parentState.state.obj.isRef(this.parentState.path)){
		this.get(function(err, doc){
			doc.sgRemove.apply(doc, [callback]);
		});
	}
	else{
		callback(new SGError());
	}
};

module.exports = CheckoutPrimitive;