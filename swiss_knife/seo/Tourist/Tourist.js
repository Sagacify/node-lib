/**
* Tourist.js is a XML sitemap generator.
* The URLs that are listed in the sitemap are based on Express.js routes.
* For URLs with variable keys, information will be based on MongoDB collection and field names.
*/

var fs = require('fs');
var zlib = require('zlib');
var Browser = require('zombie');
var jstoxml = require('jstoxml');
var mongoose = require('mongoose');
var yamlConfig = require('yaml-config');

var _NODE_ENV = process.env.NODE_ENV || 'development';
var config = yamlConfig.readConfig('../../../../config/config.yaml', _NODE_ENV);

exports = model = mongoose.model.bind(mongoose);
mongoose.connect(config.db.uri, function(error) {
	if(error) {
		throw error;
	}
});

function handleArgs() {}

function handleError(error, type) {
	if(error) {
		if(type === 'critical') {
			throw error;
		}
		console.log(error);
	}
}

function crawlRoot(options) {
	Browser.visit(options.hostname, {
		debug: options.debug,
		runScripts: options.runScripts
	}, waitPageRendering.bind(null, options));
}

function waitPageRendering(error, browser, status, options) {
	function setDOMSelector(window, options) {
		return window.document.querySelector(options.selector);
	}
	handleError(error, 'critical');
	browser.wait(setDOMSelector.bind(null, options), function() {
		function regexToURL(regex) {
			var regexStr = regex.toString();
			return regexStr.slice(1, regexStr.length - 1).replace(/[^a-zA-Z0-9_\-\/:]/gim, '');
		}
		var routes = browser.evaluate('Backbone.history.handlers');
		var route;
		var len = routes.length;
		var asyncConfig = [];
		while(len--) {
			route = regexToURL(routes[len]);
			asyncConfig.push(asyncParallelFunction(route));
		}
	});
}

function getMongoModel(modelName) {
	return mongoose.model(modelName) || handle('ERROR : There probably isn\'t a registered model called ' + modelName, 'critical');
}

function asyncParallelBuild(url) {
	var keys = url.split('/');
	var keypointer;
	if(~(keypointer = url.indexOf(':'))) {
		return function(callback) {
			
		};
	}
	else {
		return function(callback) {
			callback(url);
		};
	}
}

function asyncParallelCheckout(asyncConfig) {

}

crawlRoot({
	// URL options
	hostname: config.hostname,

	// Zombie config
	debug: false,
	runScripts: true,

	// CSS selector config
	selector: 'body.done'
});

(function() {

	Browser.visit(config.hostname, { debug: false, runScripts: true }, function(error, browser, status) {
		if(error) {
			console.log(error);
		}
		else {
			function classSelector(window) {
				//console.log('Window exists : ' + (!!window));
				//console.log('Document exists : ' + (!!window.document));
				return window.document.querySelector('body.done');
			}
			browser.wait(classSelector, function() {
				var routes = browser.evaluate('Backbone.history.handlers');
				//browser.close();

				var keys;
				var path;
				var item;
				var items;
				var itemsLen;
				var route;
				var query;
				var keyPointer;
				var templatURL;
				var asyncConfig = [];
				for(var i = 0, routesLen = routes.length; i < routesLen; i++) {
					route = routes[i].route;
					path = regexToString(route);
					console.log(path);	
					keys = path.split('/');
					(function (keys, keyPointer) {
						asyncConfig.push(function (callback) {
							var routeMapJSON = [];
							if(~(keyPointer = path.indexOf(':'))) {
								try {
									if(!keyPointer) {
										throw 'No model specified';
									}
									var model = mongoose.model(keys[keyPointer - 1 ]);
								}
								catch(e) {
									console.log('ERROR : There probably isn\'t a registered model called ' + keys[index]);
									throw e;
								}
								model.find({}, function (error, items) {
									if(error) {
										throw error;
									}
									var itemsLen = items.length;
									var item;
									var path;
									while(itemsLen--) {
										item = items[itemsLen];
										path = '';
										for(var k = keyPointer, keyLen = keys.length; k < keyLen; k++) {
											path += ~keys[k].indexOf(':') ? keys[k] : item[keys[k].replace(/:/g, '')];
										}
										routeMapJSON.push({
											url: {
												loc: config.hostname + '/' + path
												/*priority: 1.0,
												changefreq: 'monthly'*/
											}
										});
									}
									callback(routeMapJSON);
								});
							}
							else {
								callback(routeMapJSON);
							}
						});
					})(keys, keyPointer);
				}
			}
				var templateXML = jstoxml.toXML(templateJSON, {
					header: true,
					indent: '\t'
				});
				zlib.gzip(new Buffer(templateXML, 'utf8'), function(error, gzippedXMLSitemap) {
					if(error) {
						console.log(error);
					}
					else {
						var filename = './sitemap.xml';
						fs.writeFile(filename, templateXML, function(err) {
							if(err) {
								console.log(err);
							}
							else {
								console.log('Uncompressed XML sitemap created as ' + filename);
								fs.writeFile(filename + '.gz', gzippedXMLSitemap, function(e) {
									if(e) {
										console.log(e);
									}
									else {
										console.log('GZIP compressed XML sitemap created as ' + filename + '.gz');
										process.exit(0);
									}
								});
							}
						});
					}
				});
			});
		}
	});



	/*request.get({ url: config.hostname + '/me/identity'}, function(req, res, data) {
		var body = JSON.parse(data);
		if('me' in body) {
			var identity = body.me;
			var route;
			var keys;
			var path;
			var templatURL;
			for(var i = 0; i < identity.length; i++) {
				route = identity[i];
				path = route.path;
				keys = route.keys;
				if(keys.length > 0) {
					// Query MongoDB in the following way :
					// 		-> collection = URI parameter before the key
					//		-> query = { keyname: '*' }
				}
				// add URL to sitemap XML
				templatURL = {
					url: {
						loc: config.hostname + path,
						priority: 1.0,
						changefreq: 'monthly'
					}
				};
				templateJSON._content.push(templatURL);
			}
			var templateXML = jstoxml.toXML(templateJSON, {
				header: true,
				indent: '\t'
			});
			zlib.gzip(new Buffer(templateXML, 'utf8'), function(error, gzippedXMLSitemap) {
				if(error) {
					console.log(error);
				}
				else {
					var filename = './sitemap.xml';
					fs.writeFile(filename, templateXML, function(err) {
						if(err) {
							console.log(err);
						}
						else {
							console.log('Uncompressed XML sitemap created as ' + filename);
							fs.writeFile(filename + '.gz', gzippedXMLSitemap, function(e) {
								if(e) {
									console.log(e);
								}
								else {
									console.log('GZIP compressed XML sitemap created as ' + filename + '.gz');
									process.exit(0);
								}
							});
						}
					});
				}
			});
		}
	}).on('error', function(error) {
		console.log(error);
	});*/
})();