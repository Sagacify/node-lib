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
	return paramNames.contains('callback');
};

Function.prototype._apply = function(thisArg, argsObject){
	var argsArray = [];
	this.getParamNames().forEach(function(paramName){
		argsArray.push(argsObject[paramName]);
	});
	this.apply(thisArg, argsArray);
};