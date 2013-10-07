var express = require('express');
var app = express();
var fs = require('fs');

// App settings and middleware
app.configure(function() {
	// Don't show errors explicitly on screen
	app.set('showStackError', false);
	// Express's Request parser
	app.use(express.bodyParser());
	// Adds support for HTTP PUT and DELETE methods
	app.use(express.methodOverride());
	// Express's GZIP implementation
	app.use(express.compress());
	// Express's Cookie parser
	app.use(express.cookieParser());
	// Makes Express use the specified controllers instead of serving static files
	app.use(app.router);
	// Use static file if no controllers were able to respond to the request
	app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res) {
	fs.createReadStream('./index.html').pipe(res);
});

var port = process.env.PORT || 8000;
app.listen(port);

console.log('Express app started on port ' + port);
