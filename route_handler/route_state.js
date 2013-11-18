function RouteState(context, route, index){
	this.context = context;
	this.route = route;
	route.states.push(this);
	this.index = index;
	//console.log("route part : " + this.pathPart())
};

RouteState.prototype.previousState = function(){
	return this.route.states[this.index-1];
};

RouteState.prototype.nextState = function(){
	return this.route.states[this.index+1];
};

RouteState.prototype.parentState = function(){
	if(this._parentState){
		return this._parentState;
	}
	var path = this.urlPart();
	var previousState = this.previousState();
	while(previousState){
		if(previousState.obj && previousState.obj.isObject() && previousState.type() != "Document" && previousState.type() != "DocumentArray"){
			path = previousState.urlPart()+"."+path;
			previousState = previousState.previousState();
		}	
		else{
			this._parentState = {state:previousState, path:path};
			return this._parentState;
		}
	}
	return null;
};

//path is the route specified in our constroller, e.g. /api/users/:id
RouteState.prototype.pathPart = function(){
	return this.route.splitPath[this.index];
};

//url is the actual uri specified by the client, e.g. /api/users/5232c14e65521a0000000001
RouteState.prototype.urlPart = function(){
	return this.route.splitUrl[this.index];
};

RouteState.prototype.type = function(){
	if(!this.obj){
		return null;
	}
	else if(typeof this.obj == "function" && this.obj.name == "model"){
		return "Model";
	}
	else if(this.obj instanceof mongoose.Document){
		return "Document";
	}
	else if(this.obj instanceof mongoose.Types.DocumentArray){
		return "DocumentArray";
	}
	else if(this.obj instanceof Array){
		return "PrimitiveArray";
	}
	else{
		var parentState = this.parentState();
		if(typeof this.obj == "function" && parentState.state.type() == "Document" && (parentState.state.obj.schema.hasAction(this.urlPart()))){
			return "Action";
		}
		if(typeof this.obj == "function" && parentState.state.type() == "Document" && (parentState.state.obj.schema.hasVirtual(this.urlPart()))){
			return "Virtual";
		}
		else{
			return "Primitive";
		}
	}
};

RouteState.prototype.getObject = function(callback){
	//console.log("getObject")
	var nbPartsToSkip = 1;
	//skip first (api)
	if(this.index < nbPartsToSkip){
		return callback(null)
	}
	//get model to start
	if(this.index == nbPartsToSkip){
		//get current user
		if(this.pathPart()=="user"){
			callback(null, this.context.user);
		}
		else{
			callback(null, mongoose.model(mongoose.modelNameFromCollectionName(this.pathPart())));
		}
	}
	else {
		//variable part
		if(this.pathPart().startsWith(":")){
			this.getObjectFromVariablePath(callback);
		}
		//fix part
		else{
			this.getObjectFromFixPath(callback);
		}
	}
};

RouteState.prototype.getObjectFromVariablePath = function(callback){
	//console.log("getObjectFromVariablePath")
	var parentState = this.parentState();
	if(!parentState){
		return callback(new SGError());
	}
	if(this.pathPart().toLowerCase().endsWith("id")){
		//parentState is Model
		if(parentState.state.type() == "Model"){
			parentState.state.obj.sgFindById(this.urlPart(), callback);
		}
		//parentState is DocumentArray
		else if(parentState.state.type() == "DocumentArray"){
			callback(null, parentState.state.obj.id(this.urlPart()))
		}
		else{
			callback(null, this.urlPart());
		}
	}
	//if urlpart is a variable but not an id, it is used as a filter on the collection
	else{
		callback(null, this.urlPart());
	}
};

RouteState.prototype.getObjectFromFixPath = function(callback){
	//console.log("getObjectFromFixPath")
	var parentState = this.parentState();
	if(!parentState || !parentState.state.caller){
		return callback();
	}
	
	//take me from normal dictionary or do not execute function if last route part (action or virtual)
	if(!parentState.state.caller.get || parentState.state.obj.schema && (parentState.state.obj.schema.hasVirtual(parentState.path)||parentState.state.obj.schema.hasAction(parentState.path)) && this.index == this.route.length-1){
		var path = parentState.path;
		if(parentState.state.obj.schema.hasVirtual(parentState.path))
			path = "get"+path.capitalize();
		callback(null, parentState.state.caller[path]);
	}
	//get me from document or collection, i am in a virtual or in the tree 
	else{
		parentState.state.caller.get.apply(parentState.state.obj, [parentState.path, callback]);
	}
};

//populate only if not last route part and if current object is reference or array of reference and is not in the further conditions
RouteState.prototype.populateObject = function(callback){
	//console.log("populateObject")
	var parentState = this.parentState();
	if(this.type()=='Virtual' || this.type()=='Action' || this.type()=='Primitive' || this.type()=='DocumentArray' || !parentState || !(parentState.state.obj instanceof mongoose.Document)){
		return callback(null);
	}
	if(this.index == this.route.length-1 || parentState.state.type() != "Document" || !parentState.state.obj.isRef(parentState.path) || !parentState.state.obj.isRefArray(parentState.path) ||
		this.context.req.method == "DELETE" && this.index == this.route.length-2 && parentState.state.obj.get(parentState.path) instanceof Array && this.route.splitUrl[this.index+1] != this.route.splitPath[this.index+1]){
		callback(null, parentState.state.obj.get(parentState.path));
	}
	//must come from a Document
	else{
		parentState.state.obj.populate(parentState.path, function(err){
			if(!err){
				callback(null, parentState.state.obj.get(parentState.path));
			}
			else{
				callback(err)
			}
		});
	}
};

//if collection as array -> the caller is the model attached to it
RouteState.prototype.attachCaller = function(){
	//console.log("attachCaller")
	var caller;
	if(typeof this.obj == "function" && this.obj.name == "model"){
		caller = this.obj.schema;
	}
	else if(!(this.obj instanceof Array) || this.obj instanceof mongoose.Types.DocumentArray){
		caller = this.obj;
	}
	else{
		var parentState = this.parentState();
		if(parentState){
			if(parentState.state.obj instanceof mongoose.Document && parentState.state.obj.schema.tree._get(parentState.path)){
				caller = model(parentState.state.obj.schema.tree._get(parentState.path)[0].ref).schema;
			}
			if(parentState.state.caller instanceof mongoose.Schema){
				var collectionName = parentState.state.caller.statics[parentState.path].name.split('_')[1];
				var modelName = mongoose.modelNameFromCollectionName(collectionName);
				if(modelName)
					caller = model(modelName).schema;
			}
		}
	}
	this.caller = caller;
};

RouteState.prototype.attachContext = function(){
	if(this.obj && (this.obj.isObject()||this.obj instanceof Function)){
		Object.defineProperty(this.obj, "context", {
			writable: true,
			value: this.context
		});
	}
};

RouteState.prototype.build = function(callback){
	var me = this;
	this.getObject(function(err, obj){
		if(!err){
			me.obj = obj;
			me.populateObject(function(err, popObj){
				if(popObj){
					me.populated = obj;
					me.obj = popObj;
				}
				//console.log(me.obj)
				me.attachCaller();
				me.attachContext();
				callback(err);
			});
		}
		else{
			callback(err);
		}
	});
};




module.exports = RouteState;