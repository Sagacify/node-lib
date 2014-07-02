// var is = require('../strict_typing/validateType');


// configureSemiEmbedded = function(){
// 	var allSchemas = allSchemas();
// 	for (var i = allSchemas.length - 1; i >= 0; i--) {
// 		if (allSchemas[i]) {};
// 	};
// }

// configureSemiEmbeddedForSchema = function(schema){
// 	for(var path in schema){
// 		value = schema[path];
// 		if (pathIsRef(value)) {
// 			//path is embedded (author._id)
// 			var splittedPath = path.split('.');
// 			if (splittedPath.length>1) {
// 				// first part nested 
// 				if (!!~Object.keys(schema.nested).indexOf(splittedPath[0]) && schema.nested[splittedPath[0]]) {
// 					//tag each author. (name, username, ...);		
// 				};
// 			};
// 		};

// 		if (pathIsArray(value)) {
			
// 		};

// 	}
// }



// pathIsRef = function(value){
// 	return value.options && value.options.ref;
// }

// pathIsString = function(){
// 	return value.constructor.name == 'SchemaString';
// }

// pathIsNumber = function(){
// 	return value.constructor.name == 'SchemaNumber';
// }

// pathIsDate = function(){
// 	return value.constructor.name == 'SchemaDate';
// }

// pathIsArray = function(){
// 	return value.constructor.name == 'SchemaArray';
// }

// pathIsDocumentArray= function(){
// 	return value.constructor.name == 'DocumentArray'
// }



// var allSchemas=  function(){
// 	var results = [];
// 	for(var modelName in mongoose.models){
// 		results.push(mongoose.models[modelName].schema);
// 	}
// 	return results;
// }

// var getLinkedObjectsPaths = function(instance){
// 	var refToFound = instance.constructor.modelName;
// 	var schemas = allSchemas();

// 	var result = [];
// 	for (var i = 0; i < schemas.length; i++) {
// 		var paths = getLinkDependanciesforSchema(schemas[i], refToFound);
// 	};
// 	return result;
// }

// var analyzeKey = function(path, schema){
// 	pathType = schema.paths[path];

// 	if (pathIsRef(attrType)) {
// 		//same ref
// 		if ((attrType.options.ref == refToFound)) {
// 			//is embedded


// 		};
// 	}

// }

// var getLinkDependanciesforSchema = function(schema, refToFound){

// 	for(var attrName in schema.paths){
// 		var attrType = schema[attrName];
// 		if (pathIsRef(attrType) && (attrType.options.ref == refToFound) && ) {
// 			//Embedded simple	


// 		};
		



// 	}
// }

// getFieldContainsObjectRef = function(field, ref){
// 	if (field.type == "ObjectId" && field.meta.ref == ref) {
// 		return {type:"ObjectId", meta:field.meta};
// 	};
// 	if (field.type == "Object") {
// 		var fields =  getLinkDependanciesforMetaModel(field, ref);
// 		if (fields.length) {
// 			return {type:"Object", content:fields, meta:field.meta};
// 		} else {
// 			return null;
// 		}
// 	};

// 	if (field.type == "Array") {
// 		var contentFields =  getFieldContainsObjectRef(field.content, ref)
// 		if (!contentFields) {
// 			return null;
// 		} else {
// 			return {type:"Array", content:contentFields, meta:field.meta};	
// 		}

// 	};
// 	return null;
// }

mongoose.Document.prototype.getLinkedDocuments = function(callback){

	// console.log('LINK OBXdObjectsPaths(this));
}




