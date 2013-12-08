String.prototype.startsWith = function(str){
	return this.slice(0, str.length) === str;
};

String.prototype.endsWith = function(str){
	return this.slice(this.length - str.length, this.length) === str;
};

String.prototype.base64Sanitize = function(base64) {
	return base64.replace(/\//g, '-').replace(/\+/g, '_');
};

String.prototype.capitalize = function() {
	var capitalized = "";
	var split = this.split('.');
	split.forEach(function(part){
		capitalized += part.charAt(0).toUpperCase()+part.slice(1);
	});
    return capitalized;
};

String.prototype.inject = function(occurences){
	var strToReturn = this;
	occurences.forEach(function(occurence){
		strToReturn = strToReturn.replace("%s", occurence);
	});
	return strToReturn;
};

String.prototype.equals = function(item){
	return this == item;
};