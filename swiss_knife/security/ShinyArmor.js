/**
* ShinyArmor.js adds security features an middlewares to Expressjs.
* Notable middlewares are : Expressjs's CSRF, Google Caja and the Helmet.js library.
* TODO List :
* -> Find way to implement CSRF tokens for client side template rendering
*/

var helmet = require('helmet');
var caja = require('./GoogleCaja');

exports.security = function(app) {

	// FIX Issue #154
	// Redirect non-HTTP requests
	app.use(function(req, res, next) {
		if((config.https) && (!req.secure) && (req.get('X-Forwarded-Proto') !== 'https')) {
			res.redirect('https://' + req.get('Host') + req.url);
		}
		else {
			next();
		}
	});

	// Caja HTML Sanitizer
	app.use(function(req, res, next) {
		if(req.method.toUpperCase() === 'POST') {
			var keys = Object.keys(req.body);
			var key;
			for(var i = 0; i < keys.length; i++) {
				key = keys[i];
				if(Object.prototype.toString.call(req.body[key]) === '[object String]') {
					req.body[key] = caja.escape(req.body[key]);
				}
			}
		}
		next();
	});

	// Use Helmet.js's http headers and Expressjs's CSRF protection
	/*app.use(express.csrf());
	app.use(function (req, res, next) {
		res.locals.csrftoken = req.session._csrf;
		next();
	});*/

	// XSS protection
	app.use(helmet.iexss());

	// Force HTTPS transport
	app.use(helmet.hsts(8640000, true));

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

};