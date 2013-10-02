Object.prototype.clone = function () {
	var clone = {};
	var keys = Object.keys(this);
	var i = keys.length;
	var key;
	while(i--) {
		key = keys[i];
		if(this[key] instanceof Object) {
			console.log(this[key]);
			clone[key] = this[key].clone();
		}
		else {
			clone[key] = this[key];
		}
		 
	}
	return clone;
};

Object.prototype.merge = function(obj){
	for (var key in obj){
		if(!(key in Object.prototype)){
			try {
				// Property in destination object set; update its value.
				if (obj[key].constructor == Object)
					this[key] = obj[key].merge(obj[key]);
				else
					this[key] = obj[key];
			} 
			catch(e) {
				// Property in destination object not set; create it and set its value.
				this[key] = obj[key];
			}
		}
	}
	return this;
};

Object.prototype.getRecursiveField = function(field){
	var splitField = field.split('.');
	var toReturn = this;
	splitField.forEach(function(fieldPart){
		if(toReturn)
			toReturn = toReturn[fieldPart];
	});
	return toReturn;
};

Object.prototype.setRecursiveField = function(field, value){
	var splitField = field.split('.');
	var objToSet = this;
	for(var i = 0; i < splitField.length-1; i++){
		objToSet = objToSet[splitField[i]];
		if(!objToSet)
			return this;
	}
	objToSet[splitField[splitField.length-1]] = value;
	return this;
};

Object.prototype.deleteRecursiveField = function(field){
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

Object.prototype.isObject = function(){
	return Object.prototype.toString.call(this) === '[object Object]';
};

Object.prototype.isArray = function(){
	return Object.prototype.toString.call(this) === '[object Array]';
};

Object.prototype.isString = function(){
	return Object.prototype.toString.call(this) === '[object String]';
};

Object.prototype.isFunction = function(){
	return Object.prototype.toString.call(this) === '[object Function]';
};

Object.prototype.isVirtualType = function(){
	return this.constructor.name === "VirtualType";
};