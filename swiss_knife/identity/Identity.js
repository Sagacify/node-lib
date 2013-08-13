/**
* Identity.js is a route which returns Express's app.routes object.
* For security reasons, this can only be run in development mode. 
*/

exports.me = function(app) {

	app.get('/me/identity', function(req, res) {
		console.log(app.routes.get);
		res.send({ me: app.routes.get });
	});

};