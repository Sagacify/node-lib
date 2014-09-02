var async = require('async');
var utils = require('../utils');


mongoose.Document.prototype.willDo = function(action, params, callback){
	if(typeof this["will"+action.capitalize()] == "function" && this.schema.documentActions[action]){
		return this["will"+action.capitalize()]._apply(this, params, callback);
	}
	else{
		return callback?callback(null):null;
	}
};

mongoose.Document.prototype.doDo = function(action, params, callback){
	if(typeof this[action] == "function" && this.schema.documentActions[action]){
		this[action]._apply(this, params, callback);
    } else{
		callback(new SGError());
    }
};


mongoose.Document.prototype.didDo = function(action, params){
	if(typeof this["did"+action.capitalize()] == "function"  && this.schema.documentActions[action])
		return this["did"+action.capitalize()]._apply(this, params);
};