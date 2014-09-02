var is = require('../../strict_typing/validateType');
var obj_proto = {};

obj_proto.sgClone = function () {
	if ((this == null) || ((typeof this) !== 'object')) {
		return this;
	}
	else {
		var copy = this.constructor();
		for(var attr in this) {
			if(this.hasOwnProperty(attr)) {
				copy[attr] = this[attr];
			}
		}
		return copy;
	}
};

obj_proto.cloneToObject = function () {
	if ((this == null) || ((typeof this) !== 'object')) {
		return this;
	}
	else {
		var copy = {};
		for(var attr in this) {
			if(this.hasOwnProperty(attr)) {
				copy[attr] = this[attr];
			}
		}
		return copy;
	}
};

obj_proto.merge = function(obj){
	if(obj && obj.isObject()){
		var me = this;
		obj.keys().forEach(function(key){
			me[key] = obj[key];
		});
	}
	return this;
};

obj_proto.keys = function keys() {
	return Object.keys(this);
};

obj_proto._get = function(field){
	var splitField = field.split('.');
	var toReturn = this;
	splitField.forEach(function(fieldPart){
		if(toReturn)
			toReturn = toReturn[fieldPart];
	});
	return toReturn;
};

obj_proto._set = function(field, value){
	var splitField = field.split('.');
	var objToSet = this;
	for(var i = 0; i < splitField.length-1; i++){
		if(!objToSet[splitField[i]])
			objToSet[splitField[i]] = {};
		objToSet = objToSet[splitField[i]];
	}
	objToSet[splitField.last()] = value;
	return this;
};

obj_proto.deleteRecursiveField = function(field){
	var splitField = field.split('.');
	var delContainer = this;
	for(var i = 0; i < splitField.length-1; i++){
		delContainer = delContainer[splitField[i]];
		if(!delContainer)
			return this;
	}
	delete delContainer[splitField[splitField.length-1]];
	return this;
};

obj_proto.getType = function() {
	return Object.prototype.toString.call(this);
};


obj_proto.isMongooseDocument = function(){
	if (!this.isObject()) {
		return false;
	};

	return this instanceof mongoose.Document;
}

obj_proto.isObject = function(){
	return is.Object(this);
};

obj_proto.isString = function(){
	return is.String(this);
};

obj_proto.isNumber = function(){
	return is.Number(this);
};

obj_proto.isBoolean = function(){
	return is.Boolean(this);
};

obj_proto.isDate = function(){
	return is.Date(this);
};

obj_proto.isArray = function(){
	return is.Array(this);
};

obj_proto.isFunction = function(){
	return is.Function(this);
};

obj_proto.disassemble_Object = function (key) {
	function index(obj, i) {
		return obj[i];
	}
	return key.split('.').reduce(index, this);
};

obj_proto.pathsKeys = function() {
	var me = this;
	return this.isObject() ? this.keys().reduce(function (base, ele) {
// <<<<<<< HEAD
// 		var children = me[ele]?me[ele].pathsKeys():[''];
// =======
		//to be fixed
		if(!me[ele]){
			return base;
		}
		var children = me[ele].pathsKeys();
// >>>>>>> dev
		return base.concat(children.map(function (child) {
			return ele + (child ? '.' + child : '');
		}));
	}, []) : [''];
};

obj_proto.setHidden = function(path, val){
	// if (path == "context" && typeof this == 'function') {
	// 	throw "ERROR888"
	// };
	Object.defineProperty(this, path, {
		writable: true,
		value: val
	});
};

obj_proto.setContext = function(context){
	this.setHidden('context', context);
	return this;
};

obj_proto.mapKey = function(key){
	return this.map(function(item){
		return item[key];
	});
};

obj_proto.mapId = function(){
	return this.mapKey('_id');
};

obj_proto.sgContext = function(){
	return this[this.length-1];
};

for(var key in obj_proto){
	Object.defineProperty(Object.prototype, key, {
		writable: true,
		value: obj_proto[key]
	});
}