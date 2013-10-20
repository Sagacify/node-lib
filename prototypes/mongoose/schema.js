var async = require('async');
var HalloweenSkelleton = require('../../dataskelleton/HalloweenSkelleton');

mongoose.Schema.prototype.getFormattedSchema = function(options, callback){
	//this.paths[key].validators[0][0]
	if(arguments.length == 1 && typeof options == "function")
		callback = options;

	var me = this;
	var getFormattedSchemaElement = function(schemaElement, callback){
		if(schemaElement.tree){
			var formattedSchema = {};
			async.forEach(schemaElement.tree.keys(), function(key, callback){
				getFormattedSchemaElement(schemaElement.tree[key], function(err, formattedSchemaElement){
					if(!err){
						if(formattedSchemaElement)
							formattedSchema[key] = formattedSchemaElement;
					}
					callback(err);
				});
			}, function(err){
				if(!err){
					schemaElement.formattedSchema = formattedSchema;
				}
				callback(err, formattedSchema);
			});
		}
		//array
		else if(schemaElement instanceof Array){
			var formattedArray = [];
			async.forEach(schemaElement, function(arrayItem, callback){
				getFormattedSchemaElement(arrayItem, function(err, formattedArrayItem){
					if(!err){
						formattedArray.push(formattedArrayItem);
					}
					callback(err);
				});
			}, function(err){
				callback(err, formattedArray);
			});
		}
		else if(schemaElement.ref){
			callback(null, {type:schemaElement.type, ref:schemaElement.ref});
		}
		else if(schemaElement.name){
			callback(null, {type:schemaElement.name});
		}
		else if(schemaElement.type && schemaElement.type.name){
			callback(null, {type:schemaElement.type.name});
		}
		else if(schemaElement.path){
			callback(null, null);
		}
		else if(schemaElement == "string"){
			callback(null, {type:"String"});
		}
		//simple dictionary
		else{
			var formattedDic = {};
			async.forEach(schemaElement.keys(), function(key, callback){
				getFormattedSchemaElement(schemaElement[key], function(err, formattedSchemaElement){
					if(!err){
						if(formattedSchemaElement)
							formattedDic[key] = formattedSchemaElement;
					}
					callback(err);
				});
			}, function(err){
				callback(err, formattedDic);
			});
		}
	}

	if(this.formattedSchema)
		callback(null, this.formattedSchema);
	else
		getFormattedSchemaElement(this, callback);
};

// mongoose.Schema.prototype.formattedSchemaElement = function(path){
// 	var itemSchema = this.tree._get(path);
// 	if(!itemSchema){
// 		return null;
// 	}
// 	else if(itemSchema instanceof mongoose.Types.DocumentArray){

// 	}
// 	else if(itemSchema.isArray()){
// 		return [this.pathType(path+".0")];
// 	}
// 	else if(itemSchema.isObject()){

// 	}
// 	else {
// 		return {type:itemSchema};
// 	}
// };

var Skelleton = HalloweenSkelleton.getSkelleton();
var models = Object.keys(mongoose.models);
var i = models.length;
var model;
while(i--) {
	model = models[i];
	mongoose.models[model].schema.getSkelleton = Skelleton[model];
}

mongoose.models.keys().forEach(function(model){
	mongoose.models[model].schema.getFormattedSchema(function(err, fs){});
});



mongoose.Schema.prototype.get = function(path, callback){
	var schema = this.schema?this.schema:this;
	if(typeof schema.statics[path] == "function"){
		if(schema.statics[path].getParamNames()[0] === "callback"){
			schema.statics[path].apply(this, [callback]);
		}
		else{
			callback(null, schema.statics[path].apply(this));	
		}
	}
	else{
		callback(null, schema.statics[path]);
	}
};

mongoose.Schema.prototype.do = function(action, params, callback){
	if(this instanceof mongoose.Schema){
		this.statics[action]._apply(this, params, callback);
	}
	else if(this instanceof Array && this.schema.statics[action]){
		this.schema.statics[action]._apply(this, params, callback);
	}
	else if(this instanceof Array && this.length > 0 && typeof this[0][action] == "function"){
		var me = this;
		var responses = [];
		async.each(this.keys(), function(docIndex, callback){
			this[docIndex].do(action, params, function(err, response){
				responses[docIndex] = response;
				callback(err);
			});
		}, function(err){
			callback(err, responses);
		});
	}
	else{
		callback(new SGError());
	}
};

mongoose.Schema.prototype.sgUpdate = function(args, callback){
	var me = this;
	async.each(this, function(doc, callback){
		doc.sgUpdate(args, callback);
	}, function(err){
		callback(err, me);
	});
};

mongoose.Schema.prototype.sgRemove = function(item){
	if(typeof item == "function"){
		var callback = item;
		async.each(this, function(doc, callback){
			doc.remove(callback);
		}, function(err){
			callback(err);
		});
	}
	else{
		for(var i = this.length-1; i >= 0; i--){
			if((this[i] && this[i] instanceof mongoose.Types.ObjectId && this[i].equals(item)) || (item && item instanceof mongoose.Types.ObjectId && item.equals(this[i])) || (this[i] == item)){
				this.splice(i, 1);
			}
		}
	}
};
