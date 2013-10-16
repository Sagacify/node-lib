Array.prototype.contains = function(item){
	if(this[0] instanceof Object){
		var _id = item instanceof Object?item._id:item;
		for(var i = 0; i < this.length; i++){
			if(this[i]._id && this[i]._id.equals(item))
				return true;
		}
		return false;
	}
	else{
		return !!~this.indexOf(item);
	}
};

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

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return !(a.indexOf(i) > -1);});
};

Array.prototype.populateDevelop = function(callback){
	if(this.length == 0 || !(this[0] instanceof mongoose.Document)){
		callback(null, this);
	}
	else{
		var model = this[0].getModel();
		model.populateDevelop.apply(this, [callback]);
	}
};
