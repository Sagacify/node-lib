Array.prototype.contains = function(item){
	return this.indexOf(item) != -1;
};

// Array.prototype.containsID = function(_id){
	// return this.filter(function(itemID){
		// var itemIDString = itemID&&itemID.toString?itemID.toString():itemID;
		// var _idString = _id&&_id.toString?_id.toString():_id;
		// return itemIDString == _idString;
	// }).length > 0;
// };

Array.prototype.containsObject = function(_id){
	return this.filter(function(item){
		if(!item)
			return false;
		return item._id == _id || (item._id && item._id.toString() == _id);
	}).length > 0;
};

Array.prototype.removeItem = function(item){
	var index  = -1;
	if(typeof item.equals == 'function') {
		for (var i = 0; i < this.length; i++) {
			if (item.equals(this[i])) {
				index = i;
				break;
			}
		}
	}
	else {
		index = this.indexOf(item);
	}
	if(index != -1) {
		this.splice(index, 1);
	}
};

Array.prototype.merge = function(array){
	var me = this;
	array.forEach(function(item){
		me.push(item);
	});
};

String.prototype.startsWith = function(str){
	return this.slice(0, str.length) == str;
};

String.prototype.endWith = function(str){
	return this.slice(this.length-str.length, this.length) == str;
};

String.prototype.base64Sanitize = function(base64) {
	return base64.replace(/\//g, '-').replace(/\+/g, '_');
};

