var async = require('async');
var utils = require('../utils');


var base64File = function(args, callback){
	if(typeof args == "string"){
		args = {
			base64data: args,
			extension: 'jpg'
		}
	}
	console.log('args')
	console.log(args)
	if(!args.base64data){
		return callback(null, {_id:null});
	}
	if(args.base64data.startsWith('data')){
		args.base64data = args.base64data.split(',')[1];
	}
	var me = this;
	var FileModel = model('File');
	FileModel.createFile(args, callback);
};

mongoose.Document.prototype.setBase64File = function(path, val, callback){
	if(!val || typeof val == "string" && val.startsWith('http')){
		this._set(path, val);
		if(callback)
			callback();
	}
	else{
		var me = this;
		base64File(val, function(err, file){
			me._set(path, file._id);
			if(callback)
				callback();
		});
	}
};

mongoose.Document.prototype.setBase64Files = function(path, vals, callback){
	if(vals instanceof Array && !vals.length || vals instanceof Array && typeof vals[0] == "string" && vals[0].startsWith('http')){
		this._set(path, vals);
		if(callback)
			callback();
	}
	else{
		var me = this;
		var files = [];
		async.each(vals.keys(), function(key, callback){
			base64File(vals[key], function(err, file){
				files[key] = file;
				callback(err);
			});
		}, function(err){
			me._set(path, files);
			if(callback)
				callback();
		});
	}
};