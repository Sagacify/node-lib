
Array.prototype.contains = function(item){
	
	// var founded =  !!~this.robustIndexOf(item);
	// console.log("founded " +founded);

	// return founded;

	if (item && typeof item.isMongooseDocument == "function" && item.isMongooseDocument()) {
		for (var i = 0; i < this.length; i++) {
			if (this[i].isMongooseDocument() && this[i]._id.toString() == item._id.toString()) {
				return !!~i;
			};
		};
		return !!~-1;
	}
	else{
		// this.indexOf(item) != -1
		return !!~this.indexOf(item);
	}
};

// Array.prototype.robustIndexOf = function(item){
// 	console.log('PROCESSSING');
// 	console.log(item);
// 	console.log(this);
// 	if (!item) {
// 		return -1;
// 	};

// 	// if (item.isMongooseDocument()) {
// 	// 	console.log('is a isMongooseDocument');
// 	// 	for (var i = 0; i < this.length; i++) {
// 	// 		if (this[i].isMongooseDocument() && this[i]._id.equals(item._id)) {
// 	// 			return i;
// 	// 		};
// 	// 	};
// 	// 	return -1;
// 	// }

// 	//Add other specific comparators
// 	var index = this.indexOf(item);
// 	console.log("index "+ index);
// 	return index;
// }

	//Add other specific comparators
// 	return this.indexOf(item);
// }


Array.prototype.merge = function(array){
	var me = this;
	array.forEach(function(item){
		me.push(item);
	});
};

Array.prototype.popFirst= function(){
	return this.splice(0, 1)[0];
};

Array.prototype.last = function(){
	return this[this.length-1];
};

Array.prototype.containsObject = function(_id){
	return this.filter(function(item){return item._id == _id;}).length > 0;
};

Array.prototype.remove = function(item){
	if (!item) {
		return;
	};
	var index = this.indexOf(item);
	if(index != -1)
		this.splice(index, 1);
};

Array.prototype.equals = function(array){
	for(var i = 0; i < this.length; i++){
		if(this[i] != array[i])
			return false;
	}
	return true;
};

Array.prototype.indexes = function(){
	var indexes = [];
	for(var i = 0; i < this.length; i++){
		indexes.push(i);
	}
	return indexes;
};

Array.prototype.diff = function(a) {
	return this.filter(function (i) {
		return !(a.indexOf(i) > -1);
	});
};

Array.prototype.populateDevelop = function(callback){
	if(this.length == 0 || !(this[0] instanceof mongoose.Document)){
		callback(null, this);
	}
	else{
		Object.defineProperty(this, "schema", {
			writable: true,
			value: this[0].schema
		});
		this[0].schema.populateDevelop.apply(this, [callback]);
	}
};

Array.prototype.sgRemove = function(item){
	for(var i = this.length-1; i >= 0; i--){
		if((this[i] && this[i] instanceof mongoose.Types.ObjectId && this[i].equals(item)) || (item && item instanceof mongoose.Types.ObjectId && item.equals(this[i])) || (this[i] == item)){
			this.splice(i, 1);
		}
	}
};

Array.prototype.pairs = function(){
	var pairArray = [];
	var valueA, valueB;
	for(var i = 0; i<this.length; i++){
		valueA = this[i];
		for(var j = i+1; j<this.length; j++){
			valueB = this[j]; 
		}
		pairArray.push([valueA, valueB]);
	}
	return pairArray;
}
