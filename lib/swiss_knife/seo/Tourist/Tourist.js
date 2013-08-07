/**
* Tourist.js is a XML sitemap generator.
* The URLs that are listed in the sitemap are based on Express.js routes.
* For URLs with variable keys, information will be based on MongoDB collection and field names.
*/

var fs = require('fs');
var http = require('http');
var zlib = require('zlib');
var request = require('request');
var jstoxml = require('jstoxml');
var mongoose = require('mongoose');
var yamlConfig = require('yaml-config');

var _NODE_ENV = process.env.NODE_ENV || 'development';
var config = yamlConfig.readConfig('../../../config/config.yaml', _NODE_ENV);

exports = model = mongoose.model.bind(mongoose);
mongoose.connect(config.db.uri, function(error) {
	if(error) {
		throw error;
	}
});

(function() {
	var templateJSON = {
		_name: 'urlset',
		_attrs: {
			xmlns: 'http://www.google.com/schemas/sitemap/0.84',
			'xmlns:xsi' : 'http://www.w3.org/2001/XMLSchema-instance',
			'xsi:schemaLocation': 'http://www.google.com/schemas/sitemap/0.84\nhttp://www.google.com/schemas/sitemap/0.84/sitemap.xsd'
		},
		_content: []
	};
	request.get({ url: config.hostname + '/me/identity'}, function(req, res, data) {
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
	});
})();