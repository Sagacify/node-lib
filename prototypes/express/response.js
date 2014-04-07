var express = require('express');
var SGError = require('../../errorhandler/SagaError');

express.response.SGsend = function(object) {
	var code;
	var error;
	var response;
	var length;

	console.log('headers')
	console.log(this)

	this.header("Access-Control-Allow-Origin", "*");
	this.header("Access-Control-Allow-Headers", "X-Requested-With");

	if(object instanceof SGError){
		code = object.code;
		error = {
			type: object.type,
			verbose: object.verbose
		};
	}
	else if(object instanceof Error){
		code = 600;
		error = {
			type: 'generic',
			verbose: 'Oops, something bad happened.'
		};
	}
	else {
		code = 200;
		response = object;
		length = object instanceof Array ? object.length : 1;
	}

	if(code == 200){
		// this.send({timestamp:new Date(), body:(response||null)});
		this.send(response||null);
	}
	else{
		this.send(code, error);
	}
};

express.response.handle = function(){
	var me = this;
	return function(err, response){
		me.SGsend(err||response);
	};
};