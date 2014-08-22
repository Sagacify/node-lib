/**
* ShinyArmor.js adds security features an middlewares to Expressjs.
* Notable middlewares are the Helmet.js library.
*/

var helmet = require('helmet');

exports.security = function(app) {

	// Redirect non-HTTP requests
	// app.use(function (req, res, next) {

	// 	var isSecure = config.https && (!req.secure || (req.get('X-Forwarded-Proto') !== 'https'));
	// 	console.log("isSecure");
	// 	//console.log('https://' + req.get('Host'));
		
	// 	return isSecure ? next() : res.redirect('https://' + req.get('Host') /*+ req.url*/);
	// });

	app.use(function(req, res, next) {
		return (config.https && (req.get('X-Forwarded-Proto') !== 'https')) ?
				res.redirect('https://' + req.get('Host') + req.url)
				: next();
		// if((config.https) && (!req.secure) && (req.get('X-Forwarded-Proto') !== 'https')) {
		// 	res.redirect('https://' + req.get('Host') + req.url);
		// }
		// else
		// 	next();
	});

	// XSS protection
	app.use(helmet.xssFilter()); //Kev : helmet.iexss() deprecated -> changing to this

	// Cache-Control header which sets the no-cache, no-store properties
	// if(NODE_ENV !== 'production') {
	// 	app.use(helmet.cacheControl());
	// }

	// Setup Content Policy Security (CSP)
	//app.use(app.use(helmet.csp()));

	//Setup content origin :
	app.use(helmet.xframe('deny'));

	//Prevent MIME sniffing in IE / Chrome :
	app.use(helmet.nosniff()); //Kev : helmet.contentTypeOptions() deprecated -> changing to this

	// Force HTTPS transport
	app.use(helmet.hsts({maxAge:8640000, includeSubdomains:true}));

};