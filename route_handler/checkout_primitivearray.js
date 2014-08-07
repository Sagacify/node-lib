function CheckoutPrimitiveArray(context, route){
	this.context = context;
	this.route = route;
	this.state = route.states.last();
	this.parentState = this.state.parentState();
	this.primitiveArray = this.state.obj;
};

CheckoutPrimitiveArray.prototype.get = function(callback){

	var me = this;
	if(this.parentState.state.type()=="Document" && this.parentState.state.obj.isRefArray(this.parentState.path)){
		var getterName = 'get'+this.parentState.path.capitalize();
		if(typeof this.parentState.state.obj[getterName] == 'function'){
			if(this.parentState.state.obj[getterName].hasCallback()){
				var paginate = {
					offset: me.context.req.query.offset,
					limit: me.context.req.query.limit
				};				
				this.parentState.state.obj[getterName]._apply(this.parentState.state.obj,{paginate:paginate}, callback)
			}
			else{
				callback(this.parentState.state.obj[getterName]());
			}
		} else {		
			this.parentState.state.obj.populate(this.parentState.path, function(err){
				if(err){
					return callback(err);
				}
				callback(null, me.parentState.state.obj.get(me.parentState.path));
			});
		}
	}
	else{
		callback(null, this.primitiveArray);
	}
};

CheckoutPrimitiveArray.prototype.post = function(callback){
	var me = this;
	if(this.parentState.state.type() == "Document"){
		this.parentState.state.obj.addInArray(this.parentState.path, this.context.req.body._item||this.context.req.body, function(err, added){
			if(!err){
				me.parentState.state.obj.save(function(err){
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

CheckoutPrimitiveArray.prototype.put = function(callback){
	var me = this;
	if(this.parentState.state.obj.isRefArray(this.parentState.path)){
		this.get(function(err, docs){
			model(me.parentState.state.obj.getRef(me.parentState.path)).schema.sgUpdate.apply(docs, [me.context.req.body._item||me.context.req.body, callback]);
		});
	}
	else{
		callback(new SGError());
	}
};

CheckoutPrimitiveArray.prototype.delete = function(callback){
	var me = this;
	if(this.parentState.state.obj.isRefArray(this.parentState.path)){
		this.get(function(err, docs){
			model(me.parentState.state.obj.getRef()).schema.sgRemove.apply(docs, [callback]);
		});
	}
	else{
		callback(new SGError());
	}
};

module.exports = CheckoutPrimitiveArray;