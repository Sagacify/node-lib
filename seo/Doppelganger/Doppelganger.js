var Browser = require('zombie');

var browser = new Browser({
	debug: false,
	runScripts: true,
	silent: true,
	maxWait: 3500
});

function hasClass (window) {
	return window.document.querySelector('body.done');
}

exports.clone = function(app) {

	app.use(function (req, res, next) {
		var userAgent = req.headers['user-agent'];
		console.log(userAgent);
		var browserUserAgents = [
			/mozilla/i,
			/konqueror/i,
			/chrome/i,
			/safari/i,
			/msie/i,
			/opera/i,
			/playstation\s3/i,
			/playstation\sportable/i,
			/firefox/i
		];
		var isBrowser = browserUserAgents.reduce(function (a, b) {
			return a || b.test(userAgent);
		}, false);
		var zombieUserAgent = /zombie.js/i;
		var isZombie = zombieUserAgent.test(userAgent);
		if(!isZombie && !isBrowser) {
			browser.visit(config.hostname + req.url/*, {
				debug: false,
				runScripts: true,
				silent: true
			}*/).then(function () {
				var s1 = Date.now(), s2, s3;
				console.log('----- ( 1 ) -----');
				var className = 'done';
				browser.wait(hasClass).then(function() {
					s2 = Date.now();
					console.log('----- ( 2 ) -----');
					console.log('Time @2 -> ' + (s2 - s3));
					res.send(browser.html());
				});
				s3 = Date.now();
				console.log('----- ( 3 ) -----');
				console.log('Time @3 -> ' + (s3 - s1));
				// var hasClass = false;
				// var start = Date.now();
				// while(!hasClass) {
				// 	console.log('Has Class' + browser.html('body.' + className));
				// 	if((start + 8000) > Date.now() || browser.html('body.' + className)) {
				// 		hasClass = true;
				// 		break;
				// 	}
				// }
				//res.send(browser.html());
			}).fail(function (error) {
				var s4 = Date.now();
				console.log('----- ( 4 ) -----');
				console.log('Time @4 -> ' + (s4 - s1));
				console.log(error);
				res.send(404);
			});
		}
		else {
			return next();
		}

	});

};
