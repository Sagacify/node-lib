var utilsPaths = ["./slug", "./swiss_knife/middlewares/middlewares"];

utilsPaths.forEach(function(path){
	var elem = require(path);
	for(var meth in elem){
		exports[meth] = elem[meth];
	}
});








	