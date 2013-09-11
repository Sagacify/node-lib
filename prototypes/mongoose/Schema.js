var async = require('async');

mongoose.Schema.prototype.format = function(user, options, callback){
	formatSchemaElement(this, user, options, callback);
}

formatSchemaElement = function(schemaElement, user, options, callback){
	if(schemaElement.tree){
		var formattedSchema = {};
		var keys = [];
		for(var key in schemaElement.tree)
			keys.push(key);
		async.forEach(keys, function(key, callback){
			formatSchemaElement(schemaElement.tree[key], user, options, function(err, formattedSchemaElement){
				if(!err){
					if(formattedSchemaElement)
						formattedSchema[key] = formattedSchemaElement;
				}
				callback(err);
			});
		}, function(err){
			if(!err){
				if(typeof schemaElement.statics.adminMetaData == "function"){
					schemaElement.statics.adminMetaData(user, options, function(err, adminMetaData){
						if(!err){
							formattedSchema._meta2__ = adminMetaData;
						}
						callback(err, formattedSchema);
					});
				}
				else{
					formattedSchema._meta2__ = {};
					callback(null, formattedSchema);
				}
			}
			else{
				callback(err);	
			}
		});
	}
	//array
	else if(schemaElement instanceof Array){
		var formattedArray = [];
		async.forEach(schemaElement, function(arrayItem, callback){
			formatSchemaElement(arrayItem, user, options, function(err, formattedArrayItem){
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
		callback(null, schemaElement.ref); 
	}
	else if(schemaElement.name){
		callback(null, schemaElement.name);
	}
	else if(schemaElement.type && schemaElement.type == "Meta"){
		callback(null, "Meta");
	}
	else if(schemaElement.type && schemaElement.type.name){
		callback(null, schemaElement.type.name);
	}
	else if(schemaElement.path){
		callback(null, null);
	}
	else if(schemaElement == "string"){
		callback(null, "String");
	}
	//simple dictionary
	else{
		var formattedDic = {};
		var keys = [];
		for(var key in schemaElement)
			keys.push(key);
		async.forEach(keys, function(key, callback){

			formatSchemaElement(schemaElement[key], user, options, function(err, formattedSchemaElement){
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