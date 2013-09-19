var express = require('express');

express.response.SGsend = function(object){
	var code;
	var error;
	var response;

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
	else{
		code = 200;
		response = object;
	}

	this.send({
		meta: {
			code:code,
			error: error
		},
		response: response
	});
};

express.response.handle = function(){
	var me = this;
	return function(err, response){
		me.SGsend(err||response);
	};
};