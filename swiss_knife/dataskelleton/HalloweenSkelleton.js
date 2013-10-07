var models = mongoose.models;

function getSchema (modelName) {
	return model(modelName).schema.tree;
}

function isNullOrUndefined (obj) {
	return obj == null;
}

function hasLinkToModel (obj, path) {
	return obj.type && (obj.ref in models) ? {
		model : [obj.ref],
		path : path
	} : false;
}

function inspectObject (obj, path) {
	var keys = Object.keys(obj);
	var links = [];
	var sublink;
	var value;
	var node;
	var key;
	for(var i = 0, len = keys.length; i < len; i++) {
		key = keys[i];
		if(obj.hasOwnProperty(key)) {
			value = obj[key];
			sublink = getFieldSubLinks(value, path.length ? path + '.' + key : key) || [];
			links = links.concat(sublink);
		}
	}
	return links;
}

function inspectArray (arr, path) {
	var links = [];
	var sublink;
	var value;
	var node;
	for(var i = 0, len = arr.length; i < len; i++) {
		value = arr[i];
		sublink = getFieldSubLinks(value, path.length ? path : i) || [];
		links = links.concat(sublink);
	}
	return links;
}

function getFieldSubLinks (obj, path) {
	if(isNullOrUndefined(obj)) {
		return false;
	}
	else if(obj.isObject()) {
		return hasLinkToModel(obj, path) || inspectObject(obj, path);
	}
	else if(obj.isArray()) {
		return inspectArray(obj, path);
	}
	else {
		return false;
	}
}

function mergeLinksOfModel (arr) {
	var result = {};
	var obj;
	for(var i = 0, len = arr.length; i < len; i++) {
		obj = arr[i];
		if(!result[obj.model]) {
			result[obj.model] = [];
		}
		result[obj.model].push(obj.path);
	}
	return result;
}

exports.getSkelleton = function () {
	var modelNames = Object.keys(models);
	var skelleton = {};
	var modelName;
	var schema;
	var links;
	for(var i = 0; i < modelNames.length; i++) {
		modelName = modelNames[i];
		schema = getSchema(modelName);
		links = getFieldSubLinks(schema, '');
		skelleton[modelName] = links.isArray() ? mergeLinksOfModel(links) : [];
	}
	console.log(skelleton);
};

