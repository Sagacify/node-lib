require('./state');
require('./ModelState');
require('./APIState');

exports.performPathOperations = function(req){
	var path = req.url;
	path = path.split('/');


}


var launchFirstState = function(splittedPath){
	var firstState = new APIState(splittedPath);
	firstState.computeState();
}