



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

//In an ids array
Array.prototype.containsId = function(anId){
	return this.containsWithEqualFunction(anId, function(id){
		return id.equals(anId);
	});
}

//In an docs array
Array.prototype.containsDoc = function(docToSearchFor){
	return this.containsWithEqualFunction(function(doc){
		return doc._id.equals(docToSearchFor._id);
	});
}

Array.prototype.containsWithEqualFunction = function(equalFunction){
	return this.filter(equalFunction).length > 0;
}

Array.prototype.containsIdOrDoc = function(_id){
	
	return this.containsWithEqualFunction(function(item){
		return item && ((item._id || item)).equals(_id._id || _id);
	});

	// if(!this.length){
	// 	return false;
	// }
	// if(this[0].isObject()){
	// 	return this.containsDoc({_id:_id});
	// }
	// else{
	// 	return this.contains(_id);
	// }
};


//Deprecated see containsWithEqualFunction
Array.prototype.containsObject = function(_id){
	return this.filter(
		function(item){
			return item._id.equals(_id);
		}).length > 0;
};

//Deprecated see containsWithEqualFunction
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

Array.prototype.intersect = function(a){
	return this.filter(function (i) {
		return (a.indexOf(i) > -1);
	});
};

Array.prototype.populateDevelop = function(callback){
        if(this.length == 0 || !(this[0] instanceof mongoose.Document)){
                callback(null, this);
        } else {
                this.setHidden('schema', this[0].schema);
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
};

Array.prototype.removeDuplicates = function () {
	var arr = this;
	return arr.filter(function (item, pos) {
		return arr.indexOf(item) === pos;
	});
};
