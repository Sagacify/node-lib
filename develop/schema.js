var async = require('async');

mongoose.Schema.prototype.populateDevelop = function(callback){
	var context = this.context;

	if (!this.length) {
		callback();
		return;
	};

	if(!(this[0] instanceof mongoose.Document)){
		callback(null, this);
	} else {
		var schema = this.schema||this;

		var fieldsToPopulate = schema.populateOptions(context.scope);
		if(!(fieldsToPopulate instanceof Array)){
			fieldsToPopulate = fieldsToPopulate.fields;
		}

		var fieldsToPopulateString = "";
		fieldsToPopulate.forEach(function(fieldToPopulate){
			fieldsToPopulateString += fieldToPopulate + " ";
		});
		
		var developedArray = [];
		var me = this;
		var populateDevelopDocs = function(){
			async.each(me.indexes(), function(index, callback){
				me[index].setHidden('context', context);
				me[index].populateDevelop(function(err, popDevObj){
					if(!err){
						developedArray[index] = popDevObj;
					}
					callback(err);
				});				
			}, function(err){
				callback(err, developedArray);
			});
		};

		if(fieldsToPopulateString && typeof this.getModel == "function"){
			this.getModel().populate(this, fieldsToPopulateString, function(err, popDocs){
				populateDevelopDocs();
			});
		}
		else{
			populateDevelopDocs();
		}
	}
};

//remove unnecessary fields and do additional process after cache
mongoose.Schema.prototype.overdevelop = function(popDevObject, callback){
	if(typeof this.statics.overdevelop == "function")
		this.statics.overdevelop.apply(this, arguments);
	else
		callback(null, popDevObject);
};

mongoose.Schema.prototype.projectionFields = function(scope){
	if(typeof this.statics.projectionFields == "function")
		return this.statics.projectionFields.apply(this, arguments);
	else
		return this.developOptions(scope).fields;
};

//require key and ttl: ex. {key:collection:id, ttl:60}
mongoose.Schema.prototype.cacheOptions = function(context){
	if(typeof this.statics.cacheOptions == "function")
		return this.statics.cacheOptions.apply(this, arguments);
	else
		return false;
};

mongoose.Schema.prototype.populateOptions = function(scope){

	if(typeof this.statics.populateOptions == "function")
		return this.statics.populateOptions.apply(this, arguments);
	else
		return {fields: []};
};

mongoose.Schema.prototype.developOptions = function(scope){
	if(typeof this.statics.developOptions == "function")
		return this.statics.developOptions.apply(this, arguments);
	else
		return null;
};

mongoose.Schema.prototype.populateDevelopChildrenOptions = function(scope){
	if(typeof this.statics.populateDevelopChildrenOptions == "function")
		return this.statics.populateDevelopChildrenOptions.apply(this, arguments);
	else
		return {childrenScopes: {}};
};

mongoose.Schema.prototype.overdevelopOptions = function(scope){
	if(typeof this.statics.overdevelopOptions == "function")
		return this.statics.overdevelopOptions.apply(this, arguments);
	else
		return {fields: []};
};