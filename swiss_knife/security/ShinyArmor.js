/**
* ShinyArmor.js adds security features an middlewares to Expressjs.
* Notable middlewares are the Helmet.js library.
*/

var helmet = require('helmet');

exports.security = function(app) {

	// Redirect non-HTTP requests
	app.use(function(req, res, next) {
		var isSecure = config.https && (!req.secure || (req.get('X-Forwarded-Proto') !== 'https'));
		return isSecure ? next() : res.redirect('https://' + req.get('Host') + req.url);
	});

	// XSS protection
	app.use(helmet.iexss());

	// Cache-Control header which sets the no-cache, no-store properties
	if(_NODE_ENV !== 'production') {
		app.use(helmet.cacheControl());
	}

	// Setup Content Policy Security (CSP)
	//app.use(app.use(helmet.csp()));

	//Setup content origin :
	app.use(helmet.xframe('deny'));

	//Prevent MIME sniffing in IE / Chrome :
	app.use(helmet.contentTypeOptions());

	// Force HTTPS transport
	app.use(helmet.hsts(8640000, true));

};