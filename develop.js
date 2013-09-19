var async = require('async');

//develop doc or array of docs
exports.developArrDoc = function(arrDoc, user, options, callback){
	if(arrDoc instanceof Array){
		var developedObjs = [];
		async.forEachSeries(arrDoc, function(doc, callback){
			exports.developArrDoc(doc, user, options, function(err, developedObj){
				developedObjs.push(developedObj);
				callback(err);
			});
		}, function(err){
			callback(err, developedObjs);
		});
	}
	else{
		if(!arrDoc || !arrDoc.develop){
			return callback(null, arrDoc);
		}
		arrDoc.develop(user, options, callback);
	}
}

exports.populateDevelopSubObjs = function(arrObj, arrDoc, fieldsToPopulate, user, options, callback){
	if(arrObj instanceof Array){
		var tmp = 0;
		async.forEach(arrDoc, function(doc, callback){
			var index = tmp;
			tmp++;
			exports.populateDevelopSubObjs(arrObj[index], doc, fieldsToPopulate, user, options, callback);
		}, function(err){
			callback(err);
		});
	}
	else{
		var obj = arrObj;
		var doc = arrDoc;

		var childFields = fieldsToPopulate.filter(function(item){
			for(var i = 0; i < fieldsToPopulate.length; i++){
				if(item.startsWith(fieldsToPopulate[i]) && item != fieldsToPopulate[i])
					return false;
			}
			//if(obj[item] == undefined)
			if(exports.getRecursiveField(doc, item) == undefined)
				return false;
			if(exports.getRecursiveField(obj, item) == undefined)
				return false;
			return true;
		});
		async.forEach(childFields, function(childField, callback){
			var subOptions = options?options[childField]:null;
			
			var grandChildFields = fieldsToPopulate.filter(function(item){
				return item.startsWith(childField) && item != childField;
			});
			
			for(var i = 0; i < grandChildFields.length; i++){
				grandChildFields[i] = grandChildFields[i].substring(childField.length+1, grandChildFields[i].length);
			}
				
			var developPopulatedField = function(arrDoc, fieldsToPopulate, user, options, callback){
				exports.developArrDoc(arrDoc, user, options, function(err, arrObj){
					if(!err){
						exports.populateDevelopSubObjs(arrObj, arrDoc, fieldsToPopulate, user, options, function(err){
							callback(err, arrObj);
						});	
					}
					else
						callback(err);
				});
			}
			if(exports.getRecursiveField(doc, childField) instanceof Array){
				if(exports.getRecursiveField(doc, childField).length > 0 && typeof exports.getRecursiveField(doc, childField)[0].develop == "function"){
					developPopulatedField(exports.getRecursiveField(doc, childField), grandChildFields, user, subOptions, function(err, subArrObj){
						if(!err)
							exports.setRecursiveField(obj, childField, subArrObj);
						callback(err);
					});
				}
				else if(exports.getRecursiveField(doc.schema.tree, childField) && exports.getRecursiveField(doc.schema.tree, childField)[0].ref) {
					mongoose.model(exports.getRecursiveField(doc.schema.tree, childField)[0].ref).find({_id:{$in:exports.getRecursiveField(doc, childField)}}, exports.populateDevelop(grandChildFields, user, subOptions, function(err, subArrObj){
						if(!err)
							exports.setRecursiveField(obj, childField, subArrObj);
						callback(err);
					}));	
				}
				else{
					callback(null);
				}
			}
			else{
				var recursiveObjValue = exports.getRecursiveField(doc, childField);
				var recursiveSchemaValue = exports.getRecursiveField(doc.schema.tree, childField); 
				if(recursiveObjValue && typeof recursiveObjValue.develop == "function"){
					developPopulatedField(recursiveObjValue, grandChildFields, user, subOptions, function(err, subArrObj){
						if(!err)
							exports.setRecursiveField(obj, childField, subArrObj);
						callback(err);
					});
				}
				else if(recursiveSchemaValue && recursiveSchemaValue.ref){
					mongoose.model(recursiveSchemaValue.ref).findById(recursiveObjValue, exports.populateDevelop(grandChildFields, user, subOptions, function(err, subObj){
						if(!err)
							exports.setRecursiveField(obj, childField, subObj);
						callback(err);
					}, start));
				}
				else if(recursiveObjValue && recursiveObjValue.ref && recursiveObjValue.type){
					mongoose.model(recursiveObjValue.ref).findById(recursiveObjValue.type, exports.populateDevelop(grandChildFields, user, subOptions, function(err, subObj){
						if(!err)
							exports.setRecursiveField(obj, childField, subObj);
						callback(err);
					}, start));
				}
				else{
					callback(null);
				}
			}
		}, function(err){
			callback(err);
		});
	}
};

exports.populateDevelopArrDoc = function(arrDoc, fieldsToPopulate, user, options, callback){
	if(arrDoc instanceof Array){
		for(var i = 0; i < arrDoc.length; i++){
			for(var key in arrDoc[i].schema.tree){
				if(arrDoc[i][key] instanceof Array && arrDoc[i][key].length > 0 && typeof arrDoc[i][key][0].develop == "function" && fieldsToPopulate.indexOf(key) == -1)
					fieldsToPopulate.push(key);	
				if(arrDoc[i][key] && typeof arrDoc[i][key].develop == "function" && fieldsToPopulate.indexOf(key) == -1)
					fieldsToPopulate.push(key);	
				}
		}
	}
	else if(arrDoc){
		for(var key in arrDoc.schema.tree){
			if(arrDoc[key] instanceof Array && arrDoc[key].length > 0 && typeof arrDoc[key][0].develop == "function" && fieldsToPopulate.indexOf(key) == -1)
				fieldsToPopulate.push(key);	
			if(arrDoc[key] && arrDoc[key]._id && typeof arrDoc[key].develop == "function" && fieldsToPopulate.indexOf(key) == -1)
				fieldsToPopulate.push(key);
		}
	}
	exports.developArrDoc(arrDoc, user, options, function(err, arrObj){
		if(!err){
			exports.populateDevelopSubObjs(arrObj, arrDoc, fieldsToPopulate, user, options, function(err){
				callback(err, arrObj);
			});	
		}
		else
			callback(err);
	});
};

exports.populateDevelop = function(fieldsToPopulate, user, options, callback){
	return function(err, arrDoc){
		if(err) return callback(err);
		if(!arrDoc) return callback(null, null);
		exports.populateDevelopArrDoc(arrDoc, fieldsToPopulate, user, options, callback);
	}
};

exports.develop = function(user, options, callback){
	return exports.populateDevelop([], user, options, callback);
};

exports.getRecursiveField = function(obj, field){
	if(!obj)
		return null;
	var splitField = field.split('.');
	var toReturn = obj;
	splitField.forEach(function(fieldPart){
		if(toReturn)
			toReturn = toReturn[fieldPart];
	});
	return toReturn;
};

exports.setRecursiveField = function(obj, field, value){
	var splitField = field.split('.');
	var objToSet = obj;
	for(var i = 0; i < splitField.length-1; i++){
		objToSet = objToSet[splitField[i]];
		if(!objToSet)
			return;
	}
	objToSet[splitField[splitField.length-1]] = value;
};