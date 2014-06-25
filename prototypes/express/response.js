var express = require('express');
var SGError = require('../../errorhandler/SagaError');

express.response.SGsend = function(object, cors) {
	var code;
	var error;
	var response;
	var length;


	if(cors){
		this.header("Access-Control-Allow-Origin", "*");
		this.header("Access-Control-Allow-Headers", "X-Requested-With");
	}

	if(object instanceof SGError){
		console.log("-----> SEND SG ERRROR");
		code = object.code;
		error = {
			type: object.type,
			verbose: object.verbose,
		};
		if ('args' in object) {
			error.args = object.args;
		};
	}
	else if(object instanceof Error){
		this.SGsend(new SGError(object), cors);
	}
	else {
		code = 200;
		response = object;
		length = object instanceof Array ? object.length : 1;
	}

	if(code == 200) {
		// this.send({timestamp:new Date(), body:(response||null)});
		this.send(response||null);
	}
	else {
		console.log("SEND ERROR");
		this.send(code, error);
	}
};

express.response.handle = function(){
	var me = this;
	return function(err, response){
		me.SGsend(err||response);
	};
};