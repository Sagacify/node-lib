/**
* Tourist.js is a XML sitemap generator.
* The URLs that are listed in the sitemap are based on Express.js routes.
* For URLs with variable keys, information will be based on MongoDB collection and field names.
*/

var fs = require('fs');
var zlib = require('zlib');
var async = require('async');
var Browser = require('zombie');
var jstoxml = require('jstoxml');
var mongoose = require('mongoose');

function handleError(error, type) {
	if(error) {
		console.log('CALLER');
		console.log(arguments);
		console.log(arguments.callee.caller.toString());
		// if(type === 'critical' || !type) {
		// 	throw error;
		// }
		console.log(error);
	}
}

exports = model = mongoose.model.bind(mongoose);
mongoose.connect('localhost/bc_dev', handleError);

//function handleArgs() {}

function crawlRoot(options) {
	Browser.visit(options.hostname, {
		debug: options.debug,
		runScripts: options.runScripts
	}, function(error, browser, status) {
		waitPageRendering(error, browser, status, options);
	});
}

function waitPageRendering(error, browser, status, options) {
	function setDOMSelector(window, options) {
		return window.document.querySelector(options.selector);
	}
	handleError(error, 'critical');
	browser.wait(setDOMSelector.bind(null, options), function () {
		function regexToURL(regex) {
			var regexStr = regex.toString();
			return regexStr.slice(1, regexStr.length - 1).replace(/[^a-zA-Z0-9_\-\/:]/gim, '');
		}
		var routes = browser.evaluate('Backbone.history.handlers');
		var route;
		var len = routes.length;
		var asyncConfig = [];
		while(len--) {
			route = regexToURL(routes[len].route);
			asyncConfig.push(asyncParallelBuild(route));
		}
		asyncParallelCheckout(asyncConfig, options);
	});
}

function getMongoModel(modelName) {
	return mongoose.model(modelName) || handleError('ERROR: There probably isn\'t a registered model called ' + modelName, 'critical');
}

function getURIElementCount(keys) {
	return (keys.length > 2) ? keys.length : handleError('ERROR: The route format should be "/modelname/:key"', 'critical');
}

function constructURI(obj, firstPointer, elems) {
	var url = [];
	for(var i = 0, len = elems.length; i < len; i++) {
		url.push(i >= firstPointer && ~elems[i].indexOf(':') ? obj[elems[i].replace(/:/g, '')] : elems[i]);
	}
	return url.join('/');
}

function asyncParallelBuild(url) {
	if(~url.indexOf(':')) {
		var elems = url.split('/');
		var len = getURIElementCount(elems);
		var keys = [];
		var firstPointer;
		for(var i = 1; i < len; i++) {
			if(elems[len].indexOf(':')) {
				firstPointer = firstPointer ? firstPointer : i;
				keys.push(elems[len]);
			}
		}
		return getCompositeURI(elems[len - 1], keys, firstPointer, elems);
	}
	else {
		//console.log('URL');
		//console.log(url);
		return function (callback) {
			callback(null, [url]);
		};
	}
}

function getCompositeURI(modelstring, keys, firstPointer, elems) {
	var modelname = modelstring.replace(/:/g, '');
	var model = getMongoModel(modelname);
	return function (callback) {
		model.find({}, function (error, items) {
			handleError(error);
			var uris = [];
			var lenI = items.length;
			while(lenI--) {
				uris.push(constructURI(items[lenI], firstPointer, elems));
			}
			callback(null, uris);
		});
	};
}

function configUrl(hostname, uri) {
	return (hostname[hostname.length - 1] !== '/') && (uri[uri.length - 1] !== '/') ? hostname + '/' + uri : hostname + uri;
}

function asyncParallelCheckout(asyncConfig, options) {
	async.parallel(asyncConfig, function(error, results) {
		console.log(results);
		handleError(error);
		var templateJSON = {
			_name: 'sitemapindex',
			_attrs: {
				xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
				'xmlns:xsi' : 'http://www.w3.org/2001/XMLSchema-instance',
				'xsi:schemaLocation': 'http://www.sitemaps.org/schemas/sitemap/0.9 ' +
									'http://www.sitemaps.org/schemas/sitemap/0.9/siteindex.xsd'
			},
			_content: []
		};
		var matrixLen = results.length;
		var urisListLen;
		var urisList;
		var uris = [];
		while(matrixLen--) {
			urisList = results[matrixLen];
			if(urisList && (urisList instanceof Array)) {
				urisListLen = urisList.length;
				while(urisListLen--) {
					uris.push({
						url: {
							loc: configUrl(options.hostname, urisList[urisListLen])
							/*priority: 1.0,
							changefreq: 'monthly'*/
						}
					});
				}
			}
		}
		templateJSON._content = uris;
		magicJSONtoXML(templateJSON);
	});
}

function magicJSONtoXML(templateJSON) {
	var templateXML = jstoxml.toXML(templateJSON, {
		header: true,
		indent: '\t'
	});
	var filename = './sitemap.xml';
	dataGzipAndSave(filename, templateXML);
}

function dataGzipAndSave(filename, data) {
	gzip(data, function(gzippedData) {
		saveDataToFs(filename, data, function() {
			console.log('XML sitemap created as ' + filename);
			saveDataToFs(filename + '.gz', gzippedData, function() {
				console.log('GZIPed XML sitemap created as ' + filename + '.gz');
				process.exit(0);
			});
		});
	});
}

function gzip(data, callback) {
	zlib.gzip(new Buffer(data, 'utf8'), function(error, gzippedData) {
		handleError(error);
		callback(gzippedData);
	});
}

function saveDataToFs(filename, data, callback) {
	fs.writeFile(filename, data, function(error) {
		handleError(error);
		callback();
	});
}

crawlRoot({
	// URL options
	hostname: 'http://localhost:8000/',
	// Zombie config
	debug: false,
	runScripts: true,
	// CSS selector config
	selector: 'body.done'
});
