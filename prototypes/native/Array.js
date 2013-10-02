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

// Array.prototype.remove = function(item){
// 	var index = this.indexOf(item);
// 	if(index != -1)
// 		this.splice(index, 1);
// };

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

Array.prototype.populateDevelop = function(callback){
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
			var indexes = me.keys();
			indexes.splice(indexes.length-1, 1);
			async.each(indexes, function(index, callback){
				me[index].context = context;
				me[index].populateDevelop(function(err, popDevObj){
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

Array.prototype.delete = function(item){
	if(typeof item == "function"){
		var callback = item;
		async.each(this, function(doc, callback){
			doc.remove(callback);
		}, function(err){
			callback(err);
		});
	}
	else{
		for(var i = this.length-1; i >= 0; i--){
			if((this[i] && this[i] instanceof mongoose.Types.ObjectId && this[i].equals(item)) || (item && item instanceof mongoose.Types.ObjectId && item.equals(this[i])) || (this[i] == item)){
				this.splice(i, 1);
			}
		}
	}
};

Array.prototype.update = function(args){
	this.forEach(function(doc){
		doc.update(args);
	});
};