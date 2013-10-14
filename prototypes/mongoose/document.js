var async = require('async');

mongoose.Document.prototype._toObject2 = mongoose.Document.prototype.toObject;

mongoose.Document.prototype.toObject = function(opts){
	var obj = this._toObject2(opts);
	if(opts && opts.remove){
		opts.remove.forEach(function(fieldToRemove){
			obj.deleteRecursiveField(fieldToRemove);	
		});
	}
	return obj;
};