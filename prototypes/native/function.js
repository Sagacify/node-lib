var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

Function.prototype.getParamNames = function(){
  var fnStr = this.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
  if(result === null)
     result = [];
  return result;
};

Function.prototype.hasCallback = function(){
	var paramNames = this.getParamNames();
	return paramNames.contains('callback') || paramNames.contains('next');
};

Function.prototype._apply = function(thisArg, argsObject, callback){
	var argsArray = [];
	var hasCallback = false;
	this.getParamNames().forEach(function(paramName){
		if(paramName == "args"){
			argsArray.push(argsObject);
		}
		else if(paramName == "callback"||paramName == "next"){
			argsArray.push(callback);
			hasCallback = true;
		}
		else if(argsObject){
			argsArray.push(argsObject[paramName]);
		}
	});
	if(hasCallback || !callback){
		return this.apply(thisArg, argsArray);
	}
	else if(callback){
		var ret = this.apply(thisArg, argsArray);
		if(ret instanceof Error||ret instanceof SGError)
			callback(ret);
		else
			callback(null, ret);
		return ret;
	}
};