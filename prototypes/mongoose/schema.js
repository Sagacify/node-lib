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
					me.formattedSchema = formattedSchema;
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
