//var phantomProxy = require('phantom-proxy');
//var phantom = require('phantom');
var Browser = require('zombie');

exports.clone = function(app) {

	app.use(function(req, res, next) {

		//console.log('User-Agent -> ' + req.headers['user-agent']);
		var userAgent = req.headers['user-agent'];
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
		var isBrowser = browserUserAgents.reduce(function(a, b) {
			return a || b.test(userAgent);
		}, false);
		//console.log('Is Browser -> ' + isBrowser + ' and len is ' + browserUserAgents.length);
		//var phantomUserAgent = /phantomjs/i;
		//var isPhantom = phantomUserAgent.test(userAgent);
		var zombieUserAgent = /zombie.js/i;
		var isZombie = zombieUserAgent.test(userAgent);
		if(/*!isPhantom*/ !isZombie && !isBrowser) {
			//console.log('in -> ' + req.url);
			//var start = new Date().getTime();
			Browser.visit(config.hostname + req.url, { debug: false, runScripts: true }, function(error, browser, status) {
				if(error) {
					console.log(error);
				}
				else {
					function classSelector(className, res) {
						var hasClass = browser.html('body.done');
						return !hasClass ? classSelector(className, res) : res.send(browser.html());
					}
					//console.log('Status -> ' + status);
					classSelector('done', res);
				}
			});
			/*phantom.create(function (ph) {
				console.log('+1');
				return ph.createPage(function (page) {
					console.log('+2');
					return page.open(config.hostname + req.url, function (status) {
						console.log('+3');
						if(status !== 'success') {
							console.log('Unable to access network');
						}
						else {
							function selectorPresence(page, className, res, startTime) {
								if((new Date().getTime() - startTime) > 5000) {
									res.send(500);
									return phantom.exit();
								}
								else {
									function evaluate(classname) {
										return 'function() {'
											+ 'return (document.getElementsByClassName("' + classname + '").length > 0) ? true : false;'
										+ '}';
									}
									(function phantomEval(className) {
										return page.evaluate(evaluate(className), function (hasClass) {
											console.log('HasClass -> ' + hasClass);
											if(hasClass === true) {
												//clearInterval(selectorPresenceCheck);
												page.evaluate(function() {
													return document.getElementsByTagName('html')[0].innerHTML;
												}, function(html) {
													//console.log(html);
													//console.log(typeof html);
													res.send(html || 500);
													//return phantom.exit();
												});
											}
											else {
												phantomEval(className);
											}
											//return phantom.exit();
										});
									})(className);
								}
							}
							//var selectorPresenceCheck = setInterval(selectorPresence(page, 'done', res, new Date().getTime()), 300);
							selectorPresence(page, 'done', res, new Date().getTime());
						}
					});
				});
			}, {
				binary: 'lib/swiss_knife/seo/Doppelganger/phantomjs-1.9.1-macosx/bin/phantomjs'
			});*/
		}
		else {
			//console.log('NEXT');
			next();
		}

	});

};
