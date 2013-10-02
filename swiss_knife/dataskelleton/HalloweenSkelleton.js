var models = mongoose.models;

function getSchema (modelName) {
	return model(modelName).schema.tree;
}

function isNullOrUndefined (obj) {
	return obj == null;
}

function hasLinkToModel (obj) {
	return ('ref' in obj) && ('type' in obj) && (obj.ref in models) ? [obj.ref]: false;
}

function inspectObject (obj) {
	var keys = Object.keys(obj);
	var links = [];
	var sublink;
	var value;
	var node;
	var key;
	for(var i = 0; i < keys.length; i++) {
		key = keys[i];
		if(obj.hasOwnProperty(key)) {
			value = obj[key];
			sublink = getFieldSubLinks(value) || [];
			if(sublink.length) {
				console.log(key);
			}
			links = links.concat(sublink);
		}
	}
	return links;
}

function inspectArray (arr) {
	var links = [];
	var sublink;
	var value;
	var node;
	for(var i = 0; i < arr.length; i++) {
		value = arr[i];
		sublink = getFieldSubLinks(value) || [];
		if(sublink.length) {
			console.log(i);
		}
		links = links.concat(sublink);
	}
	return links;
}

function getFieldSubLinks (obj) {
	if(isNullOrUndefined(obj)) {
		return false;
	}
	else if(obj.isObject()) {
		console.log('-------------');
		return hasLinkToModel(obj) || inspectObject(obj);
	}
	else if(obj.isArray()) {
		return inspectArray(obj);
	}
	else {
		return false;
	}
}

exports.getSkelleton = function () {
	var modelNames = Object.keys(models);
	var skelleton = {};
	var modelName;
	var links;
	var schema;
	for(var i = 0; i < modelNames.length; i++) {
		modelName = modelNames[i];
		schema = getSchema(modelName);
		links = getFieldSubLinks(schema);
		skelleton[modelName] = links.isArray() ? links : [];
	}
	console.log(skelleton);
};

