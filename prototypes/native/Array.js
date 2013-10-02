Array.prototype.contains = function(item){
	return !!~this.indexOf(item);
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

var async = require('async');

Array.prototype.populateDevelop = function(context, callback){
	var context = this.context;
	if(this.length == 0 || !(this[0] instanceof mongoose.Document)){
		callback(null, this);
	}
	else{
		var model = this[0].getModel();
		var fieldsToPopulate = model.populateOptions(context.scope).fields;
		var fieldsToPopulateString = "";
		fieldsToPopulate.forEach(function(fieldToPopulate){
			fieldsToPopulateString += fieldToPopulate + " ";
		});

		var me = this;
		var populateDevelopDocs = function(){
			async.each(this.keys(), function(index, callback){
				me[index].populateDevelop(context, function(err, popDevObj){
					if(!err){
						me[index] = popDevObj;
					}
					callback(err);
				});
			}, function(err){
				callback(err, me);
			});
		};

		if(fieldsToPopulateString){
			model.populate(this, fieldsToPopulateString, function(err, popDocs){
				populateDevelopDocs();
			});
		}
		else{
			populateDevelopDocs();
		}
	}
};